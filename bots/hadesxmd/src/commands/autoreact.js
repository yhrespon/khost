import { readJSON, writeJSON } from "../lib/dataManager.js";

const FILE = "autoreact.json";

// ===== Message stylé =====
function styledStatus(feature, state) {
  return `╔══ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ══╗
 ${feature.toUpperCase()} ${state ? "ACTIVÉ ✅" : "DÉSACTIVÉ ❌"} 
╚═════ஜ۩۞۩ஜ═════╝
> 𝙳𝙴𝚅- 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;
}

async function execute(sock, msg, args) {
  try {
    const jid = msg.key.remoteJid;
    const opt = (args[0] || "").toLowerCase();

    if (!["on", "off"].includes(opt)) {
      await sock.sendMessage(jid, { text: "⚙️ Usage: !autoreact on/off" }, { quoted: msg });
      return;
    }

    const cfg = readJSON(FILE);
    cfg[jid] = opt === "on";
    writeJSON(FILE, cfg);

    await sock.sendMessage(jid, { text: styledStatus("AUTOREACT", cfg[jid]) }, { quoted: msg });
    console.log(`[AutoReact] ${jid} => ${opt}`);
  } catch (e) {
    console.error("[autoreact.execute]", e);
  }
}

function autoreactEvents(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      for (const m of messages) {
        if (!m?.message) continue;
        const jid = m.key.remoteJid;
        const cfg = readJSON(FILE);
        if (!cfg[jid]) continue; // skip si AutoReact désactivé

        const emojis = ["😂", "🔥", "❤️", "👍", "🤖", "⚡"];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];

        await sock.sendMessage(jid, { react: { text: emoji, key: m.key } }).catch(err => {
          console.error("[autoreact.react]", err.message);
        });
      }
    } catch (e) {
      console.error("[autoreactEvents]", e);
    }
  });
}

export default { name: "autoreact", aliases: ["reactauto", "autolike"], execute, autoreactEvents };