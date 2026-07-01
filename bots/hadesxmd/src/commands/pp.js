export default {
  name: "pp",
  aliases: ["profilepic", "avatar"],
  description: "Affiche la photo de profil d’un utilisateur",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const header = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗`;
    const footer = `\n\n> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

    try {
      // Identifier la cible : mention, reply ou soi-même
      let target =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
        msg.message?.extendedTextMessage?.contextInfo?.participant ||
        msg.key.remoteJid;

      // Récupérer la photo de profil
      let ppUrl;
      try {
        ppUrl = await sock.profilePictureUrl(target, "image");
      } catch {
        ppUrl = "https://files.catbox.moe/2yz2qu.jpg"; // Fallback si aucune PP
      }

      const name = target.split("@")[0];

      const caption = `${header}
👤 Profil de @${name}
╟─────────────────╢
⚡ Observé par Hadès
🌑 Les ténèbres scrutent son essence
╚════ஜ۩۞۩ஜ═════╝${footer}`;

      await sock.sendMessage(
        from,
        { image: { url: ppUrl }, caption, mentions: [target] },
        { quoted: msg }
      );
    } catch (e) {
      const errMsg = `${header}
❌ *ERREUR*
╟─────────────────╢
⚡ Impossible de récupérer la photo de profil
🌑 Détails : ${e.message}
╚════ஜ۩۞۩ஜ═════╝${footer}`;

      await sock.sendMessage(from, { text: errMsg }, { quoted: msg });
    }
  },
};