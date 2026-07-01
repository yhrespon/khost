import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { readJSON, writeJSON } from "../lib/dataManager.js";

const FILE = "welcome.json";

// ===== Messages stylés =====
function styledWelcome(name) {
  return `
╔═════ஜ۩۞۩ஜ═════╗
🖤👋 BIENVENUE @${name} 🖤
╟─────────────────╢
⚡ Le portail des ténèbres s'ouvre pour toi
🌑 Rejoins le clan de Hadès et montre ta force
🕯️ Que ton chemin soit guidé par les ombres
╚═════ஜ۩۞۩ஜ═════╝
🩸 « Seuls les braves survivent ici… »  
🖤⚡ HADÈS ⚡🖤`;
}

function styledGoodbye(name) {
  return `
╔═════ஜ۩۞۩ஜ═════╗
🖤👋 ADIEU @${name} 🖤
╟─────────────────╢
⚡ Le portail des ténèbres se referme… sur un lâche
🌑 Tu fuis Hadès, incapable d’affronter les ombres
🕯️ Les ténèbres te regardent et rient de ta faiblesse
╚═════ஜ۩۞۩ஜ═════╝
🩸 « Même la peur te poursuit… »  
🖤⚡ HADÈS ⚡🖤`;
}

// Commande !welcome on/off
async function execute(sock, msg, args) {
  try {
    const jid = msg.key.remoteJid;

    if (!jid?.endsWith?.("@g.us")) {
      await sock.sendMessage(jid, { text: "❌ Utilise cette commande dans un groupe." }, { quoted: msg });
      return;
    }

    const opt = (args[0] || "").toLowerCase();
    if (!["on", "off"].includes(opt)) {
      await sock.sendMessage(jid, { text: "⚙️ Utilisation : !welcome on/off" }, { quoted: msg });
      return;
    }

    const cfg = readJSON(FILE);
    cfg[jid] = opt === "on";
    writeJSON(FILE, cfg);

    await sock.sendMessage(jid, { text: `✅ Welcome ${cfg[jid] ? "activé" : "désactivé"} pour ce groupe.` }, { quoted: msg });
    console.log(`[Welcome] ${jid} => ${opt}`);
  } catch (e) {
    console.error("[welcome.execute]", e);
    await sock.sendMessage(msg.key.remoteJid, { text: "❌ Erreur welcome : " + e.message }, { quoted: msg });
  }
}

// Écoute join/leave — à appeler une seule fois au démarrage
function welcomeEvents(sock) {
  sock.ev.on("group-participants.update", async (update) => {
    try {
      const cfg = readJSON(FILE);
      if (!cfg[update.id]) return;

      for (const participant of update.participants) {
        let pp = "https://files.catbox.moe/2yz2qu.jpg";
        try { pp = await sock.profilePictureUrl(participant, "image"); } catch {}

        const name = participant.split("@")[0];

        if (update.action === "add") {
          await sock.sendMessage(update.id, {
            image: { url: pp },
            caption: styledWelcome(name),
            mentions: [participant]
          });
        } else if (update.action === "remove") {
          await sock.sendMessage(update.id, {
            image: { url: pp },
            caption: styledGoodbye(name),
            mentions: [participant]
          });
        }
      }
    } catch (e) {
      console.error("[welcomeEvents]", e);
    }
  });
}

export default { name: "welcome", aliases: ["bienvenue", "bye"], execute, welcomeEvents };