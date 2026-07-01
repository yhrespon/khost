import fs from "fs";
const FILE = "./autobvn.json";
const vnPath = "./media/bvn.mp3"; // chemin du fichier audio

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
// AIDE POUR LES NUMÉROS
function getBareNumber(input) {
  if (!input) return "";
  const s = String(input);
  const beforeAt = s.split("@")[0];
  const beforeColon = beforeAt.split(":")[0];
  return beforeColon.replace(/[^0-9]/g, "");
}

// =======================
// COMMANDE AUTOBVN
export default {
  name: "autobvn",
  aliases: ["welcomeauto"],
  description: "Active ou désactive l'AutoBienvenue avec audio",
  execute: async (sock, ctx, args) => {
    try {
      const jid = ctx.from || "";
      if (!jid) return;

      const opt = (args[0] || "").toLowerCase();
      const text = args.slice(1).join(" ") || "Bienvenue dans le groupe !";

      if (!["on", "off"].includes(opt)) {
        return ctx.reply("Usage: .autobvn on/off <texte>");
      }

      const cfg = readJSON(FILE);
      cfg[jid] = opt === "on" ? text : false;
      writeJSON(FILE, cfg);

      await ctx.reply(`AutoBienvenue ${opt === "on" ? "activé" : "désactivé"}`);
    } catch (err) {
      console.error("[autobvn.execute]", err);
      if (ctx.reply) await ctx.reply("Erreur lors de l'activation d'AutoBienvenue.");
    }
  }
};

// =======================
// EVENTS HANDLER
export function autobvnEvents(sock) {
  sock.ev.on("group-participants.update", async (update) => {
    try {
      const cfg = readJSON(FILE);
      const jid = update.id;
      if (!cfg[jid]) return;

      for (const participant of update.participants) {
        if (update.action === "add") {
          const welcomeText = cfg[jid].replace("{user}", participant);

          // Envoi du texte
          await sock.sendMessage(jid, { text: welcomeText });

          // Envoi de la voix
          if (fs.existsSync(vnPath)) {
            await sock.sendMessage(jid, { 
              audio: fs.readFileSync(vnPath), 
              mimetype: "audio/mp3", 
              ptt: true 
            });
          }
        }
      }
    } catch (err) {
      console.error("[autobvnEvents]", err.message);
    }
  });
}