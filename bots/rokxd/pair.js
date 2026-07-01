// =======================
// IMPORTS
import express from "express";
import fs from "fs-extra";
import path from "path";
import pino from "pino";
import {
  makeWASocket,
  useMultiFileAuthState,
  Browsers,
  fetchLatestBaileysVersion,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  delay
} from "@whiskeysockets/baileys";

const router = express.Router();

// =======================
// CHEMINS
const PAIRING_DIR    = "./bots/rokxd/sessions";
const CONFIG_FILE    = "./bots/rokxd/config.json";

// =======================
// LIMITES
const MAX_BOTS        = 25;
const MAX_RETRIES     = 3;
const PAIRING_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// =======================
// ÉTAT GLOBAL
let ACTIVE_BOTS = 0;
const retryCount   = new Map(); // number → nb reconnexions
const pairingLocks = new Set(); // numbers en cours de pairing
const bots         = new Map(); // number → { sock, connected, commands, config, features }

// =======================
// CONFIG
let CONFIG = {};
if (fs.existsSync(CONFIG_FILE)) {
  try { CONFIG = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8")); } catch {}
}
async function saveConfig() {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(CONFIG, null, 2));
}

// =======================
// UTILITAIRES
function formatNumber(num) {
  let digits = num.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
  return digits;
}

async function removeSession(dir) {
  if (await fs.pathExists(dir)) await fs.remove(dir);
}

// =======================
// CHARGEMENT DES COMMANDES (une seule fois au démarrage)
let GLOBAL_COMMANDS = null;

async function loadCommands() {
  const commands = new Map();
  const folder   = path.resolve("./bots/rokxd/commands");
  await fs.ensureDir(folder);
  for (const file of fs.readdirSync(folder).filter(f => f.endsWith(".js"))) {
    try {
      const fullPath = path.resolve(folder, file);
      const cmd = await import(`${fullPath}?v=${Date.now()}`);
      if (cmd.default?.name && typeof cmd.default.execute === "function") {
        commands.set(cmd.default.name.toLowerCase(), cmd.default);
      }
    } catch {}
  }
  return commands;
}

// =======================
// SESSION DE PAIRING
async function startPairingSession(number, krinyxUserId = null) {
  if (pairingLocks.has(number)) return null;
  if (ACTIVE_BOTS >= MAX_BOTS) throw new Error("BOT_LIMIT_REACHED");

  pairingLocks.add(number);
  retryCount.set(number, retryCount.get(number) || 0);

  const SESSION_DIR = path.join(PAIRING_DIR, number);
  await fs.ensureDir(SESSION_DIR);

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
    },
    logger:            pino({ level: "silent" }),
    browser:           Browsers.windows("Chrome"),
    printQRInTerminal: false
  });

  if (!GLOBAL_COMMANDS) GLOBAL_COMMANDS = await loadCommands();

  bots.set(number, {
    sock,
    connected:     false,
    krinyxUserId:  krinyxUserId,  // lien avec l'utilisateur Krinyx
    commands:      GLOBAL_COMMANDS,
    config:        CONFIG[number] || { prefix: "." },
    features: {
      autoread:      false,
      autoreact:     false,
      autotyping:    false,
      autorecording: false,
      welcome:       false,
      bye:           false,
      antilink:      false
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // ══════════════════════════════════════════
  // ÉTAPE 1 — CODE DE PAIRING
  // Demandé en premier, dès que le socket est prêt.
  // Entre ton numéro sur bot.html → ce code s'affiche →
  // WhatsApp > Appareils liés > Lier avec un numéro > entre le code
  // ══════════════════════════════════════════
  let pairingCode = null;
  if (!sock.authState.creds.registered) {
    await delay(1500);
    try {
      const raw   = await sock.requestPairingCode(number, 'ROKXD000');
      pairingCode = raw.match(/.{1,4}/g).join("-"); // ex: ABCD-1234
      console.log(`🔑 Code pairing ${number}: ${pairingCode}`);
    } catch (err) {
      pairingLocks.delete(number);
      bots.delete(number);
      throw err;
    }
  }

  // ══════════════════════════════════════════
  // ÉTAPE 2 — TIMEOUT
  // Si l'utilisateur n'entre pas le code dans les 5 min, on nettoie.
  // ══════════════════════════════════════════
  const autoClose = setTimeout(() => {
    if (!bots.get(number)?.connected) {
      try { sock.end(); } catch {}
      bots.delete(number);
      pairingLocks.delete(number);
      console.log(`⏱️ Timeout pairing ${number}`);
    }
  }, PAIRING_TIMEOUT);

  // ══════════════════════════════════════════
  // ÉTAPE 3 — CONNEXION
  // Déclenché automatiquement quand l'utilisateur entre le code dans WhatsApp.
  // ══════════════════════════════════════════
  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      clearTimeout(autoClose);
      pairingLocks.delete(number);
      const bot = bots.get(number);
      if (bot && !bot.connected) {
        bot.connected = true;
        ACTIVE_BOTS++;
        // Notifier le server.js que ce numéro est connecté
        // (pour l'associer à l'utilisateur Krinyx si session active)
        try {
          const { default: fetch } = await import('node-fetch');
          await fetch(`http://localhost:${process.env.PORT || 3000}/api/bot/link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number, userId: bot.krinyxUserId || null })
          });
        } catch {}
      }
      console.log(`✅ Bot ${number} connecté`);
    }

    if (connection === "close") {
      const status  = lastDisconnect?.error?.output?.statusCode;
      const retries = retryCount.get(number) || 0;

      if (status === DisconnectReason.loggedOut || retries >= MAX_RETRIES) {
        await removeSession(SESSION_DIR);
        bots.delete(number);
        pairingLocks.delete(number);
        retryCount.delete(number);
        ACTIVE_BOTS = Math.max(0, ACTIVE_BOTS - 1);
        console.log(`❌ Bot ${number} déconnecté définitivement`);
      } else {
        retryCount.set(number, retries + 1);
        console.log(`🔁 Reconnexion ${number} (${retries + 1}/${MAX_RETRIES})`);
        setTimeout(async () => {
          try { sock.end(); } catch {}
          bots.delete(number);
          pairingLocks.delete(number);
          await startPairingSession(number);
        }, 5000);
      }
    }
  });

  // ══════════════════════════════════════════
  // ÉTAPE 4 — MESSAGES
  // Actif seulement après connexion réussie (ÉTAPE 3).
  // ══════════════════════════════════════════
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message) return;

    const remoteJid   = msg.key.remoteJid;
    const participant = msg.key.participant || remoteJid;
    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption || "";

    if (!text) return;

    const bot = bots.get(number);
    if (!bot) return;
    const { commands, features } = bot;

    // Auto-features
    if (!msg.key.fromMe) {
      await delay(50);
      if (features.autoread)
        await sock.sendReadReceipt(remoteJid, participant, [msg.key.id]);
      if (features.autoreact) {
        const emojis = ["👍","❤️","😂","👏","🎉","🤔","🔥","😎","✨","🥳","💔"];
        await sock.sendMessage(remoteJid, { react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: msg.key } });
      }
      if (features.autotyping    && remoteJid.endsWith("@g.us")) await sock.sendPresenceUpdate("composing", remoteJid);
      if (features.autorecording && remoteJid.endsWith("@g.us")) await sock.sendPresenceUpdate("recording",  remoteJid);

      // Anti-lien
      if (features.antilink && remoteJid.endsWith("@g.us")) {
        try {
          const metadata  = await sock.groupMetadata(remoteJid);
          const botIsAdmin = metadata.participants.find(p => p.id === sock.user.id)?.admin;
          if (botIsAdmin) {
            const sender = metadata.participants.find(p => p.id === participant);
            if (!sender?.admin) {
              const linkRegex = /(https?:\/\/|www\.|wa\.me\/|chat\.whatsapp\.com\/|t\.me\/|bit\.ly\/|facebook\.com\/|instagram\.com\/)/i;
              if (linkRegex.test(text)) {
                try { await sock.sendMessage(remoteJid, { delete: { remoteJid, fromMe: false, id: msg.key.id, participant } }); } catch {}
                await sock.groupParticipantsUpdate(remoteJid, [participant], "remove");
                await sock.sendMessage(remoteJid, { text: `❌ @${participant.split("@")[0]} liens interdits.`, mentions: [participant] });
              }
            }
          }
        } catch {}
      }
    }

    // Identification du propriétaire (LID)
    const botNumber = sock.user?.id?.split(":")[0] || "";
    let userLid = sock.user?.lid || "";
    const credsPath = `./bots/rokxd/sessions/${botNumber}/creds.json`;
    if (await fs.pathExists(credsPath)) {
      try { userLid = JSON.parse(await fs.readFile(credsPath, "utf8"))?.me?.lid || userLid; } catch {}
    }
    const lid = userLid ? [userLid.split(":")[0] + "@lid"] : [];

    const prefix        = bot.config.prefix;
    const approvedUsers = bot.config.sudoList || [];
    const senderNum     = participant?.split("@")[0] || remoteJid?.split("@")[0];

    if (!text.startsWith(prefix)) return;
    if (!msg.key.fromMe && !approvedUsers.includes(senderNum) && !lid.includes(participant || remoteJid)) return;

    const args        = text.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();
    const togState    = args[0]?.toLowerCase();

    // Commandes built-in (features on/off)
    const featureMap = { autorecording:"autorecording", autotyping:"autotyping", autoread:"autoread", autoreact:"autoreact", welcome:"welcome", bye:"bye", antilink:"antilink" };
    if (featureMap[commandName]) {
      if (!["on","off"].includes(togState)) { await sock.sendMessage(remoteJid, { text: `❌ Usage: ${prefix}${commandName} on/off` }); return; }
      bot.features[featureMap[commandName]] = togState === "on";
      await sock.sendMessage(remoteJid, { text: `✅ ${commandName.toUpperCase()} → ${togState.toUpperCase()}` });
      return;
    }

    // Commandes custom
    if (commands.has(commandName)) {
      try {
        await delay(150);
        await commands.get(commandName).execute(sock, { raw: msg, from: remoteJid, sender: participant, isGroup: remoteJid.endsWith("@g.us"), reply: t => sock.sendMessage(remoteJid, { text: t }), bots }, args);
      } catch (err) {
        console.error("❌ Command error:", err);
        await sock.sendMessage(remoteJid, { text: "❌ Erreur commande" });
      }
    }
  });

  // ══════════════════════════════════════════
  // ÉTAPE 5 — WELCOME / BYE dans les groupes
  // ══════════════════════════════════════════
  sock.ev.on("group-participants.update", async ({ participants, action, id: groupId }) => {
    const bot = bots.get(number);
    if (!bot) return;
    for (const userJid of participants) {
      const name = userJid.split("@")[0];
      let ppUrl = null;
      try { ppUrl = await sock.profilePictureUrl(userJid, "image"); } catch {}
      if (action === "add"    && bot.features.welcome) {
        const t = `👋 Bienvenue @${name} !`;
        ppUrl ? await sock.sendMessage(groupId, { image: { url: ppUrl }, caption: t, mentions: [userJid] }) : await sock.sendMessage(groupId, { text: t, mentions: [userJid] });
      }
      if (action === "remove" && bot.features.bye) {
        const t = `👋 Au revoir @${name}`;
        ppUrl ? await sock.sendMessage(groupId, { image: { url: ppUrl }, caption: t, mentions: [userJid] }) : await sock.sendMessage(groupId, { text: t, mentions: [userJid] });
      }
    }
  });

  return pairingCode; // null si déjà connecté
}

// =======================
// ROUTES

// GET /rokxd/pair-api/code?number=237XXXXXXXX&userId=123
// → Retourne { code: "ABCD-1234" } ou { status: "Déjà connecté" }
router.get("/code", async (req, res) => {
  try {
    let num = req.query.number;
    const userId = req.query.userId || null;
    if (!num) return res.status(400).json({ error: "Numéro requis" });
    num = formatNumber(num);
    if (pairingLocks.has(num)) return res.status(429).json({ error: "Pairing déjà en cours pour ce numéro" });
    const code = await startPairingSession(num, userId);
    res.json(code ? { code } : { status: "Ce numéro est déjà connecté" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /rokxd/pair-api/config  { number, prefix }
// → Sauvegarde le préfixe des commandes pour ce bot
router.post("/config", async (req, res) => {
  try {
    let { number, prefix } = req.body;
    if (!number) return res.status(400).json({ error: "Numéro requis" });
    number = formatNumber(number);
    if (!prefix) prefix = ".";
    CONFIG[number] = { prefix };
    if (bots.has(number)) bots.get(number).config = { prefix };
    await saveConfig();
    res.json({ status: `✅ Préfixe "${prefix}" sauvegardé`, prefix });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// EXPORT
export default router;
