import fs from "fs";
const FILE = "./autotyping.json";

// =======================
// READ / WRITE JSON
function readJSON(file) {
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return {};
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// =======================
// COMMANDE AUTOTYPING
export default {
  name: "autotyping",
  aliases: ["typingauto"],
  description: "Active ou désactive AutoTyping global",
  execute: async (sock, ctx, args) => {
    try {
      const jid = ctx.from || "";
      if (!jid) return;

      const opt = (args[0] || "").toLowerCase();
      if (!["on", "off"].includes(opt)) {
        return ctx.reply("Usage: .autotyping on/off");
      }

      const cfg = readJSON(FILE);
      cfg.global = opt === "on"; // activation globale
      writeJSON(FILE, cfg);

      await ctx.reply(`AutoTyping ${opt === "on" ? "activé" : "désactivé"}`);
    } catch (err) {
      console.error("[autotyping.execute]", err);
      if (ctx.reply) await ctx.reply("Erreur lors de l'activation d'AutoTyping.");
    }
  }
};

// =======================
// EVENTS HANDLER
export function autotypingEvents(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    if (!messages || !messages[0]) return;
    const msg = messages[0];
    if (!msg || !msg.key || !msg.message) return;

    const cfg = readJSON(FILE);
    if (!cfg.global) return; // AutoTyping désactivé

    try {
      await sock.sendPresenceUpdate("composing", msg.key.remoteJid);
      // Durée 2s pour simuler "typing"
      setTimeout(async () => {
        await sock.sendPresenceUpdate("available", msg.key.remoteJid);
      }, 2000);
    } catch (err) {
      console.error("[autotypingEvents]", err.message);
    }
  });
}