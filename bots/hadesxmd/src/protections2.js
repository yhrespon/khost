import { createRequire } from "module";
const require = createRequire(import.meta.url);
import fs from "fs";
import { writeJSON } from "./lib/dataManager.js";
const config = require("../config.json");

// =================== HELPERS ===================
function normalizeJid(jid) {
  if (!jid) return null;
  return jid.split(":")[0].replace("@lid", "@s.whatsapp.net");
}

function getBareNumber(jid) {
  if (!jid) return "";
  return normalizeJid(jid).split("@")[0].replace(/[^0-9]/g, "");
}

function senderIsOwner(sender, sock) {
  const ownersList = sock.sessionOwners || [];
  return ownersList.includes(getBareNumber(sender));
}

async function isAdmin(sock, groupId, jid) {
  try {
    const metadata = await sock.groupMetadata(groupId);
    const participant = metadata.participants.find(p => p.id === jid);
    return participant?.admin || false;
  } catch {
    return false;
  }
}

// =================== PROTECTIONS STORAGE ===================
function getProtectionFile(owner) {
  return `./protections2-${owner}.json`;
}

function loadProtections(owner) {
  const file = getProtectionFile(owner);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file));
  return {};
}

function saveProtections(owner, protections) {
  const file = getProtectionFile(owner);
  writeJSON(file, protections);
}

function getGroupProtection(owner, jid, protections) {
  if (!protections[jid]) {
    protections[jid] = {
      antibot: false,
      antitag: false,
      antispam: false
    };
  }
  return protections[jid];
}

// =================== PROTECTIONS STRICTES ===================
const spamTracker = {};

function initProtectionsStrict(sock) {
  const commandRegex = /^[!?#.$%&*+\-\/:;=?@^_`~\u2700-\u27BF\uE000-\uF8FF]/;

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message) continue;

      const from = msg.key.remoteJid;
      if (!from?.endsWith?.("@g.us")) continue;

      const sender = msg.key.participant || from;
      if (sender === sock.user.id) continue;
      if (senderIsOwner(sender, sock)) continue;

      const bareOwner = sock.sessionOwnerId || (sock.sessionOwners && sock.sessionOwners[0]);
      if (!bareOwner) continue; // fallback si pas défini

      const protections = loadProtections(bareOwner);
      const groupProtection = getGroupProtection(bareOwner, from, protections);

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        "";

      const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

      try {
        // ANTIBOT
        if (groupProtection.antibot && commandRegex.test(text)) {
          await sock.sendMessage(from, { delete: msg.key });
          await sock.groupParticipantsUpdate(from, [sender], "remove");
        }

        // ANTITAG
        if (groupProtection.antitag && mentions.length > 0) {
          await sock.sendMessage(from, { delete: msg.key });
          await sock.groupParticipantsUpdate(from, [sender], "remove");
        }

        // ANTISPAM
        if (groupProtection.antispam) {
          const now = Date.now();
          if (!spamTracker[from]) spamTracker[from] = {};
          if (!spamTracker[from][sender]) spamTracker[from][sender] = [];
          spamTracker[from][sender].push(now);
          spamTracker[from][sender] = spamTracker[from][sender].filter(ts => now - ts <= 3000);

          if (spamTracker[from][sender].length >= 5) {
            await sock.sendMessage(from, { delete: msg.key });
            await sock.groupParticipantsUpdate(from, [sender], "remove");
            spamTracker[from][sender] = [];
          }
        }
      } catch {}
    }
  });
}

// =================== TOGGLE COMMANDS ===================
function toggleProtectionCommands(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message) continue;

      const from = msg.key.remoteJid;
      const sender = msg.key.participant || from;
      if (!senderIsOwner(sender, sock)) continue;

      const bareOwner = sock.sessionOwnerId || (sock.sessionOwners && sock.sessionOwners[0]);
      if (!bareOwner) continue;

      const protections = loadProtections(bareOwner);
      const groupProtection = getGroupProtection(bareOwner, from, protections);

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        "";
      if (!text.startsWith(config.PREFIXE_COMMANDE)) continue;

      const args = text.slice(config.PREFIXE_COMMANDE.length).trim().split(/ +/);
      const [command, value] = args;

      const keys = ["antibot","antitag","antispam"];
      if (!keys.includes(command?.toLowerCase())) continue;
      if (!["on","off"].includes(value?.toLowerCase())) continue;

      groupProtection[command.toLowerCase()] = value.toLowerCase() === "on";
      saveProtections(bareOwner, protections);

      const feature = command.charAt(0).toUpperCase() + command.slice(1);
      const confirmText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
${value.toLowerCase() === "on" ? "✅ *Protection activée*" : "❌ *Protection désactivée*"}
⚔️ Type: *${feature}*
👑 Owner: ${bareOwner}
╚════ஜ۩۞۩ஜ═════╝`;

      try { await sock.sendMessage(from, { text: confirmText }, { quoted: msg }); } catch {}
    }
  });
}

// =================== INIT ===================
function initProtections2(sock) {
  initProtectionsStrict(sock);
  toggleProtectionCommands(sock);
}

export default { initProtections2 };