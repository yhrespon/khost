// demote.js
export default {
  name: "demote",
  description: "Rétrograde un administrateur en simple mortel",

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
⚡ Mentionne ou réponds à l’âme que tu veux déchoir de son trône.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

        return await sock.sendMessage(from, { text }, { quoted: msg });
      }

      // Rétrograder l’admin
      await sock.groupParticipantsUpdate(from, [targetJid], "demote");

      // Message dramatique
      const demoteText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
💀 *CHUTE D’UN TITAN* 💀  
╚════ஜ۩۞۩ஜ═════╝  

⚔️ L’ombre d’*HADÈS XMD* s’est abattue.  
❌ Le serviteur @${targetJid.split("@")[0]} est déchu.  
🩸 Ses privilèges d’administrateur se sont effondrés.  
🌑 Qu’il retourne à la masse des mortels.  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(
        from,
        { text: demoteText, mentions: [targetJid] },
        { quoted: msg }
      );
    } catch (err) {
      console.error("❌ Erreur demote :", err);

      const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
❌ Impossible de rétrograder ce membre. Vérifie mes permissions.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text }, { quoted: msg });
    }
  },
};