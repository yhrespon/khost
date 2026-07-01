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

// =================== PROTECTIONS PAR OWNER ===================
function getProtectionFile(owner) {
  return `./protections-${owner}.json`;
}

function loadProtections(owner) {
  const file = getProtectionFile(owner);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file));
  }
  return { antiPromote: false, antiDemote: false };
}

function saveProtections(owner, protections) {
  const file = getProtectionFile(owner);
  writeJSON(file, protections);
}

// =================== COMMANDES ===================
async function handleCommand(sock, msg) {
  const text = msg?.message?.conversation || "";
  const sender = msg?.key?.participant || msg?.key.remoteJid;
  const from = msg.key.remoteJid;
  const bareSender = getBareNumber(sender);

  if (!text.startsWith(config.PREFIXE_COMMANDE)) return;
  if (!senderIsOwner(sender, sock)) return;

  const args = text.slice(config.PREFIXE_COMMANDE.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  let protections = loadProtections(bareSender);

  if (cmd === "antipromote" || cmd === "antidemote") {
    const key = cmd === "antipromote" ? "antiPromote" : "antiDemote";
    const arg = args[0];

    protections[key] = arg === "on";
    saveProtections(bareSender, protections);

    const mText = `╔═ஜ۩ 𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷 ۩ஜ═╗
✅ *Protection ${protections[key] ? "activée" : "désactivée"}*
⚔️ Type: *${key.charAt(0).toUpperCase() + key.slice(1)}*
👑 Owner: ${bareSender}
╚════ஜ۩۞۩ஜ═════╝`;

    try {
      await sock.sendMessage(from, { text: mText }, { quoted: msg });
    } catch (e) {
      console.log("toggleProtectionCommands error:", e);
    }
  }
}

// =================== PROTECTIONS ===================
async function antiPromote(sock, chat, action) {
  const bareSender = getBareNumber(action.sender);
  const protections = loadProtections(bareSender);

  if (!protections.antiPromote) return;
  if (senderIsOwner(action.sender, sock)) return;

  try {
    await sock.groupParticipantsUpdate(chat, [action.promoted], "demote");
    console.log(`[ANTI-PROMOTE][${bareSender}] ${action.sender} a promu ${action.promoted}, démotion automatique.`);
  } catch (err) {
    console.error("[ANTI-PROMOTE] Impossible de démotionner :", err);
  }
}

async function antiDemote(sock, chat, action) {
  const bareSender = getBareNumber(action.sender);
  const protections = loadProtections(bareSender);

  if (!protections.antiDemote) return;
  if (senderIsOwner(action.sender, sock)) return;

  try {
    await sock.groupParticipantsUpdate(chat, [action.demoted], "promote");
    console.log(`[ANTI-DEMOTE][${bareSender}] ${action.sender} a démoté ${action.demoted}, promotion automatique.`);
  } catch (err) {
    console.error("[ANTI-DEMOTE] Impossible de promouvoir :", err);
  }
}

// =================== INIT ===================
function initProtections(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg?.message) continue;
      await handleCommand(sock, msg);
    }
  });

  sock.ev.on("group-participants.update", async (update) => {
    const chat = update.id;
    for (const p of update.participants) {
      if (update.action === "promote") {
        await antiPromote(sock, chat, { sender: update.actor, promoted: p });
      }
      if (update.action === "demote") {
        await antiDemote(sock, chat, { sender: update.actor, demoted: p });
      }
    }
  });
}

export default { initProtections };