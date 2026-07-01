// ============================================================
// RAIZEL XMD — pair.js
// Intégré à Krinyx — structure identique ROK/HADES/KNUT
// Code de pairing : DVRAIZEL
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
  delay,
  jidDecode
} from '@whiskeysockets/baileys';

import { initProtections } from './protections.js';
import { initSecurity    } from './security.js';

const router = express.Router();

// =======================
// CHEMINS
const SESSIONS_BASE = './bots/raizelxmd/sessions';
const CONFIG_FILE   = path.resolve('./bots/raizelxmd/config.json');

// =======================
// LIMITES
const MAX_BOTS        = 25;
const MAX_RETRIES     = 3;
const PAIRING_TIMEOUT = 5 * 60 * 1000;

// =======================
// CONFIG GLOBALE RAIZEL
let RAIZEL_CONFIG = {};
try { RAIZEL_CONFIG = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); } catch {}
const PREFIXE     = RAIZEL_CONFIG.prefix || '.';
const MAIN_OWNERS = RAIZEL_CONFIG.owners  || [];

// =======================
// ÉTAT GLOBAL
let ACTIVE_BOTS = 0;
const retryCount   = new Map();
const pairingLocks = new Set();
const bots         = new Map();

// =======================
// UTILITAIRES
const fmt = (num) => {
  let d = num.replace(/\D/g, '');
  if (d.startsWith('0')) d = d.replace(/^0+/, '');
  return d;
};

const getBareNumber = (input) => {
  if (!input) return '';
  return String(input).split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
};

const getMessageText = (msg) => {
  const inner = msg.message?.ephemeralMessage?.message
             || msg.message?.viewOnceMessageV2?.message
             || msg.message;
  return inner?.conversation
      || inner?.extendedTextMessage?.text
      || inner?.imageMessage?.caption
      || inner?.videoMessage?.caption
      || inner?.buttonsResponseMessage?.selectedButtonId
      || inner?.listResponseMessage?.singleSelectReply?.selectedRowId
      || '';
};

const removeSession = async (dir) => {
  if (await fs.pathExists(dir)) await fs.remove(dir);
};

// =======================
// HELPERS SESSION
function makeSessionHelpers(sessionDir) {
  const configPath = path.join(sessionDir, 'config.json');
  const sudoPath   = path.join(sessionDir, 'sudo.json');
  const credsPath  = path.join(sessionDir, 'creds.json');

  const getConfig = () => {
    try {
      if (!fs.existsSync(configPath)) return { prefix: PREFIXE, owners: [] };
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch { return { prefix: PREFIXE, owners: [] }; }
  };

  const saveConfig = (data) => {
    try { fs.writeFileSync(configPath, JSON.stringify(data, null, 2)); } catch {}
  };

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

  const getOwners = () => {
    const { ownerNumber, ownerLid } = getCredsIdentity();
    const cfg   = getConfig();
    const extra = cfg.owners || [];
    const all   = new Set();
    if (ownerNumber) all.add(ownerNumber);
    if (ownerLid)    all.add(ownerLid);
    extra.forEach(n => all.add(getBareNumber(n)));
    MAIN_OWNERS.forEach(n => { if (n) all.add(getBareNumber(n)); });
    return [...all].filter(Boolean);
  };

  const getSudo = () => {
    try {
      if (!fs.existsSync(sudoPath)) return [];
      return JSON.parse(fs.readFileSync(sudoPath, 'utf8'));
    } catch { return []; }
  };

  const saveSudo = (list) => {
    try { fs.writeFileSync(sudoPath, JSON.stringify(list, null, 2)); } catch {}
  };

  return { configPath, sudoPath, credsPath, getConfig, saveConfig, getCredsIdentity, getOwners, getSudo, saveSudo };
}

// =======================
// CHARGEMENT COMMANDES
let GLOBAL_COMMANDS = null;

async function loadCommands() {
  const commands = new Map();
  const cmdDir   = path.resolve('./bots/raizelxmd/commands');
  await fs.ensureDir(cmdDir);

  const files = fs.readdirSync(cmdDir).filter(f => f.endsWith('.js'));
  let loaded = 0;

  for (const file of files) {
    try {
      const mod  = await import(`file://${path.resolve(cmdDir, file)}`);
      const base = mod?.default ?? mod;
      const list = Array.isArray(base) ? base : (base?.name && base?.execute ? [base] : Object.values(base).filter(v => v?.name && v?.execute));
      for (const cmd of list) {
        if (cmd?.name && typeof cmd.execute === 'function') {
          commands.set(cmd.name.toLowerCase(), cmd);
          loaded++;
        }
      }
    } catch (err) {
      console.error(`  [RAIZEL] ❌ ${file}: ${err.message}`);
    }
  }

  // Charger delay.js, bugss.js, bugs.js
  for (const extra of ['delay.js', 'bugss.js', 'bugs.js']) {
    try {
      const mod  = await import(`file://${path.resolve('./bots/raizelxmd', extra)}`);
      const base = mod?.default ?? mod;
      const list = Array.isArray(base) ? base : Object.values(base).filter(v => v?.name && typeof v?.execute === 'function');
      for (const cmd of list) {
        if (cmd?.name && typeof cmd.execute === 'function') {
          commands.set(cmd.name.toLowerCase(), cmd); loaded++;
        }
      }
    } catch {}
  }

  console.log(`  [RAIZEL] ${loaded} commandes chargées`);
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
  if (!fs.existsSync(h.configPath)) h.saveConfig({ prefix: PREFIXE, owners: [] });

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    logger:            pino({ level: 'silent' }),
    browser:           Browsers.ubuntu('Chrome'),
    printQRInTerminal: false,
    version,
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

  // ══════════════════════
  // CODE DE PAIRING
  let pairingCode = null;
  if (!state.creds.registered) {
    await delay(1500);
    try {
      const raw   = await sock.requestPairingCode(number, 'DVRAIZEL');
      pairingCode = raw?.match(/.{1,4}/g)?.join('-') || raw;
      console.log(`  [RAIZEL] 🔑 ${number}: ${pairingCode}`);
    } catch (err) {
      pairingLocks.delete(number);
      bots.delete(number);
      throw err;
    }
  }

  // ══════════════════════
  // TIMEOUT
  const autoClose = setTimeout(() => {
    if (!bots.get(number)?.connected) {
      try { sock.end(); } catch {}
      bots.delete(number);
      pairingLocks.delete(number);
      console.log(`  [RAIZEL] ⏱️ Timeout ${number}`);
    }
  }, PAIRING_TIMEOUT);

  // ══════════════════════
  // CONNEXION
  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      clearTimeout(autoClose);
      pairingLocks.delete(number);
      const bot = bots.get(number);
      if (bot && !bot.connected) {
        bot.connected = true;
        ACTIVE_BOTS++;

        await delay(500);
        const { ownerNumber, ownerLid } = h.getCredsIdentity();
        const cfg = h.getConfig();
        const ownersSet = new Set(cfg.owners || []);
        if (ownerNumber) ownersSet.add(ownerNumber);
        if (ownerLid)    ownersSet.add(ownerLid);
        cfg.owners = [...ownersSet];
        h.saveConfig(cfg);

        console.log(`  [RAIZEL] ✅ ${number} | owner: ${ownerNumber} | lid: ${ownerLid || 'N/A'}`);

        // Protections & sécurité
        try {
          initProtections(sock);
          initSecurity(sock);
        } catch (e) {
          console.warn(`  [RAIZEL] ⚠️ Protections: ${e.message}`);
        }

        // Events des commandes
        try {
          const cmdDir = path.resolve('./bots/raizelxmd/commands');
          const eventFiles = ['welcome.js', 'autoreact.js', 'autoread.js', 'autotyping.js',
                              'autorecording.js', 'autobio.js', 'autobvn.js', 'antidelete.js'];
          for (const ef of eventFiles) {
            try {
              const mod = await import(`file://${path.join(cmdDir, ef)}`);
              const fnName = ef.replace('.js', '') + 'Events';
              const fn = mod[fnName] || mod.default?.[fnName];
              if (typeof fn === 'function') fn(sock);
            } catch {}
          }
          // autoreadstatus spécifique
          const arsmod = await import(`file://${path.resolve('./bots/raizelxmd/commands/autoreadstatus.js')}`);
          if (arsmod?.default?.init) arsmod.default.init(sock);
        } catch {}

        // Notifier Krinyx
        try {
          const { default: fetch } = await import('node-fetch');
          await fetch(`http://localhost:${process.env.PORT || 3000}/api/bot/link`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ number, userId: bot.krinyxUserId, botType: 'raizelxmd' })
          });
        } catch {}

        // Message de bienvenue
        try {
          const ownerJid = `${ownerNumber}@s.whatsapp.net`;
          await sock.sendMessage(ownerJid, {
            image: { url: path.resolve('./bots/raizelxmd/cover.jpg') },
            caption: [
              '╔══════════════════════════════╗',
              '║  👑 RAIZEL XMD — ACTIVÉ 👑  ║',
              '╚══════════════════════════════╝',
              '',
              `🔹 Numéro  : ${number}`,
              `⚙️  Préfixe : ${cfg.prefix || PREFIXE}`,
              `📚 Cmds    : ${GLOBAL_COMMANDS.size}`,
              '',
              `⚡ Tape ${cfg.prefix || PREFIXE}menu`,
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
        console.log(`  [RAIZEL] ❌ ${number} déconnecté définitivement`);
      } else {
        retryCount.set(number, retries + 1);
        console.log(`  [RAIZEL] 🔁 Reconnexion ${number} (${retries + 1}/${MAX_RETRIES})`);
        setTimeout(async () => {
          try { sock.end(); } catch {}
          bots.delete(number);
          pairingLocks.delete(number);
          await startPairingSession(number, krinyxUserId);
        }, 5000);
      }
    }
  });

  // ══════════════════════
  // MESSAGES
  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const botJid = sock.user?.id || '';

      for (const m of messages) {
        if (!m?.message) continue;

        const from    = m.key.remoteJid;
        const isGroup = from?.endsWith('@g.us');

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

        const owners  = bot.getOwners().map(n => getBareNumber(n));
        const sudo    = bot.getSudo().map(n => getBareNumber(n));
        const isOwner = owners.includes(senderId) || m.key.fromMe;
        const isSudo  = sudo.includes(senderId);

        if (!isOwner && !isSudo) continue;

        const body = getMessageText(m);
        if (!body) continue;

        const cfg    = bot.getConfig();
        const prefix = cfg.prefix || PREFIXE;
        if (!body.startsWith(prefix)) continue;

        const args    = body.slice(prefix.length).trim().split(/ +/);
        const cmdName = args.shift()?.toLowerCase();
        if (!cmdName || !bot.commands.has(cmdName)) continue;

        // Réaction
        try {
          await sock.sendMessage(from, { react: { text: '⚡', key: m.key } });
        } catch {}

        try {
          await bot.commands.get(cmdName).execute(sock, {
            raw:     m,
            from,
            sender:  realSender,
            isGroup,
            reply:   t => sock.sendMessage(from, { text: t }, { quoted: m }),
            bots:    sock
          }, args, from, botJid);
        } catch (err) {
          console.error(`  [RAIZEL] ❌ ${cmdName} [${number}]:`, err.message);
        }
      }
    } catch (err) {
      console.error('  [RAIZEL] ❌ messages.upsert:', err.message);
    }
  });

  // ══════════════════════
  // WELCOME / BYE
  sock.ev.on('group-participants.update', async ({ participants, action, id: groupId }) => {
    const bot = bots.get(number);
    if (!bot) return;
    for (const userJid of participants) {
      const name = userJid.split('@')[0];
      let ppUrl = null;
      try { ppUrl = await sock.profilePictureUrl(userJid, 'image'); } catch {}
      if (action === 'add') {
        const t = `👑 Bienvenue @${name} dans le royaume de Raizel !`;
        ppUrl
          ? await sock.sendMessage(groupId, { image: { url: ppUrl }, caption: t, mentions: [userJid] })
          : await sock.sendMessage(groupId, { text: t, mentions: [userJid] });
      }
      if (action === 'remove') {
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

// GET /raizelxmd/pair/code?number=237XXXXXXXX&userId=123
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

// POST /raizelxmd/pair/config  { number, prefix }
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
