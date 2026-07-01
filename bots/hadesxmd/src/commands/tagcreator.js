export default {
  name: "tagcreator",
  description: "Mentionne le créateur du groupe, ou indique s'il n'est plus présent",

  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      // Vérification que la commande est utilisée dans un groupe
      if (!from.endsWith("@g.us")) {
        await sock.sendMessage(
          from,
          {
            text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
⚠️ Cette invocation ne peut être lancée que dans un *groupe*.
╚════ஜ۩۞۩ஜ═════╝`,
          },
          { quoted: msg }
        );
        return;
      }

      // Récupération des infos du groupe
      const groupMetadata = await sock.groupMetadata(from);
      const ownerJid = groupMetadata.owner || null;

      if (!ownerJid) {
        await sock.sendMessage(
          from,
          {
            text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
⚔️ Le créateur de ce royaume n’existe plus dans ces terres...
💀 Le trône est vide et les ombres règnent.
╚════ஜ۩۞۩ஜ═════╝`,
          },
          { quoted: msg }
        );
        return;
      }

      // Vérifier si le créateur est encore dans le groupe
      const isHere = groupMetadata.participants.some((p) => p.id === ownerJid);

      if (isHere) {
        await sock.sendMessage(
          from,
          {
            text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
👑 Voici l’architecte de ce royaume :
@${ownerJid.split("@")[0]}
⚔️ Respectez son autorité suprême !
╚════ஜ۩۞۩ஜ═════╝`,
            mentions: [ownerJid],
          },
          { quoted: msg }
        );
      } else {
        await sock.sendMessage(
          from,
          {
            text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
💀 Le créateur de ce royaume n’est plus parmi vous...
⚡ Son ombre hante encore ces lieux oubliés.
╚════ஜ۩۞۩ஜ═════╝`,
          },
          { quoted: msg }
        );
      }
    } catch (err) {
      console.error("❌ Erreur tagcreator :", err);

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
❌ Une erreur a obscurci l’invocation du créateur.
╚════ஜ۩۞۩ஜ═════╝`,
        },
        { quoted: msg }
      );
    }
  },
};