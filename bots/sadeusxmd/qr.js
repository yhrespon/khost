// =======================
// IMPORTS
import express from "express";
import fs from "fs-extra";
import path from "path";
import pino from "pino";
import pn from "awesome-phonenumber";
import QRCode from "qrcode";
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
const PAIRING_DIR = "./bots/sadeusxmd/sessions";

// =======================
// LIMITES SERVEUR
const MAX_BOTS = 25;
const MAX_RETRIES = 3;
const PAIRING_TIMEOUT = 5 * 60 * 1000;
let ACTIVE_BOTS = 0;
const retryCount = new Map();

// =======================
// UTILITIES
function formatNumber(num) {
  const phone = pn("+" + num.replace(/\D/g, ""));
  if (!phone.isValid()) throw new Error("Numéro invalide");
  return phone.getNumber("e164").replace("+", "");
}

// =======================
// LOAD COMMANDS
async function loadCommands() {
  const commands = new Map();
  const folder   = path.resolve("./bots/sadeusxmd/commands");
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
// BOTS MAP
const bots = new Map(); // number => { sock, commands, prefix, features }

// =======================
// LID
function getLid(number, sock) {
  try {
    const data = JSON.parse(fs.readFileSync(`${PAIRING_DIR}/${number}/creds.json`, "utf8"));
    return data?.me?.lid || sock.user?.lid || "";
  } catch {
    return sock.user?.lid || "";
  }
}

// =======================
// REMOVE SESSION
async function removeSession(dir) {
  if (await fs.pathExists(dir)) await fs.remove(dir);
}

// =======================
// START SESSION
async function startPairingSession(number, userPrefix = ".") {
  if (ACTIVE_BOTS >= MAX_BOTS) throw new Error("BOT_LIMIT_REACHED");

  const SESSION_DIR = path.join(PAIRING_DIR, number);
  if (await fs.pathExists(SESSION_DIR)) await fs.remove(SESSION_DIR);
  await fs.ensureDir(SESSION_DIR);

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })) },
    logger: pino({ level: "silent" }),
    browser: Browsers.windows("Chrome"),
    markOnlineOnConnect: false
  });

  ACTIVE_BOTS++;
  retryCount.set(number, 0);
  sock.ev.on("creds.update", saveCreds);

  const commands = await loadCommands();
  const prefix = userPrefix; // ✅ préfixe unique par bot

  const features = {
    autoread: false,
    autoreact: false,
    autotyping: false,
    autorecording: false,
    welcome: false,
    bye: false,
    antilink: false
  };

  bots.set(number, { sock, commands, prefix, features });

  // =======================
  // QR REAL
  const qrData = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timeout QR")), 120000);

    sock.ev.on("connection.update", async (u) => {
      if (u.qr) {
        clearTimeout(timeout);
        resolve(await QRCode.toDataURL(u.qr));
      }
      if (u.connection === "close") {
        clearTimeout(timeout);
        reject(new Error("Connexion fermée"));
      }
    });
  });

  // =======================
  // MESSAGE HANDLER
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message) return;

    const remoteJid = msg.key.remoteJid;
    const participant = msg.key.participant || remoteJid;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption || "";

    if (!text) return;

    const bot = bots.get(number);
    if (!bot) return;
    const { commands, features, prefix } = bot;

    // =======================
    // AUTO FEATURES
    if (!msg.key.fromMe) {
      await delay(50);

      if (features.autoread)
        await sock.sendReadReceipt(remoteJid, participant, [msg.key.id]);

      if (features.autoreact) {
        const reactions = ["👍","❤️","😂","👏","🎉","🤔","🔥","😎","✨","🥳","💔"];
        const react = reactions[Math.floor(Math.random() * reactions.length)];
        await sock.sendMessage(remoteJid, { react: { text: react, key: msg.key } });
      }

      if (features.autotyping && remoteJid.endsWith("@g.us"))
        await sock.sendPresenceUpdate("composing", remoteJid);

      if (features.autorecording && remoteJid.endsWith("@g.us"))
        await sock.sendPresenceUpdate("recording", remoteJid);

      // =======================
      // ANTI-LINK
      if (features.antilink && remoteJid.endsWith("@g.us")) {
        try {
          const metadata = await sock.groupMetadata(remoteJid);
          const botJid = sock.user.id;
          const botAdmin = metadata.participants.find(p => p.id === botJid)?.admin;
          if (!botAdmin) return;
          if (participant === botJid) return;

          const linkRegex = /(https?:\/\/|www\.|wa\.me\/|chat\.whatsapp\.com\/|t\.me\/|bit\.ly\/|facebook\.com\/|instagram\.com\/)/i;
          if (text.match(linkRegex)) {
            await sock.groupParticipantsUpdate(remoteJid, [participant], "remove");
            await sock.sendMessage(remoteJid, {
              text: `❌ @${participant.split("@")[0]} 𝙻𝚒𝚗𝚔𝚜 𝚗𝚘𝚝 𝚊𝚕𝚕𝚘𝚠𝚎𝚍`,
              mentions: [participant]
            });
          }
        } catch {}
      }
    }

    // =======================
    // COMMANDS HANDLER
    const botNumber = sock.user?.id ? sock.user.id.split(":")[0] : "";
    const userLid = getLid(botNumber, sock);
    const lid = userLid ? [userLid.split(":")[0] + "@lid"] : [];
    const cleanParticipant = participant ? participant.split("@") : [];
    const cleanRemoteJid = remoteJid ? remoteJid.split("@") : [];

    // sudo optionnel
    const approvedUsers = [];

    if (
      text.startsWith(prefix) &&
      (
        msg.key.fromMe ||
        approvedUsers.includes(cleanParticipant[0] || cleanRemoteJid[0]) ||
        lid.includes(participant || remoteJid)
      )
    ) {
      const args = text.slice(prefix.length).trim().split(/\s+/);
      const commandName = args.shift().toLowerCase();

      // BUILT-IN FEATURES
      const featureMap = {
        autorecording: "autorecording",
        autotyping: "autotyping",
        autoread: "autoread",
        autoreact: "autoreact",
        welcome: "welcome",
        bye: "bye",
        antilink: "antilink"
      };

      if (featureMap[commandName]) {
        const state = args[0];
        if (!["on","off"].includes(state)) {
          await sock.sendMessage(remoteJid, { text: `❌ Usage: ${prefix}${commandName} on/off` });
          return;
        }
        features[featureMap[commandName]] = state === "on";
        await sock.sendMessage(remoteJid, { text: `✅ ${commandName.toUpperCase()} → ${state.toUpperCase()}` });
        return;
      }

      // CUSTOM COMMANDS
      if (commands.has(commandName)) {
        try {
          await delay(150);
          await commands.get(commandName).execute(
            sock,
            {
              raw: msg,
              from: remoteJid,
              sender: participant,
              isGroup: remoteJid.endsWith("@g.us"),
              reply: t => sock.sendMessage(remoteJid, { text: t }),
              bots
            },
            args
          );
        } catch (err) {
          console.error("❌ Command error:", err);
          await sock.sendMessage(remoteJid, { text: "❌ Error command" });
        }
      }
    }
  });

  // =======================
  // WELCOME / BYE
  sock.ev.on("group-participants.update", async ({ participants, action, id }) => {
    const bot = bots.get(number);
    if (!bot) return;
    for (const user of participants) {
      const name = user.split("@")[0];
      if (action === "add" && bot.features.welcome)
        await sock.sendMessage(id, { text: `👋 Welcome @${name}`, mentions: [user] });
      if (action === "remove" && bot.features.bye)
        await sock.sendMessage(id, { text: `😢 Goodbye @${name}`, mentions: [user] });
    }
  });

  return qrData;
}

// =======================
// ROUTE
router.get("/", async (req, res) => {
  let { number, prefix } = req.query;
  if (!number) return res.status(400).json({ error: "Numéro requis" });

  try {
    number = formatNumber(number);
    const qr = await startPairingSession(number, prefix || ".");
    res.json({ qr });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;