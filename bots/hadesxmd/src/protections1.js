import { createRequire } from "module";
const require = createRequire(import.meta.url);
import fs from "fs";
import { readJSON, writeJSON } from "./lib/dataManager.js";
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

async function senderIsAdmin(sock, jid, sender) {
  try {
    const groupMetadata = await sock.groupMetadata(jid);
    const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
    return admins.includes(sender);
  } catch {
    return false;
  }
}

async function sendAudio(sock, jid, path, quoted) {
  try {
    await sock.sendMessage(jid, { audio: { url: path }, mimetype: "audio/mp3" }, { quoted });
  } catch {}
}

// =================== PROTECTIONS PAR OWNER ===================
function getProtectionFile(owner) {
  return `./protections1-${owner}.json`;
}

function loadProtections(owner) {
  const file = getProtectionFile(owner);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file));
  }
  return {}; // vide au départ
}

function saveProtections(owner, protections) {
  const file = getProtectionFile(owner);
  writeJSON(file, protections);
}

// =================== GROUP PROTECTION HELP ===================
function getGroupProtection(owner, jid, protections) {
  if (!protections[jid]) {
    protections[jid] = {
      antiSticker: false,
      antiAudio: false,
      antiVideo: false,
      antiMessage: false,
      autoMention: false,
      antiPhoto: false,
      antiCall: false
    };
  }
  return protections[jid];
}

// =================== PROTECTIONS ===================
function antiSticker(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || !msg.key.remoteJid?.endsWith("@g.us")) continue;

      const jid = msg.key.remoteJid;
      const sender = msg.key.participant || jid;
      const bareOwner = getBareNumber(sender);

      const protections = loadProtections(bareOwner);
      const groupProtection = getGroupProtection(bareOwner, jid, protections);

      if (!groupProtection.antiSticker) continue;
      if (senderIsOwner(sender, sock) || await senderIsAdmin(sock, jid, sender)) continue;

      if (msg.message.stickerMessage) {
        try { await sock.sendMessage(jid, { delete: msg.key }); } catch {}
      }
    }
  });
}

function antiAudio(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || !msg.key.remoteJid?.endsWith("@g.us")) continue;

      const jid = msg.key.remoteJid;
      const sender = msg.key.participant || jid;
      const bareOwner = getBareNumber(sender);

      const protections = loadProtections(bareOwner);
      const groupProtection = getGroupProtection(bareOwner, jid, protections);

      if (!groupProtection.antiAudio) continue;
      if (senderIsOwner(sender, sock) || await senderIsAdmin(sock, jid, sender)) continue;

      if (msg.message.audioMessage || msg.message.voiceMessage) {
        try { await sock.sendMessage(jid, { delete: msg.key }); } catch {}
      }
    }
  });
}

function antiVideo(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || !msg.key.remoteJid?.endsWith("@g.us")) continue;

      const jid = msg.key.remoteJid;
      const sender = msg.key.participant || jid;
      const bareOwner = getBareNumber(sender);

      const protections = loadProtections(bareOwner);
      const groupProtection = getGroupProtection(bareOwner, jid, protections);

      if (!groupProtection.antiVideo) continue;
      if (senderIsOwner(sender, sock) || await senderIsAdmin(sock, jid, sender)) continue;

      if (msg.message.videoMessage) {
        try { await sock.sendMessage(jid, { delete: msg.key }); } catch {}
      }
    }
  });
}

function antiMessage(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || !msg.key.remoteJid?.endsWith("@g.us")) continue;

      const jid = msg.key.remoteJid;
      const sender = msg.key.participant || jid;
      const bareOwner = getBareNumber(sender);

      const protections = loadProtections(bareOwner);
      const groupProtection = getGroupProtection(bareOwner, jid, protections);

      if (!groupProtection.antiMessage) continue;
      if (senderIsOwner(sender, sock) || await senderIsAdmin(sock, jid, sender)) continue;

      if (msg.message.conversation || msg.message.extendedTextMessage) {
        try { await sock.sendMessage(jid, { delete: msg.key }); } catch {}
      }
    }
  });
}

function autoMention(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || !msg.key.remoteJid?.endsWith("@g.us")) continue;

      const jid = msg.key.remoteJid;
      const sender = msg.key.participant || jid;
      const bareOwner = getBareNumber(sender);

      const protections = loadProtections(bareOwner);
      const groupProtection = getGroupProtection(bareOwner, jid, protections);

      if (!groupProtection.autoMention) continue;
      if (senderIsOwner(sender, sock) || await senderIsAdmin(sock, jid, sender)) continue;

      const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      const botJid = sock.user?.id;
      if (mentions.includes(botJid)) {
        await sendAudio(sock, jid, "./media/mention.mp3", msg);
      }
    }
  });
}

function antiPhoto(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || !msg.key.remoteJid?.endsWith("@g.us")) continue;

      const jid = msg.key.remoteJid;
      const sender = msg.key.participant || jid;
      const bareOwner = getBareNumber(sender);

      const protections = loadProtections(bareOwner);
      const groupProtection = getGroupProtection(bareOwner, jid, protections);

      if (!groupProtection.antiPhoto) continue;
      if (senderIsOwner(sender, sock) || await senderIsAdmin(sock, jid, sender)) continue;

      if (msg.message.imageMessage) {
        try { await sock.sendMessage(jid, { delete: msg.key }); } catch {}
      }
    }
  });
}

function antiCall(sock) {
  sock.ev.on("call", async (callData) => {
    const { from, isGroup } = callData;
    if (!isGroup) return;

    const jid = from;
    const sender = callData.participant || from;
    const bareOwner = getBareNumber(sender);

    const protections = loadProtections(bareOwner);
    const groupProtection = getGroupProtection(bareOwner, jid, protections);

    if (!groupProtection.antiCall) return;
    if (senderIsOwner(sender, sock)) return;

    try {
      await sock.rejectCall(from);
      await sock.sendMessage(from, { text: "❌ Les appels de groupe sont désactivés par la protection." });
    } catch {}
  });
}

// =================== COMMANDES ON/OFF ===================
function toggleProtectionCommands1(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message) continue;
      const from = msg.key.remoteJid;
      const sender = msg.key.participant || from;
      const bareOwner = getBareNumber(sender);

      if (!senderIsOwner(sender, sock)) continue;

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        "";
      if (!text.startsWith(config.PREFIXE_COMMANDE)) continue;

      const args = text.slice(config.PREFIXE_COMMANDE.length).trim().split(/ +/);
      const [command, value] = args;
      const mapping = {
        antisticker: "antiSticker",
        antiaudio: "antiAudio",
        antivideo: "antiVideo",
        antimessage: "antiMessage",
        automen: "autoMention",
        antiphoto: "antiPhoto",
        anticall: "antiCall"
      };
      const feature = mapping[command?.toLowerCase()];
      if (!feature || !["on","off"].includes(value?.toLowerCase())) continue;

      const protections = loadProtections(bareOwner);
      const groupProtection = getGroupProtection(bareOwner, from, protections);

      groupProtection[feature] = value.toLowerCase() === "on";
      saveProtections(bareOwner, protections);

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
function initProtections1(sock) {
  antiSticker(sock);
  antiAudio(sock);
  antiVideo(sock);
  antiMessage(sock);
  autoMention(sock);
  antiPhoto(sock);
  antiCall(sock);
  toggleProtectionCommands1(sock);
}

export default { initProtections1 };