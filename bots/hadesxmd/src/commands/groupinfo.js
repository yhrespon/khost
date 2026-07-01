// groupinfo.js
export default {
  name: "groupinfo",
  description: "Révèle les secrets d’un sanctuaire sous l’œil d’Hadès",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    try {
      // Vérifie si c'est bien un groupe
      if (!from.endsWith("@g.us")) {
        const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
⚠️ Cette incantation ne peut être prononcée qu’au sein d’un cercle sacré (*groupe*).  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

        return await sock.sendMessage(from, { text }, { quoted: msg });
      }

      // Métadonnées du groupe
      const metadata = await sock.groupMetadata(from);
      const groupName = metadata.subject || "Sanctuaire sans nom";
      const description =
        (metadata.desc &&
          (typeof metadata.desc === "string"
            ? metadata.desc
            : metadata.desc?.toString?.())) ||
        "Aucune prophétie gravée...";
      const owner = metadata.owner ? `@${metadata.owner.split("@")[0]}` : "Inconnu";
      const creation = metadata.creation ? new Date(metadata.creation * 1000) : null;
      const creationDate = creation ? creation.toLocaleString() : "Date inconnue";
      const membersCount = metadata.participants?.length || 0;

      // Administrateurs
      const adminEntries = (metadata.participants || [])
        .filter((p) => p.admin)
        .map((p) => `⚔️ @${p.id.split("@")[0]}`);
      const adminJids = (metadata.participants || [])
        .filter((p) => p.admin)
        .map((p) => p.id);

      // Lien d’invitation
      let inviteLink;
      try {
        const groupInviteCode = await sock.groupInviteCode(from);
        inviteLink = `https://chat.whatsapp.com/${groupInviteCode}`;
      } catch {
        inviteLink = "❌ Le portail vers ce royaume est scellé...";
      }

      // Photo du groupe
      const profilePic = await sock.profilePictureUrl(from, "image").catch(() => null);

      // Texte stylisé
      const infoText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
⚔️ Sanctuaire : *${groupName}*  
📜 Prophétie : ${description}  
👑 Gardien originel : ${owner}  
📅 Érigé le : ${creationDate}  
🕷️ Âmes présentes : ${membersCount}  
👁️ Veilleurs :  
${adminEntries.length > 0 ? adminEntries.join("\n") : "Aucun œil vigilant trouvé..."}  

🌑 Portail d’accès : ${inviteLink}  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      // Envoi (image + mentions si admins)
      if (profilePic) {
        await sock.sendMessage(
          from,
          {
            image: { url: profilePic },
            caption: infoText,
            mentions: adminJids.length ? adminJids : undefined,
          },
          { quoted: msg }
        );
      } else {
        await sock.sendMessage(
          from,
          {
            text: infoText,
            mentions: adminJids.length ? adminJids : undefined,
          },
          { quoted: msg }
        );
      }
    } catch (e) {
      console.error("❌ Erreur groupinfo :", e);

      const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
💀 *Une faille s’est ouverte...*  
❌ ${e?.message || "Erreur inconnue"}  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text }, { quoted: msg });
    }
  },
};