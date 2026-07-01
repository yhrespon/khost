import fs from "fs";
import path from "path";

const FILE = path.join("./welcome.json");

// Assure l’existence du fichier
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({ global: false }, null, 2));

// ─── UTILITAIRES ─────────────────────
function readJSON() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return { global: false };
  }
}

function writeJSON(cfg) {
  fs.writeFileSync(FILE, JSON.stringify(cfg, null, 2));
}

function getBareNumber(input) {
  if (!input) return "";
  return String(input).split("@")[0].split(":")[0].replace(/[^0-9]/g, "");
}

// ─── COMMANDE WELCOME ON/OFF ─────────
export default {
  name: "welcome",
  aliases: ["bienvenue", "bye"],
  description: "Active ou désactive le welcome global",
  execute: async (sock, ctx, args) => {
    const opt = (args[0] || "").toLowerCase();
    if (!["on", "off"].includes(opt)) return ctx.reply?.("⚙️ Utilisation : .welcome on / off");

    const cfg = readJSON();
    cfg.global = opt === "on"; // activation globale
    writeJSON(cfg);

    await ctx.reply(`✅ Welcome ${cfg.global ? "activé" : "désactivé"} pour tous les groupes !`);
  }
};

// ─── ÉVÉNEMENTS JOIN / LEAVE ─────────
export function welcomeEvents(sock) {
  sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
    try {
      const cfg = readJSON();
      if (!cfg.global) return; // welcome désactivé

      const metadata = await sock.groupMetadata(id);
      const groupName = metadata.subject;
      const groupDesc = metadata.desc || "📭 Aucune description définie pour ce groupe.";

      for (const participant of participants) {
        const name = participant.split("@")[0];
        let pp = "https://files.catbox.moe/2yz2qu.jpg";
        try { pp = await sock.profilePictureUrl(participant, "image"); } catch {}

        let text = "";
        if (action === "add") {
          text = `👋 Bienvenue @${name} dans *${groupName}* !_\n> _📝 Description : ${groupDesc}`;
        } else if (action === "remove") {
          text = `👋 @${name} a quitté le groupe *${groupName}*._\n> _📝 Description : ${groupDesc}`;
        }

        await sock.sendMessage(id, { text, mentions: [participant] });
      }
    } catch (err) {
      console.error("[welcomeEvents]", err);
    }
  });
}