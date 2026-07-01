// ============================================================
// HADES XMD — pair.js
// Structure identique à bots/knutxmd/pair.js
// Gestion users isolée par session : sessions/{number}/
// Code de pairing fixe : HADESXMD
// ============================================================

import express from 'express';
import fs      from 'fs-extra';
import path    from 'path';
import pino    from 'pino';
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  Browsers,
  delay
} from '@whiskeysockets/baileys';

const router  = express.Router();

// =======================
// CHEMINS
const SESSIONS_BASE = './bots/hadesxmd/sessions';
const CONFIG_FILE   = path.resolve('./bots/hadesxmd/config.json');

// =======================
// LIMITES
const MAX_BOTS        = 25;
const MAX_RETRIES     = 3;
const PAIRING_TIMEOUT = 5 * 60 * 1000;

// =======================
// CONFIG GLOBALE HADES
let HADES_CONFIG = {};
try { HADES_CONFIG = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); } catch {}
const PREFIXE      = HADES_CONFIG.PREFIXE_COMMANDE || '.';
const MAIN_OWNERS  = HADES_CONFIG.MAIN_OWNERS || [];

// =======================
// ÉTAT GLOBAL — chaque entrée isolée
let ACTIVE_BOTS = 0;
const retryCount   = new Map();
const pairingLocks = new Set();
const bots         = new Map();
// bots : number → { sock, connected, krinyxUserId, commands, sessionDir,
//                   getConfig, saveConfig, getOwners, getSudo, saveSudo,
//                   getGroupConfig, setGroupProtection }

// =======================
// UTILITAIRES
const fmt = (num) => {
  let d = num.replace(/\D/g, '');
  if (d.startsWith('0')) d = d.replace(/^0+/, '');
  return d;
};

const getBareNumber = (input) => {
  if (!input) return '';
  // Retire le suffixe :device (ex: 237XXXX:12@s.whatsapp.net → 237XXXX)
  return String(input).split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
};

const getMessageText = (msg) =>
  msg.message?.conversation ||
  msg.message?.extendedTextMessage?.text ||
  msg.message?.imageMessage?.caption ||
  msg.message?.videoMessage?.caption || '';

const removeSession = async (dir) => {
  if (await fs.pathExists(dir)) await fs.remove(dir);
};

// =======================
// HELPERS PAR SESSION
// Même architecture que knutxmd/pair.js
// Tout est dans sessions/{number}/
function makeSessionHelpers(sessionDir) {

  const configPath = path.join(sessionDir, 'config.json');
  const sudoPath   = path.join(sessionDir, 'sudo.json');
  const groupPath  = path.join(sessionDir, 'group.json');
  const credsPath  = path.join(sessionDir, 'creds.json');

  // ── config.json ──────────────────────────────────────────
  const getConfig = () => {
    try {
      if (!fs.existsSync(configPath)) return { prefix: '.', owners: [] };
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch { return { prefix: '.', owners: [] }; }
  };

  const saveConfig = (data) => {
    try { fs.writeFileSync(configPath, JSON.stringify(data, null, 2)); } catch {}
  };

  // ── creds.json → owner number + LID (source de vérité) ───
  const getCredsIdentity = () => {
    try {
      if (!fs.existsSync(credsPath)) return { ownerNumber: null, ownerLid: null };
      const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
      return {
        ownerNumber: getBareNumber(creds?.me?.id  || ''),
        ownerLid:    getBareNumber(creds?.me?.lid || '')
      };
    } catch { return { ownerNumber: null, ownerLid: null }; }
  };

  // ── owners = creds + config + MAIN_OWNERS ────────────────
  const getOwners = () => {
    const { ownerNumber, ownerLid } = getCredsIdentity();
    const cfg   = getConfig();
    const extra = cfg.owners || [];
    const all   = new Set();
    if (ownerNumber) all.add(ownerNumber);
    if (ownerLid)    all.add(ownerLid);
    extra.forEach(n => all.add(getBareNumber(n)));
    // Ajouter MAIN_OWNERS depuis config.json global HADES
    MAIN_OWNERS.forEach(o => {
      if (o.number) all.add(o.number);
      if (o.lid)    all.add(o.lid);
    });
    return [...all].filter(Boolean);
  };

  // ── sudo.json ─────────────────────────────────────────────
  const getSudo = () => {
    try {
      if (!fs.existsSync(sudoPath)) return [];
      return JSON.parse(fs.readFileSync(sudoPath, 'utf8'));
    } catch { return []; }
  };

  const saveSudo = (list) => {
    try { fs.writeFileSync(sudoPath, JSON.stringify(list, null, 2)); } catch {}
  };

  // ── group.json ────────────────────────────────────────────
  const getGroups = () => {
    try {
      if (!fs.existsSync(groupPath)) return { groups: {} };
      return JSON.parse(fs.readFileSync(groupPath, 'utf8'));
    } catch { return { groups: {} }; }
  };

  const saveGroups = (data) => {
    try { fs.writeFileSync(groupPath, JSON.stringify(data, null, 2)); } catch {}
  };

  const getGroupConfig = (groupJid) => getGroups().groups?.[groupJid] || {};

  const setGroupProtection = (groupJid, key, value) => {
    const data = getGroups();
    if (!data.groups) data.groups = {};
    if (!data.groups[groupJid]) data.groups[groupJid] = {};
    data.groups[groupJid][key] = value;
    saveGroups(data);
  };

  return {
    configPath, sudoPath, groupPath, credsPath,
    getConfig, saveConfig,
    getCredsIdentity, getOwners,
    getSudo, saveSudo,
    getGroups, saveGroups, getGroupConfig, setGroupProtection
  };
}

// =======================
// CHARGEMENT COMMANDES HADES (CommonJS → Map)
let GLOBAL_COMMANDS = null;

// Normalise un module importé dynamiquement (ESM default ou CJS via import())
function normalizeCmd(mod) {
  const base = mod?.default ?? mod;
  if (base?.name && typeof base?.execute === 'function') return [base];
  if (Array.isArray(base)) return base;
  if (mod?.name && typeof mod?.execute === 'function') return [mod];
  return [];
}

async function loadCommands() {
  const commands = new Map();
  const cmdDir   = path.resolve('./bots/hadesxmd/src/commands');
  await fs.ensureDir(cmdDir);

  const files = fs.readdirSync(cmdDir).filter(f => f.endsWith('.js') && f !== 'bug.js');
  let loaded = 0;

  for (const file of files) {
    try {
      // import() dynamique — compatible ESM et CJS, identique à la structure ROK
      const mod  = await import(`file://${path.resolve(cmdDir, file)}`);
      const cmds = normalizeCmd(mod);
      for (const cmd of cmds) {
        if (cmd?.name && typeof cmd.execute === 'function') {
          commands.set(cmd.name.toLowerCase(), cmd);
          loaded++;
        }
      }
    } catch (err) {
      console.error(`  [HADES] ❌ ${file}: ${err.message}`);
    }
  }

  // bug.js
  try {
    const mod  = await import(`file://${path.resolve('./bots/hadesxmd/src/commands/bug.js')}`);
    const base = mod?.default ?? mod;
    const list = Array.isArray(base) ? base : Object.values(base);
    for (const cmd of list) {
      if (cmd?.name && typeof cmd.execute === 'function') {
        commands.set(cmd.name.toLowerCase(), cmd); loaded++;
      }
    }
  } catch (e) { console.error('  [HADES] ❌ bug.js:', e.message); }

  // bugall.js
  try {
    const mod  = await import(`file://${path.resolve('./bots/hadesxmd/src/bugs/bugall.js')}`);
    const base = mod?.default ?? mod;
    for (const [key, val] of Object.entries(base)) {
      if (typeof val === 'function') {
        commands.set(key.toLowerCase(), { name: key, execute: val }); loaded++;
      } else if (val?.name && typeof val?.execute === 'function') {
        commands.set(val.name.toLowerCase(), val); loaded++;
      }
    }
  } catch (e) { console.error('  [HADES] ❌ bugall.js:', e.message); }

  console.log(`  [HADES] ${loaded} commandes chargées`);
  return commands;
}

// =======================
// SESSION DE PAIRING
async function startPairingSession(number, krinyxUserId = null) {
  if (pairingLocks.has(number)) return null;
  if (ACTIVE_BOTS >= MAX_BOTS) throw new Error('BOT_LIMIT_REACHED');

  pairingLocks.add(number);
  retryCount.set(number, retryCount.get(number) || 0);

  const SESSION_DIR = path.join(SESSIONS_BASE, number);
  await fs.ensureDir(SESSION_DIR);

  const h = makeSessionHelpers(SESSION_DIR);

  // Config par défaut si absente
  if (!fs.existsSync(h.configPath)) {
    h.saveConfig({ prefix: PREFIXE, owners: [] });
  }

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth:   state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    version,
    browser: Browsers.ubuntu('Edge'),
    msgRetryCounterCache: new Map()
  });

  if (!GLOBAL_COMMANDS) GLOBAL_COMMANDS = await loadCommands();

  bots.set(number, {
    sock,
    connected:    false,
    krinyxUserId: krinyxUserId,
    sessionDir:   SESSION_DIR,
    commands:     GLOBAL_COMMANDS,
    ...h
  });

  sock.ev.on('creds.update', saveCreds);

  // ══════════════════════════════════════════
  // ÉTAPE 1 — CODE DE PAIRING HADESXMD
  // ══════════════════════════════════════════
  let pairingCode = null;
  if (!state.creds.registered) {
    await delay(1500);
    try {
      let code    = await sock.requestPairingCode(number, 'HADESXMD');
      pairingCode = code?.match(/.{1,4}/g)?.join('-') || code;
      console.log(`  [HADES] 🔑 ${number}: ${pairingCode}`);
    } catch (err) {
      pairingLocks.delete(number);
      bots.delete(number);
      throw err;
    }
  }

  // ══════════════════════════════════════════
  // ÉTAPE 2 — TIMEOUT
  // ══════════════════════════════════════════
  const autoClose = setTimeout(() => {
    if (!bots.get(number)?.connected) {
      try { sock.end(); } catch {}
      bots.delete(number);
      pairingLocks.delete(number);
      console.log(`  [HADES] ⏱️ Timeout ${number}`);
    }
  }, PAIRING_TIMEOUT);

  // ══════════════════════════════════════════
  // ÉTAPE 3 — CONNEXION
  // Owner + LID lus depuis creds.json
  // ══════════════════════════════════════════
  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      clearTimeout(autoClose);
      pairingLocks.delete(number);
      const bot = bots.get(number);
      if (bot && !bot.connected) {
        bot.connected = true;
        ACTIVE_BOTS++;

        // Lire owner + LID depuis creds.json après écriture
        await delay(500);
        const { ownerNumber, ownerLid } = h.getCredsIdentity();

        // Mettre à jour config avec owners réels
        const cfg = h.getConfig();
        const ownersSet = new Set(cfg.owners || []);
        if (ownerNumber) ownersSet.add(ownerNumber);
        if (ownerLid)    ownersSet.add(ownerLid);
        cfg.owners = [...ownersSet];
        h.saveConfig(cfg);

        console.log(`  [HADES] ✅ ${number} | owner: ${ownerNumber} | lid: ${ownerLid || 'N/A'}`);

        // Charger protections (import dynamique ESM — structure identique ROK)
        try {
          const protDir = path.resolve('./bots/hadesxmd/src');
          const [p0, p1, p2, p3] = await Promise.all([
            import(`file://${path.join(protDir, 'protections.js')}`),
            import(`file://${path.join(protDir, 'protections1.js')}`),
            import(`file://${path.join(protDir, 'protections2.js')}`),
            import(`file://${path.join(protDir, 'protections3.js')}`),
          ]);
          const b0 = p0?.default ?? p0;
          const b1 = p1?.default ?? p1;
          const b2 = p2?.default ?? p2;
          const b3 = p3?.default ?? p3;
          if (b0?.initProtections)  b0.initProtections(sock);
          if (b1?.initProtections1) b1.initProtections1(sock);
          if (b2?.initProtections2) b2.initProtections2(sock);
          if (b3?.initProtections3) b3.initProtections3(sock);
        } catch (e) {
          console.warn(`  [HADES] ⚠️ Protections: ${e.message}`);
        }

        // Events additionnels (import dynamique ESM — structure identique ROK)
        try {
          const cmdDir = path.resolve('./bots/hadesxmd/src/commands');
          const [mAr, mRec, mWel] = await Promise.all([
            import(`file://${path.join(cmdDir, 'autoreact.js')}`),
            import(`file://${path.join(cmdDir, 'autorecording.js')}`),
            import(`file://${path.join(cmdDir, 'welcome.js')}`),
          ]);
          const ar  = mAr?.default  ?? mAr;
          const rec = mRec?.default ?? mRec;
          const wel = mWel?.default ?? mWel;
          if (ar?.autoreactEvents)          ar.autoreactEvents(sock);
          if (rec?.autorecordingEvents)     rec.autorecordingEvents(sock);
          if (wel?.welcomeEvents)           wel.welcomeEvents(sock);
        } catch (e) { console.warn('  [HADES] ⚠️ Events:', e.message); }

        // Notifier Krinyx
        try {
          const { default: fetch } = await import('node-fetch');
          await fetch(`http://localhost:${process.env.PORT || 3000}/api/bot/link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number, userId: bot.krinyxUserId, botType: 'hadesxmd' })
          });
        } catch {}

        // Message de bienvenue
        try {
          const ownerJid = `${ownerNumber}@s.whatsapp.net`;
          await sock.sendMessage(ownerJid, {
            image: { url: '/hadesxmd/hades.jpg' },
            caption: [
              '╔══════════════════════════════╗',
              '║  👑 HADES XMD — ACTIVÉ 👑   ║',
              '╚══════════════════════════════╝',
              '',
              `🔹 Numéro  : ${number}`,
              `⚙️  Préfixe : ${cfg.prefix || PREFIXE}`,
              `📚 Cmds    : ${GLOBAL_COMMANDS.size}`,
              '',
              `⚫ Tape ${cfg.prefix || PREFIXE}menu`,
              '',
              `👨‍💻 Dev by Raizel & Knut`,
              `📢 https://whatsapp.com/channel/0029VbBU3ISHwXb5Gd65Jp1I`
            ].join('\n')
          });
        } catch {}
      }
    }

    if (connection === 'close') {
      const status  = lastDisconnect?.error?.output?.statusCode;
      const retries = retryCount.get(number) || 0;

      if (status === DisconnectReason.loggedOut || retries >= MAX_RETRIES) {
        await removeSession(SESSION_DIR);
        bots.delete(number);
        pairingLocks.delete(number);
        retryCount.delete(number);
        ACTIVE_BOTS = Math.max(0, ACTIVE_BOTS - 1);
        console.log(`  [HADES] ❌ ${number} déconnecté définitivement`);
      } else {
        retryCount.set(number, retries + 1);
        console.log(`  [HADES] 🔁 Reconnexion ${number} (${retries + 1}/${MAX_RETRIES})`);
        setTimeout(async () => {
          try { sock.end(); } catch {}
          bots.delete(number);
          pairingLocks.delete(number);
          await startPairingSession(number, krinyxUserId);
        }, 5000);
      }
    }
  });

  // ══════════════════════════════════════════
  // ÉTAPE 4 — MESSAGES
  // Signature HADES : execute(sock, msg, args, from, botJid)
  // Gestion users via makeSessionHelpers (sessions/{number}/)
  // ══════════════════════════════════════════
  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const botJid = sock.user?.id || '';

      for (const m of messages) {
        if (!m?.message) continue;

        const from    = m.key.remoteJid;
        const isGroup = from?.endsWith('@g.us');

        // Dans un groupe, le vrai expéditeur est dans m.key.participant
        // En MP, c'est le remoteJid lui-même (ou sock.user.id si fromMe)
        let realSender;
        if (m.key.fromMe) {
          realSender = sock.user?.id || '';
        } else if (isGroup) {
          realSender = m.key.participant || '';
        } else {
          realSender = from || '';
        }

        const senderId = getBareNumber(realSender);

        const bot = bots.get(number);
        if (!bot) continue;

        // Owners depuis session (creds + config + MAIN_OWNERS)
        const owners  = bot.getOwners().map(n => getBareNumber(n));
        const sudo    = bot.getSudo().map(n => getBareNumber(n));
        const isOwner = owners.includes(senderId) || m.key.fromMe;
        const isSudo  = sudo.includes(senderId);

        if (!isOwner && !isSudo) continue;

        // Enregistrer groupe si owner
        if (isGroup && isOwner) {
          const gData = bot.getGroups();
          if (!gData.groups[from]) {
            gData.groups[from] = { antiLink: false, antiSpam: false, antiBot: false };
            bot.saveGroups(gData);
          }
        }

        const body = getMessageText(m);
        const cfg  = bot.getConfig();
        const prefix = cfg.prefix || PREFIXE;
        if (!body.startsWith(prefix)) continue;

        const args    = body.slice(prefix.length).trim().split(/ +/);
        const cmdName = args.shift()?.toLowerCase();
        if (!cmdName || !bot.commands.has(cmdName)) continue;

        // Réaction dynamique
        const emojiMap = { ping:'🏓', menu:'👑', 'premium-menu':'💎', play:'🎵', default:'🎭' };
        try {
          await sock.sendMessage(from, {
            react: { text: emojiMap[cmdName] || emojiMap.default, key: m.key }
          });
        } catch {}

        try {
          await bot.commands.get(cmdName).execute(sock, m, args, from, botJid);
        } catch (err) {
          console.error(`  [HADES] ❌ ${cmdName} [${number}]:`, err.message);
        }
      }
    } catch (err) {
      console.error('  [HADES] ❌ messages.upsert:', err.message);
    }
  });

  // ══════════════════════════════════════════
  // ÉTAPE 5 — WELCOME / BYE
  // ══════════════════════════════════════════
  sock.ev.on('group-participants.update', async ({ participants, action, id: groupId }) => {
    const bot = bots.get(number);
    if (!bot) return;
    const gc = bot.getGroupConfig(groupId);
    for (const userJid of participants) {
      const name = userJid.split('@')[0];
      let ppUrl = null;
      try { ppUrl = await sock.profilePictureUrl(userJid, 'image'); } catch {}
      if (action === 'add' && gc.welcome) {
        const t = `👑 Bienvenue @${name} dans les ténèbres !`;
        ppUrl
          ? await sock.sendMessage(groupId, { image: { url: ppUrl }, caption: t, mentions: [userJid] })
          : await sock.sendMessage(groupId, { text: t, mentions: [userJid] });
      }
      if (action === 'remove' && gc.bye) {
        const t = `🖤 Au revoir @${name}`;
        ppUrl
          ? await sock.sendMessage(groupId, { image: { url: ppUrl }, caption: t, mentions: [userJid] })
          : await sock.sendMessage(groupId, { text: t, mentions: [userJid] });
      }
    }
  });

  return pairingCode;
}

// =======================
// ROUTES

// GET /hadesxmd/pair/code?number=237XXXXXXXX&userId=123
router.get('/code', async (req, res) => {
  try {
    let num = req.query.number;
    const userId = req.query.userId || null;
    if (!num) return res.status(400).json({ error: 'Numéro requis' });
    num = fmt(num);
    if (pairingLocks.has(num))
      return res.status(429).json({ error: 'Pairing déjà en cours pour ce numéro' });
    const code = await startPairingSession(num, userId);
    res.json(code ? { code } : { status: 'Ce numéro est déjà connecté' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /hadesxmd/pair/config  { number, prefix }
router.post('/config', async (req, res) => {
  try {
    let { number, prefix } = req.body;
    if (!number) return res.status(400).json({ error: 'Numéro requis' });
    number = fmt(number);
    const SESSION_DIR = path.join(SESSIONS_BASE, number);
    await fs.ensureDir(SESSION_DIR);
    const h   = makeSessionHelpers(SESSION_DIR);
    const cfg = h.getConfig();
    if (prefix) cfg.prefix = prefix;
    h.saveConfig(cfg);
    if (bots.has(number)) bots.get(number).getConfig = h.getConfig;
    res.json({ status: `✅ Préfixe "${cfg.prefix}" sauvegardé` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// EXPORT
export default router;
