import fs from "fs";
const FILE = "./autorecording.json";

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
// COMMANDE AUTORECORDING
export default {
  name: "autorecording",
  aliases: ["recordauto"],
  description: "Active ou désactive AutoRecording global",
  execute: async (sock, ctx, args) => {
    try {
      const jid = ctx.from || "";
      if (!jid) return;

      const opt = (args[0] || "").toLowerCase();
      if (!["on", "off"].includes(opt)) {
        return ctx.reply("Usage: .autorecording on/off");
      }

      const cfg = readJSON(FILE);
      cfg.global = opt === "on"; // activation globale
      writeJSON(FILE, cfg);

      await ctx.reply(`AutoRecording ${opt === "on" ? "activé" : "désactivé"}`);
    } catch (err) {
      console.error("[autorecording.execute]", err);
      if (ctx.reply) await ctx.reply("Erreur lors de l'activation d'AutoRecording.");
    }
  }
};

// =======================
// EVENTS HANDLER
export function autorecordingEvents(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    if (!messages || !messages[0]) return;
    const msg = messages[0];
    if (!msg || !msg.key || !msg.message) return;

    const cfg = readJSON(FILE);
    if (!cfg.global) return; // AutoRecording désactivé

    try {
      await sock.sendPresenceUpdate("recording", msg.key.remoteJid);
      // Durée 2s pour simuler "recording"
      setTimeout(async () => {
        await sock.sendPresenceUpdate("available", msg.key.remoteJid);
      }, 2000);
    } catch (err) {
      console.error("[autorecordingEvents]", err.message);
    }
  });
}