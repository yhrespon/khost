// kick.js
export default {
  name: "kick",
  description: "Expulser un membre du groupe (par réponse ou mention)",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    // Vérifie si c'est un groupe
    if (!from.endsWith("@g.us")) {
      const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
❌ Cette commande est réservée aux groupes.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;
      return await sock.sendMessage(from, { text }, { quoted: msg });
    }

    try {
      const groupMetadata = await sock.groupMetadata(from);
      const participants = groupMetadata.participants || [];
      const ownerJid = groupMetadata.owner || "";
      const sender = msg.key.participant;
      const botId = sock.user?.id || sock.user?.jid || "";

      // Récupération de la cible à exclure
      let target;

      // Si on répond à un message
      if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
        target = msg.message.extendedTextMessage.contextInfo.participant;
      }
      // Sinon, si on mentionne quelqu’un
      else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
      }
      // Sinon, si on passe le JID en argument (ex: kick 2376xxxx@s.whatsapp.net)
      else if (args[0]) {
        target = args[0].replace(/[@\s]/g, "") + "@s.whatsapp.net";
      }

      if (!target) {
        const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
⚠️ Spécifie un membre à exclure !  
Exemples :  
• Réponds à son message avec *!kick*  
• Ou écris *!kick @user*  
╚════ஜ۩۞۩ஜ═════╝`;
        return await sock.sendMessage(from, { text }, { quoted: msg });
      }

      // Vérifications : ne pas exclure bot, owner ou soi-même
      if ([botId, ownerJid, sender].includes(target)) {
        const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
🚫 Impossible d’exclure ce membre.  
⚡ Il est protégé par les ténèbres.  
╚════ஜ۩۞۩ஜ═════╝`;
        return await sock.sendMessage(from, { text }, { quoted: msg });
      }

      // Vérifie que la cible est bien dans le groupe
      const memberExists = participants.find(p => p.id === target);
      if (!memberExists) {
        const text = `❌ Ce membre ne se trouve pas dans le groupe.`;
        return await sock.sendMessage(from, { text }, { quoted: msg });
      }

      // Exclusion
      await sock.groupParticipantsUpdate(from, [target], "remove");

      const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
💀 *EXÉCUTION TERMINÉE* 💀  
@${target.split("@")[0]} a été banni du royaume.  
⚔️ L’ordre est rétabli par *HADÈS*.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text, mentions: [target] }, { quoted: msg });

    } catch (err) {
      console.error("❌ Erreur kick :", err);
      const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
⚡ Impossible d’exclure ce membre.  
🌑 Vérifie mes permissions et réessaie.  
╚════ஜ۩۞۩ஜ═════╝`;
      await sock.sendMessage(from, { text }, { quoted: msg });
    }
  },
};