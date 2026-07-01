export default {
  name: "delete",
  description: "Supprimer un message cité (Hadès XMD)",

  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      // Vérifie si le message ciblé existe
      const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
      if (!contextInfo?.stanzaId) {
        const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
⚠️ Réponds au message que tu veux supprimer.
╚════ஜ۩۞۩ஜ═════╝
> 𝙳𝙴𝚅- 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

        return await sock.sendMessage(from, { text }, { quoted: msg });
      }

      // Supprime le message ciblé
      await sock.sendMessage(from, {
        delete: {
          remoteJid: from,
          fromMe: false,
          id: contextInfo.stanzaId,
          participant: contextInfo.participant,
        },
      });

      // Confirmation stylisée
      const confirmText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
✅ *Message supprimé avec succès*
╚════ஜ۩۞۩ஜ═════╝
> 𝙳𝙴𝚅- 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text: confirmText }, { quoted: msg });
    } catch (err) {
      console.error("❌ Erreur delete :", err);

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ *Erreur lors de la suppression*
⚡ Détails : ${err.message}
╚════ஜ۩۞۩ஜ═════╝`,
        },
        { quoted: msg }
      );
    }
  },
};