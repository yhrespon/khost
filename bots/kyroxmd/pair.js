/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║         KYRO XMD V1 — pair.js                           ║
 * ║   Structure identique aux autres bots Krinyx            ║
 * ║                                                          ║
 * ║  ISOLATION PAR SESSION :                                ║
 * ║    sessions/{number}/creds.json  → identité owner       ║
 * ║    sessions/{number}/config.json → prefix, owners       ║
 * ║    sessions/{number}/warn.json   → avertissements       ║
 * ║    sessions/{number}/welcome.json → welcome par groupe  ║
 * ║    sessions/{number}/settings.json → settings groupes  ║
 * ╚══════════════════════════════════════════════════════════╝
 */

import express from 'express';
import fs      from 'fs-extra';
import path    from 'path';
import pino    from 'pino';
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  delay
} from '@whiskeysockets/baileys';

const router = express.Router();

const SESSIONS_BASE  = './bots/kyroxmd/sessions';
const PLUGINS_PATH   = path.resolve('./bots/kyroxmd/plugins');
const MAX_BOTS       = 25;
const MAX_RETRIES    = 3;
const PAIRING_TIMEOUT = 5 * 60 * 1000;

let ACTIVE_BOTS    = 0;
const retryCount   = new Map();
const pairingLocks = new Set();
const bots         = new Map();

// ── Formatage numéro ──
const fmt = (num) => {
  let d = num.replace(/\D/g, '');
  if (d.startsWith('0')) d = d.replace(/^0+/, '');
  return d;
};

const bare = (input) => {
  if (!input) return '';
  return String(input).split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
};

const removeSession = async (dir) => {
  if (await fs.pathExists(dir)) await fs.remove(dir);
};

// ── Unwrap messages ──
const pickText = (msg) => {
  if (!msg?.message) return '';
  const m = msg.message;
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption || ''
  );
};

// ── Helpers isolés par session ──
function makeSessionHelpers(sessionDir) {
  const configPath   = path.join(sessionDir, 'config.json');
  const credsPath    = path.join(sessionDir, 'creds.json');
  const warnPath     = path.join(sessionDir, 'warn.json');
  const welcomePath  = path.join(sessionDir, 'welcome.json');
  const settingsPath = path.join(sessionDir, 'settings.json');

  const getConfig = () => {
    try {
      if (!fs.existsSync(configPath)) return { prefix: '!', owners: [] };
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch { return { prefix: '!', owners: [] }; }
  };
  const saveConfig = (data) => {
    try { fs.writeFileSync(configPath, JSON.stringify(data, null, 2)); } catch {}
  };

  const getCredsIdentity = () => {
    try {
      if (!fs.existsSync(credsPath)) return { ownerNumber: null, ownerLid: null };
      const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
      return {
        ownerNumber: bare(creds?.me?.id || ''),
        ownerLid:    bare(creds?.me?.lid || '')
      };
    } catch { return { ownerNumber: null, ownerLid: null }; }
  };

  const getOwners = () => {
    const { ownerNumber, ownerLid } = getCredsIdentity();
    const cfg = getConfig();
    const all = new Set(cfg.owners || []);
    if (ownerNumber) all.add(ownerNumber);
    if (ownerLid)    all.add(ownerLid);
    return [...all].filter(Boolean);
  };

  const getWarn = () => {
    try {
      if (!fs.existsSync(warnPath)) return {};
      return JSON.parse(fs.readFileSync(warnPath, 'utf8'));
    } catch { return {}; }
  };
  const saveWarn = (data) => {
    try { fs.writeFileSync(warnPath, JSON.stringify(data, null, 2)); } catch {}
  };

  const getWelcome = () => {
    try {
      if (!fs.existsSync(welcomePath)) return {};
      return JSON.parse(fs.readFileSync(welcomePath, 'utf8'));
    } catch { return {}; }
  };
  const saveWelcome = (data) => {
    try { fs.writeFileSync(welcomePath, JSON.stringify(data, null, 2)); } catch {}
  };

  const getSettings = () => {
    try {
      if (!fs.existsSync(settingsPath)) return {};
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch { return {}; }
  };
  const saveSettings = (data) => {
    try { fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2)); } catch {}
  };

  return {
    configPath, credsPath, warnPath, welcomePath, settingsPath,
    getConfig, saveConfig, getCredsIdentity, getOwners,
    getWarn, saveWarn, getWelcome, saveWelcome,
    getSettings, saveSettings
  };
}

// ── Chargement des plugins ──
let GLOBAL_COMMANDS = null;

async function loadPlugins() {
  const commands = new Map();
  await fs.ensureDir(PLUGINS_PATH);
  const files = fs.readdirSync(PLUGINS_PATH).filter(f => f.endsWith('.js') && !f.startsWith('.'));
  let loaded = 0;
  for (const file of files) {
    try {
      const fp  = path.resolve(PLUGINS_PATH, file);
      const mod = await import(`${fp}?v=${Date.now()}`);
      const name    = mod.name    || mod.default?.name;
      const execute = mod.execute || mod.default?.execute;
      if (name && typeof execute === 'function') {
        commands.set(name.toLowerCase(), { name, execute });
        loaded++;
      }
    } catch (err) {
      console.error(`  [KYRO] Erreur plugin ${file}: ${err.message}`);
    }
  }
  console.log(`  [KYRO] ${loaded} plugins chargés`);
  return commands;
}

// ── Vérifier si admin groupe ──
async function isGroupAdmin(sock, groupJid, userJid) {
  try {
    const meta = await sock.groupMetadata(groupJid);
    return meta.participants.some(p => p.id === userJid && p.admin !== null);
  } catch { return false; }
}

// ── Session de pairing ──
async function startPairingSession(number, krinyxUserId = null) {
  if (pairingLocks.has(number)) return null;
  if (ACTIVE_BOTS >= MAX_BOTS) throw new Error('BOT_LIMIT_REACHED');

  pairingLocks.add(number);
  retryCount.set(number, retryCount.get(number) || 0);

  const SESSION_DIR = path.join(SESSIONS_BASE, number);
  await fs.ensureDir(SESSION_DIR);

  const h = makeSessionHelpers(SESSION_DIR);

  if (!fs.existsSync(h.configPath)) {
    h.saveConfig({ prefix: '!', owners: [] });
  }

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
    },
    logger:               pino({ level: 'silent' }),
    browser:              ['Ubuntu', 'Chrome', '20.0.04'],
    printQRInTerminal:    false,
    msgRetryCounterCache: new Map()
  });

  if (!GLOBAL_COMMANDS) GLOBAL_COMMANDS = await loadPlugins();

  // Store de messages pour antidelete
  const messageStore = {};

  bots.set(number, {
    sock,
    connected:    false,
    krinyxUserId,
    sessionDir:   SESSION_DIR,
    commands:     GLOBAL_COMMANDS,
    messageStore,
    ...h
  });

  sock.ev.on('creds.update', saveCreds);

  // ── Code de pairing ──
  let pairingCode = null;
  if (!sock.authState.creds.registered) {
    await delay(1500);
    try {
      const raw   = await sock.requestPairingCode(number);
      pairingCode = raw.match(/.{1,4}/g).join('-');
      console.log(`  [KYRO] Code ${number}: ${pairingCode}`);
    } catch (err) {
      pairingLocks.delete(number);
      bots.delete(number);
      throw err;
    }
  }

  // ── Timeout ──
  const autoClose = setTimeout(() => {
    if (!bots.get(number)?.connected) {
      try { sock.end(); } catch {}
      bots.delete(number);
      pairingLocks.delete(number);
      console.log(`  [KYRO] Timeout ${number}`);
    }
  }, PAIRING_TIMEOUT);

  // ── Connexion ──
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

        console.log(`  [KYRO] Connecté ${number} | owner: ${ownerNumber} | lid: ${ownerLid || 'N/A'}`);

        // Notifier Krinyx
        try {
          const { default: fetch } = await import('node-fetch');
          await fetch(`http://localhost:${process.env.PORT || 3000}/api/bot/link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number, userId: bot.krinyxUserId, botType: 'kyroxmd' })
          });
        } catch {}

        // Message de bienvenue
        try {
          const ownerJid = `${ownerNumber}@s.whatsapp.net`;
          const prefix   = cfg.prefix || '!';
          await sock.sendMessage(ownerJid, {
            image: { url: 'https://files.catbox.moe/u1c1j5.jpg' },
            caption: [
              '*KYRO XMD V1 ACTIF*',
              `Prefix : ${prefix}`,
              `Plugins : ${GLOBAL_COMMANDS.size}`,
              '',
              `Tape ${prefix}menu pour voir les commandes`,
              '',
              `Dev Raizel & Dev Knut — Krinyx`
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
        console.log(`  [KYRO] Déconnexion définitive ${number}`);
      } else {
        retryCount.set(number, retries + 1);
        setTimeout(async () => {
          try { sock.end(); } catch {}
          bots.delete(number);
          pairingLocks.delete(number);
          await startPairingSession(number, krinyxUserId);
        }, 5000);
      }
    }
  });

  // ── Anticall ──
  sock.ev.on('call', async (calls) => {
    for (const call of calls) {
      if (call.status === 'offer') {
        try {
          await sock.sendMessage(call.from, { text: 'Les appels sont interdits.' });
          await sock.updateBlockStatus(call.from, 'block');
        } catch {}
      }
    }
  });

  // ── Welcome / Bye ──
  sock.ev.on('group-participants.update', async ({ id: groupId, participants, action }) => {
    const bot = bots.get(number);
    if (!bot) return;
    const welcome  = bot.getWelcome();
    const settings = bot.getSettings();

    if (action === 'add' && welcome[groupId]) {
      try {
        const metadata = await sock.groupMetadata(groupId);
        for (const user of participants) {
          let pp;
          try { pp = await sock.profilePictureUrl(user, 'image'); }
          catch { pp = 'https://files.catbox.moe/u1c1j5.jpg'; }
          await sock.sendMessage(groupId, {
            image: { url: pp },
            caption: `Bienvenue @${user.split('@')[0]} dans ${metadata.subject} !\n\nMembres : ${metadata.participants.length}`,
            mentions: [user]
          });
        }
      } catch {}
    }

    if (action === 'promote' && settings[groupId]?.antipromote) {
      for (const user of participants) {
        try {
          await sock.groupParticipantsUpdate(groupId, [user], 'demote');
          await sock.sendMessage(groupId, { text: 'Promotion annulée par ANTIPROMOTE' });
        } catch {}
      }
    }
  });

  // ── Antidelete ──
  sock.ev.on('messages.update', async (updates) => {
    const bot = bots.get(number);
    if (!bot) return;
    const settings = bot.getSettings();

    for (const update of updates) {
      if (update.update.message === null) {
        const key   = update.key;
        const saved = bot.messageStore[key.id];
        if (!saved) continue;

        // Vérifier si antidelete actif pour ce groupe
        const from = saved.from;
        if (from?.endsWith('@g.us') && !settings[from]?.antidelete) continue;

        try {
          const { default: fetch } = await import('node-fetch');
          let pp;
          try { pp = await sock.profilePictureUrl(saved.sender, 'image'); }
          catch { pp = 'https://files.catbox.moe/u1c1j5.jpg'; }
          const buffer = await fetch(pp).then(r => r.buffer());
          await sock.sendMessage(from, {
            image: buffer,
            caption: `Message supprime\n\nDe : @${saved.sender.split('@')[0]}\n\n${saved.text}`,
            mentions: [saved.sender]
          });
        } catch {}
      }
    }
  });

  // ── Messages ──
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg?.message) return;

    const from      = msg.key.remoteJid;
    const isGroup   = from?.endsWith('@g.us');
    const sender    = msg.key.fromMe ? sock.user?.id : (msg.key.participant || from);
    const senderNum = bare(sender);

    const bot = bots.get(number);
    if (!bot) return;

    const text = pickText(msg);

    // Stocker pour antidelete
    if (msg.key.id) {
      bot.messageStore[msg.key.id] = {
        sender,
        from,
        text: text || 'message non textuel'
      };
    }

    const owners   = bot.getOwners();
    const cfg      = bot.getConfig();
    const settings = bot.getSettings();
    const prefix   = cfg.prefix || '!';

    const isOwner = owners.includes(senderNum);
    let   isAdmin = false;
    if (isGroup) isAdmin = await isGroupAdmin(sock, from, sender);

    // Autoreact
    if (cfg.autoReact && text) {
      try { await sock.sendMessage(from, { react: { text: '🔥', key: msg.key } }); } catch {}
    }

    // Antilink (hors owner/admin)
    if (isGroup && text?.includes('http') && !isOwner && !isAdmin) {
      const warn = bot.getWarn();
      if (!warn[sender]) warn[sender] = 0;
      warn[sender]++;
      bot.saveWarn(warn);
      if (warn[sender] >= 3) {
        try {
          await sock.groupParticipantsUpdate(from, [sender], 'remove');
          await sock.sendMessage(from, { text: `@${senderNum} expulse pour lien.`, mentions: [sender] });
        } catch {}
      } else {
        await sock.sendMessage(from, {
          text: `Avertissement ${warn[sender]}/2 — lien interdit @${senderNum}`,
          mentions: [sender]
        });
      }
    }

    if (!text?.startsWith(prefix)) return;

    const args        = text.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const command = bot.commands.get(commandName);
    if (!command) return;

    // Commandes dangereuses : owner ou admin seulement
    const dangerous = ['purge', 'ban', 'kick', 'kickall', 'promote', 'demote', 'lock', 'unlock'];
    if (dangerous.includes(commandName)) {
      if (!isGroup) {
        await sock.sendMessage(from, { text: 'Cette commande fonctionne seulement dans un groupe.' });
        return;
      }
      if (!isOwner && !isAdmin) {
        await sock.sendMessage(from, { text: 'Seuls le proprietaire ou les admins peuvent utiliser cette commande.' });
        return;
      }
    }

    if (command.owner && !isOwner) {
      await sock.sendMessage(from, { text: 'Commande reservee au proprietaire.' });
      return;
    }

    // Injecter contexte Krinyx dans msg pour compat plugins
    msg._kyro = {
      owners, cfg, settings, sessionDir: bot.sessionDir,
      getConfig:   bot.getConfig,   saveConfig:   bot.saveConfig,
      getWarn:     bot.getWarn,     saveWarn:     bot.saveWarn,
      getWelcome:  bot.getWelcome,  saveWelcome:  bot.saveWelcome,
      getSettings: bot.getSettings, saveSettings: bot.saveSettings,
      isOwner, isAdmin, prefix,
      OWNER_NUMBER: owners[0] || senderNum
    };

    // Compat global pour plugins qui font process.env ou global.OWNER
    const prevOwner = global.KYRO_OWNER;
    global.KYRO_OWNER = owners[0] || senderNum;

    try {
      await command.execute(sock, msg, args);
    } catch (err) {
      console.error(`  [KYRO] Erreur ${commandName} [${number}]:`, err.message);
      try {
        await sock.sendMessage(from, { text: `Erreur commande ${commandName}` }, { quoted: msg });
      } catch {}
    } finally {
      global.KYRO_OWNER = prevOwner;
    }
  });

  return pairingCode;
}

// ── Routes Express ──

// GET /kyroxmd/pair/code?number=237XXXXXXXX&userId=123
router.get('/code', async (req, res) => {
  try {
    let num = req.query.number;
    const userId = req.query.userId || null;
    if (!num) return res.status(400).json({ error: 'Numero requis' });
    num = fmt(num);
    if (pairingLocks.has(num))
      return res.status(429).json({ error: 'Pairing deja en cours pour ce numero' });
    const code = await startPairingSession(num, userId);
    res.json(code ? { code } : { status: 'Ce numero est deja connecte' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /kyroxmd/pair/status?number=237XXXXXXXX
router.get('/status', (req, res) => {
  const num = fmt(req.query.number || '');
  const bot = bots.get(num);
  res.json({ connected: !!bot?.connected, active: ACTIVE_BOTS });
});

export default router;
