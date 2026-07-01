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

// =================== PROTECTIONS STORAGE ===================
function getProtectionFile(owner) {
  return `./protections3-${owner}.json`;
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
  if (!protections[jid]) protections[jid] = { antilink: false };
  return protections[jid];
}

// =================== ANTI LINK ===================
function antiLink(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message) continue;

      const from = msg.key.remoteJid;
      if (!from?.endsWith?.("@g.us")) continue;

      const sender = msg.key.participant || from;
      if (sender === sock.user.id) continue;
      if (senderIsOwner(sender, sock)) continue;

      const bareOwner = sock.sessionOwnerId || (sock.sessionOwners && sock.sessionOwners[0]);
      if (!bareOwner) continue;

      const protections = loadProtections(bareOwner);
      const groupProtection = getGroupProtection(bareOwner, from, protections);

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        msg.message.videoMessage?.caption ||
        "";
      if (!text) continue;

      if (groupProtection.antilink) {
        try { await sock.sendMessage(from, { delete: msg.key }); } catch {}
      }
    }
  });
}

// =================== TOGGLE COMMAND ===================
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
      if (command?.toLowerCase() !== "antilink") continue;
      if (!["on","off"].includes(value?.toLowerCase())) continue;

      groupProtection.antilink = value.toLowerCase() === "on";
      saveProtections(bareOwner, protections);

      const confirmText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
${value.toLowerCase() === "on" ? "✅ *Anti-Link activé*" : "❌ *Anti-Link désactivé*"}
👑 Owner: ${bareOwner}
╚════ஜ۩۞۩ஜ═════╝`;

      try { await sock.sendMessage(from, { text: confirmText }, { quoted: msg }); } catch {}
    }
  });
}

// =================== INIT ===================
function initProtections3(sock) {
  antiLink(sock);
  toggleProtectionCommands(sock);
}

export default { initProtections3 };