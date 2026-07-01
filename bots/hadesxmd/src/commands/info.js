import os from "os";

export default {
  name: "info",
  description: "Révèle les informations occultes du royaume (bot)",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    try {
      const infoText = `╔═════ஜ۩۞۩ஜ═════╗
       ⚔️ 𝐇𝐀𝐃È𝐒 𝐗𝐌𝐃 ⚔️
╟────────────────────╢

🤖 *Informations du Royaume*
━━━━━━━━━━━━━━━━━━
⚙️ Système : *${os.type()} ${os.arch()}*
📦 Node.js : *${process.version}*
👑 Propriétaires : *${(global.owners || []).length || 1}*
🕒 Heure du Trône : *${new Date().toLocaleString()}*
📜 Préfixe sacré : *!*

💡 Invoquez *!menu* pour découvrir toutes les incantations.
╚═════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 - 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text: infoText }, { quoted: msg });
    } catch (err) {
      console.error("❌ Erreur infos :", err);
      await sock.sendMessage(from, {
        text: `╔═════ஜ۩۞۩ஜ═════╗
⚠️ Les flammes d’Hadès n’ont pas révélé les informations…
╚═════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 - 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,
      }, { quoted: msg });
    }
  }
};