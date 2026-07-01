// promoteall.js
export default {
  name: "promoteall",
  description: "Nommer tous les membres administrateurs (Hadès XMD)",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    // Vérifie si c’est un groupe
    if (!from.endsWith("@g.us")) {
      const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
☠️ Cette invocation est réservée aux *groupes*.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;
      return await sock.sendMessage(from, { text }, { quoted: msg });
    }

    try {
      const groupMetadata = await sock.groupMetadata(from);
      const participants = groupMetadata.participants || [];

      // Cible : tous les non-admins
      const toPromote = participants.filter((p) => !p.admin).map((p) => p.id);

      if (toPromote.length === 0) {
        const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
🌑 Tous les serviteurs portent déjà le manteau des ténèbres (*admins*).  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;
        return await sock.sendMessage(from, { text }, { quoted: msg });
      }

      // Promotion massive
      await sock.groupParticipantsUpdate(from, toPromote, "promote");

      const promoteText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
👑 *ASCENSION COLLECTIVE* 👑  
╟─────────────────────╢  
⚡ L’ordre d’*HADÈS XMD* résonne :  
🌑 Tous les mortels sont élevés au rang d’administrateurs.  

🔥 La puissance est désormais partagée entre toutes les âmes.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(
        from,
        { text: promoteText, mentions: toPromote },
        { quoted: msg }
      );
    } catch (err) {
      console.error("❌ Erreur promoteall :", err);

      const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
❌ Impossible de promouvoir tous les membres.  
🌑 Vérifie mes permissions ou tente à nouveau.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text }, { quoted: msg });
    }
  },
};