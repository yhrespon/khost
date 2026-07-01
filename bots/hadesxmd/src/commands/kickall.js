export default {
  name: "kickall",
  description: "Expulse tous les membres non-admin du groupe (par paquets)",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const header = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗`;
    const footer = `\n\n> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

    try {
      // Vérifie si c'est bien un groupe
      if (!from?.endsWith?.("@g.us")) {
        return await sock.sendMessage(
          from,
          {
            text: `${header}
❌ *Cette incantation ne peut être prononcée qu’au sein d’un cercle sacré (groupe).* 
╚════ஜ۩۞۩ஜ═════╝${footer}`,
          },
          { quoted: msg }
        );
      }

      const groupMetadata = await sock.groupMetadata(from);
      const participants = groupMetadata.participants || [];

      // Admins
      const admins = participants.filter(p => p.admin).map(p => p.id);
      const botJid = (sock?.user?.id || sock?.user?.jid || "").split?.(":")?.[0] || "";
      const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid || "";

      // Liste des membres à expulser
      let members = participants
        .map(p => p.id)
        .filter(id => !admins.includes(id) && id !== botJid && id !== senderJid);

      if (members.length === 0) {
        return await sock.sendMessage(
          from,
          {
            text: `${header}
❌ *KICKALL impossible*
╟─────────────────╢
🩸 « Les ténèbres attendent, mais il n’y a personne à chasser… »
╚════ஜ۩۞۩ஜ═════╝${footer}`,
          },
          { quoted: msg }
        );
      }

      // Message de lancement
      await sock.sendMessage(
        from,
        {
          text: `${header}
⚔️ *KICKALL INITIÉ*
╟─────────────────╢
⚡ Les faibles n’ont plus leur place ici.
🌑 Les ténèbres les engloutiront un à un.
🕯️ Préparez-vous à la purge.
╚════ஜ۩۞۩ஜ═════╝${footer}`,
        },
        { quoted: msg }
      );

      // Expulsion par paquets de 5 membres avec pause
      const chunkSize = 5;
      for (let i = 0; i < members.length; i += chunkSize) {
        const chunk = members.slice(i, i + chunkSize);
        try {
          await sock.groupParticipantsUpdate(from, chunk, "remove");
        } catch (e) {
          console.error("❌ Erreur expulsion chunk :", e);
          await sock.sendMessage(
            from,
            {
              text: `${header}
⚠️ *Erreur lors de l’expulsion d’un paquet*
╚════ஜ۩۞۩ஜ═════╝${footer}`,
            },
            { quoted: msg }
          );
        }
        // Pause de 3 secondes
        await new Promise(res => setTimeout(res, 3000));
      }

      // Confirmation
      await sock.sendMessage(
        from,
        {
          text: `${header}
✅ *KICKALL TERMINÉ*
╟─────────────────╢
⚡ ${members.length} membre(s) expulsé(s)
🌑 Le groupe est purifié par les ombres
🕯️ Que la peur guide les survivants
╚════ஜ۩۞۩ஜ═════╝${footer}`,
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error("❌ Erreur kickall :", err);
      await sock.sendMessage(
        from,
        {
          text: `${header}
❌ *Une faille s’est ouverte lors du kickall :*
⚡ ${err?.message || "Erreur inconnue"}
╚════ஜ۩۞۩ஜ═════╝${footer}`,
        },
        { quoted: msg }
      );
    }
  },
};