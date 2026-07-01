import fs from "fs";
const FILE = "./autobio.json";

// =======================
// AIDE POUR LES NUMÉROS
function getBareNumber(input) {
  if (!input) return "";
  const s = String(input);
  const beforeAt = s.split("@")[0];
  const beforeColon = beforeAt.split(":")[0];
  return beforeColon.replace(/[^0-9]/g, "");
}

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
// COMMANDE AUTOBIO
export default {
  name: "autobio",
  aliases: ["bioauto"],
  description: "Active ou désactive AutoBio pour ce chat",
  execute: async (sock, ctx, args) => {
    try {
      const jid = ctx.from || "";
      if (!jid) return;

      const opt = (args[0] || "").toLowerCase();
      const text = args.slice(1).join(" ") || "";

      if (!["on", "off"].includes(opt)) {
        return ctx.reply("Usage: .autobio on/off <texte>");
      }

      const cfg = readJSON(FILE);
      cfg[jid] = opt === "on" ? text : false;
      writeJSON(FILE, cfg);

      await ctx.reply(`AutoBio ${opt === "on" ? "activé" : "désactivé"}`);
    } catch (err) {
      console.error("[autobio.execute]", err);
      if (ctx.reply) await ctx.reply("Erreur lors de l'activation d'AutoBio.");
    }
  }
};

// =======================
// EVENTS HANDLER
export function autobioEvents(sock) {
  setInterval(async () => {
    try {
      const cfg = readJSON(FILE);
      for (const jid in cfg) {
        if (!cfg[jid]) continue;
        await sock.updateProfileStatus(cfg[jid]).catch(() => {});
      }
    } catch (err) {
      console.error("[autobioEvents]", err.message);
    }
  }, 60000); // toutes les 60 secondes
}