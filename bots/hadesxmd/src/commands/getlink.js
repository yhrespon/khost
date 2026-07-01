// getlink.js
export default {
  name: "getlink",
  description: "Récupérer le lien d’invitation du groupe (HADÈS XMD)",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    try {
      // Vérifie si c’est un groupe
      if (!from.endsWith("@g.us")) {
        const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
⚠️ Cette invocation est réservée aux ténèbres d’un *groupe*.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

        return await sock.sendMessage(from, { text }, { quoted: msg });
      }

      // Génération du lien d’invitation
      const groupInviteCode = await sock.groupInviteCode(from);
      const inviteLink = `https://chat.whatsapp.com/${groupInviteCode}`;

      const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
🔗 *Lien d’invocation sombre* :  
${inviteLink}  

👑 Seuls les élus d’*HADÈS XMD* franchiront ce portail…  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (err) {
      console.error("❌ Erreur getlink :", err);

      const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
❌ Impossible de récupérer le lien d’invitation.  
💀 Les ombres bloquent l’accès au royaume…  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text }, { quoted: msg });
    }
  },
};