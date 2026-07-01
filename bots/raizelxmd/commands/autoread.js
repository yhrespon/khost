import fs from "fs";
const FILE = "./autoread.json";

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
// COMMANDE AUTOREAD
export default {
  name: "autoread",
  aliases: ["readauto"],
  description: "Active ou désactive AutoRead pour ce chat",
  execute: async (sock, ctx, args) => {
    try {
      const jid = ctx.from || "";
      if (!jid) return;

      const opt = (args[0] || "").toLowerCase();
      if (!["on", "off"].includes(opt)) {
        return ctx.reply("Usage: .autoread on/off");
      }

      const cfg = readJSON(FILE);
      cfg[jid] = opt === "on";
      writeJSON(FILE, cfg);

      await ctx.reply(`AutoRead ${opt === "on" ? "activé" : "désactivé"}`);
    } catch (err) {
      console.error("[autoread.execute]", err);
      if (ctx.reply) await ctx.reply("Erreur lors de l'activation d'AutoRead.");
    }
  }
};

// =======================
// EVENTS HANDLER
export function autoreadEvents(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    if (!messages || !messages[0]) return;
    const msg = messages[0];
    if (!msg || !msg.key || !msg.message) return;

    const remoteJid = msg.key.remoteJid || "";
    if (!remoteJid) return;

    const cfg = readJSON(FILE);
    if (!cfg[remoteJid]) return; // AutoRead désactivé pour ce chat

    try {
      // Marque le message comme lu
      await sock.readMessages([msg.key]);
    } catch (err) {
      console.error("[autoreadEvents]", err.message);
    }
  });
}