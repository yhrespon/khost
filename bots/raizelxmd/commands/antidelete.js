import fs from "fs";
const FILE = "./antidelete.json";

// =======================
// LECTURE/ÉCRITURE CONFIG
function readConfig() {
  if (!fs.existsSync(FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeConfig(cfg) {
  fs.writeFileSync(FILE, JSON.stringify(cfg, null, 2));
}

// =======================
// STOCKAGE DES MESSAGES
const messageCache = {};
const deletedMessages = new Set();

// =======================
// COMMANDE ANTIDELETE (ON/OFF)
export default {
  name: "antidelete",
  description: "Active ou désactive l'antidelete dans ce chat",
  execute: async (sock, ctx, args) => {
    try {
      const jid = ctx.from || "";
      if (!jid) return;

      const opt = (args[0] || "").toLowerCase();
      if (!["on", "off"].includes(opt)) {
        return ctx.reply("Usage: .antidelete on/off");
      }

      const cfg = readConfig();
      cfg[jid] = opt === "on";
      writeConfig(cfg);

      await ctx.reply(`Antidelete ${opt === "on" ? "activé" : "désactivé"}`);
    } catch (err) {
      console.error("Erreur commande antidelete :", err);
      if (ctx.reply) await ctx.reply("Erreur lors de l'exécution de la commande.");
    }
  }
};

// =======================
// ÉCOUTE DES MESSAGES
export function antideleteEvents(sock) {
  // Sauvegarde des messages reçus
  sock.ev.on("messages.upsert", async ({ messages }) => {
    if (!messages || !messages[0]) return;
    const msg = messages[0];
    if (!msg || !msg.key || !msg.message) return;

    const key = msg.key;
    const msgId = `${key.remoteJid || ""}-${key.id || ""}`;
    if (!messageCache[msgId]) messageCache[msgId] = JSON.parse(JSON.stringify(msg));
  });

  // Détection des messages supprimés
  sock.ev.on("messages.update", async updates => {
    if (!updates || !updates.length) return;

    for (const update of updates) {
      const key = update.key;
      if (!key || !key.remoteJid || !key.id) continue;

      const isDeleted = update.update?.status === "revoked" || update.update?.messageStubType === 1;
      if (!isDeleted) continue;

      const msgId = `${key.remoteJid}-${key.id}`;
      if (deletedMessages.has(msgId)) continue;
      deletedMessages.add(msgId);

      const original = messageCache[msgId];
      if (!original) continue;

      const cfg = readConfig();
      if (!cfg[key.remoteJid]) continue; // antidelete désactivé pour ce chat

      const senderBare = original.key.participant
        ? original.key.participant.split("@")[0]
        : key.remoteJid.split("@")[0];
      const targets = [original.key.participant || key.remoteJid];

      try {
        const type = Object.keys(original.message)[0];
        let text = "";

        switch (type) {
          case "conversation":
          case "extendedTextMessage":
            text = original.message.conversation || original.message.extendedTextMessage?.text || "Message supprimé";
            await sock.sendMessage(key.remoteJid, {
              text: `Message supprimé par @${senderBare}: ${text}`,
              mentions: targets
            });
            break;

          case "imageMessage":
          case "videoMessage":
          case "audioMessage":
          case "stickerMessage":
          case "documentMessage":
            await sock.sendMessage(key.remoteJid, {
              text: `Message supprimé par @${senderBare} (média ${type.replace("Message","").toLowerCase()})`,
              mentions: targets
            });
            await sock.sendMessage(key.remoteJid, { forward: original, contextInfo: { isForwarded: true } });
            break;

          default:
            await sock.sendMessage(key.remoteJid, {
              text: `Message supprimé par @${senderBare} (type: ${type})`,
              mentions: targets
            });
        }
      } catch (err) {
        console.error("ANTIDELETE error:", err);
      }

      delete messageCache[msgId];
      deletedMessages.delete(msgId);
    }
  });
}