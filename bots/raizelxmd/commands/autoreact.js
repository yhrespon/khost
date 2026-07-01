import fs from "fs";
const FILE = "./autoreact.json";

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
// COMMANDE AUTOREACT
export default {
  name: "autoreact",
  aliases: ["reactauto"],
  description: "Active ou désactive l'AutoReact dans ce chat",
  execute: async (sock, ctx, args) => {
    try {
      const jid = ctx.from || "";
      if (!jid) return;

      const opt = (args[0] || "").toLowerCase();
      if (!["on", "off"].includes(opt)) {
        return ctx.reply("Usage: .autoreact on/off");
      }

      const cfg = readJSON(FILE);
      cfg[jid] = opt === "on";
      writeJSON(FILE, cfg);

      await ctx.reply(`AutoReact ${opt === "on" ? "activé" : "désactivé"}`);
    } catch (err) {
      console.error("[autoreact.execute]", err);
      if (ctx.reply) await ctx.reply("Erreur lors de l'activation d'AutoReact.");
    }
  }
};

// =======================
// LISTE DES 14 REACTIONS
const reactions = ["😎","❤️","😂","😢","😡","👍","👎","🙏","🤔","🥳","😱","😴","🤯","😍"];

// =======================
// EVENTS HANDLER
export function autoreactEvents(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    if (!messages || !messages[0]) return;
    const msg = messages[0];
    if (!msg || !msg.key || !msg.message) return;

    const remoteJid = msg.key.remoteJid || "";
    if (!remoteJid) return;

    const cfg = readJSON(FILE);
    if (!cfg[remoteJid]) return; // AutoReact désactivé pour ce chat

    try {
      // Choix aléatoire d'une réaction parmi les 14
      const emoji = reactions[Math.floor(Math.random() * reactions.length)];
      await sock.sendMessage(remoteJid, { react: { text: emoji, key: msg.key } });
    } catch (err) {
      console.error("[autoreactEvents]", err.message);
    }
  });
}