// promote.js
export default {
  name: "promote",
  description: "Nomme un membre administrateur du groupe",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    // Vérifie si c'est bien un groupe
    if (!from.endsWith("@g.us")) {
      const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
☠️ Cette commande est réservée aux groupes.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      return await sock.sendMessage(from, { text }, { quoted: msg });
    }

    try {
      // Identifier la cible (mention ou réponse)
      let targetJid;

      if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
      } else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        targetJid = msg.message.extendedTextMessage.contextInfo.participant;
      } else {
        const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
⚡ Mentionne ou réponds au serviteur que tu veux élever en administrateur.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

        return await sock.sendMessage(from, { text }, { quoted: msg });
      }

      // Promouvoir le membre
      await sock.groupParticipantsUpdate(from, [targetJid], "promote");

      // Message dramatique
      const promoteText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
⚡ *ÉLÉVATION SACRÉE* ⚡  
╚════ஜ۩۞۩ஜ═════╝  

🔥 Le serviteur @${targetJid.split("@")[0]} a été choisi.  
👑 Il porte désormais l’autorité d’*HADÈS XMD*.  
⚔️ Qu’il gouverne avec puissance et terreur !  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(
        from,
        { text: promoteText, mentions: [targetJid] },
        { quoted: msg }
      );
    } catch (err) {
      console.error("❌ Erreur promote :", err);

      const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
❌ Impossible de promouvoir ce membre.  
🌑 Vérifie mes permissions.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text }, { quoted: msg });
    }
  },
};