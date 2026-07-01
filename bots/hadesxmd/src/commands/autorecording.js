import { readJSON, writeJSON } from "../lib/dataManager.js";

const FILE = "autorecording.json";

// ===== Message stylé =====
function styledStatus(feature, state) {
  return `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
${state ? "✅" : "❌"} ${feature.toUpperCase()} ${state ? "✅" : "❌"}
 ${state ? "ACTIVÉ" : "DÉSACTIVÉ"}
╚════ஜ۩۞۩ஜ═════╝
> 𝙳𝙴𝚅- 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;
}

// Commande !autorecording on/off
async function execute(sock, msg, args) {
  try {
    const jid = msg.key.remoteJid;
    const opt = (args[0] || "").toLowerCase();

    if (!["on", "off"].includes(opt)) {
      await sock.sendMessage(jid, { text: "⚙️ Usage: !autorecording on/off" }, { quoted: msg });
      return;
    }

    const cfg = readJSON(FILE);
    cfg[jid] = opt === "on";
    writeJSON(FILE, cfg);

    await sock.sendMessage(jid, { text: styledStatus("AUTORECORDING", cfg[jid]) }, { quoted: msg });
    console.log(`[AutoRecording] ${jid} => ${opt}`);
  } catch (e) {
    console.error("[autorecording.execute]", e);
  }
}

// Gestion automatique de l'état "recording"
function autorecordingEvents(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      for (const m of messages) {
        if (!m?.message) continue;
        const jid = m.key.remoteJid;
        const cfg = readJSON(FILE);
        if (!cfg[jid]) continue; // skip si désactivé

        // Mettre le statut "recording" pour le chat
        await sock.sendPresenceUpdate("recording", jid).catch(err => {
          console.error("[autorecording.presence]", err.message);
        });
      }
    } catch (e) {
      console.error("[autorecordingEvents]", e);
    }
  });
}

export default { name: "autorecording", aliases: ["recording", "autovocal"], execute, autorecordingEvents };