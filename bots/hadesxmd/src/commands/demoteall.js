// demoteall.js
export default {
  name: "demoteall",
  description: "Rétrograder tous les administrateurs du groupe sauf le bot, l'owner et le lanceur",

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
      const ownerJid = groupMetadata.owner || ""; // Propriétaire du groupe
      const sender = msg.key.participant; // Qui a envoyé la commande
      const botId = sock.user?.id || sock.user?.jid || ""; // JID du bot

      // Filtre les admins à rétrograder en excluant le bot, l'owner et le lanceur
      const toDemote = participants
        .filter(p => p.admin && p.id !== botId && p.id !== ownerJid && p.id !== sender)
        .map(p => p.id);

      if (toDemote.length === 0) {
        const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
🔽 Aucun administrateur à rétrograder.  
🌑 Le groupe est déjà sous contrôle d’*HADÈS*.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;
        return await sock.sendMessage(from, { text }, { quoted: msg });
      }

      await sock.groupParticipantsUpdate(from, toDemote, "demote");

      const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
✅ *PURGE DES ÉLITES* ✅  
${toDemote.length} ancien(s) administrateur(s) ont été dépouillés de leur titre.  
⚔️ L’équilibre des ténèbres est rétabli.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (err) {
      console.error("❌ Erreur demoteall :", err);

      const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
⚡ Impossible de rétrograder les administrateurs.  
🌑 Vérifie mes permissions et réessaie.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text }, { quoted: msg });
    }
  },
};