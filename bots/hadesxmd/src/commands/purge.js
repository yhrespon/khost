export default {
  name: "purge",
  description: "Expulse tous les membres non-admins d’un groupe (sauf bot et owner)",

  async execute(sock, msg, args) {
    const from = msg?.key?.remoteJid;

    const ownerNumber =
      (process.env.OWNER_NUMBER || "").replace(/[^0-9]/g, "") +
      "@s.whatsapp.net";

    if (!from || !from.endsWith("@g.us")) {
      await sock.sendMessage(
        from || msg.key.remoteJid,
        {
          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
🚫 Cette invocation est réservée aux *groupes*.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,
        },
        { quoted: msg }
      );
      return;
    }

    try {
      const groupData = await sock.groupMetadata(from);
      const participants = groupData.participants || [];

      const botJid =
        (sock?.user?.id || sock?.user?.jid || "").split?.(":")?.[0] || "";

      // ✅ On exclut le bot, le propriétaire et les admins
      const toKick = participants
        .filter((p) => !p.admin && p.id !== ownerNumber && p.id !== botJid)
        .map((p) => p.id);

      if (toKick.length === 0) {
        await sock.sendMessage(
          from,
          {
            text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
😼 Aucun sacrifice trouvé... les ombres attendront.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,
          },
          { quoted: msg }
        );
        return;
      }

      const allMembers = participants.map((p) => p.id);

      // 💀 Texte dramatique de purge
      const purgeText = `╔═══『 𝐏𝐔𝐑𝐆𝐄 』═══╗
🔥 Le voile de l’illusion se déchire...  
💀 Les âmes indignes sont livrées à l’abîme.  
⚔️ Aucun serment ne les sauvera.  
🌑 L’ombre consume ce qui n’a plus sa place.  
⚡ Le jugement n’est pas une option. C’est une fatalité. ⚡

> Exécuté par *Hadès XMD* 👁️
╚═════════════════╝`;

      // ⚰️ Envoi de l’image avec légende
      await sock.sendMessage(from, {
        image: { url: "https://files.catbox.moe/cq0gpa.jpg" },
        caption: purgeText,
        mentions: allMembers,
      });

      // ⚔️ Expulsion
      await sock.groupParticipantsUpdate(from, toKick, "remove");

      // ✅ Confirmation finale
      await sock.sendMessage(
        from,
        {
          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
⚔️ *Purge accomplie* : ${toKick.length} âmes arrachées.  
🔮 Admins, propriétaire et bot intouchables.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error("❌ Erreur purge :", err);

      await sock.sendMessage(
        from,
        {
          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
❌ Les ombres ont échoué à frapper.  
⚠️ Vérifie mes permissions ou invoque-moi de nouveau.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,
        },
        { quoted: msg }
      );
    }
  },
};