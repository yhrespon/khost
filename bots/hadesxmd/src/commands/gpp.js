export default {
  name: "gpp",
  aliases: ["grouppp", "groupicon", "groupavatar"],
  description: "Révéler la photo de profil d’un groupe (Hadès XMD)",

  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      // Vérifie que la commande est exécutée dans un groupe
      if (!from.endsWith("@g.us")) {
        const replyText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
❌ *Invocation invalide !*
⚔️ Ce rituel doit être exécuté dans un *groupe*.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 - 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

        await sock.sendMessage(from, { text: replyText }, { quoted: msg });
        return;
      }

      // Récupérer la photo du groupe
      let ppUrl;
      try {
        ppUrl = await sock.profilePictureUrl(from, "image");
      } catch {
        ppUrl = "https://files.catbox.moe/2yz2qu.jpg"; // image par défaut
      }

      const metadata = await sock.groupMetadata(from);

      const captionText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
🖼️ *PHOTO DU COVEN* 🖼️
╟────────────────╢
👥 Nom : ${metadata.subject}
📊 Membres : ${metadata.participants.length}
╚═════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 - 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, {
        image: { url: ppUrl },
        caption: captionText
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ Erreur gpp :", err);

      const errorText = `╔═════ஜ۩۞۩ஜ═════╗
❌ *Échec de la divination !*
╟─────────────────╢
⚡ Impossible de récupérer la photo du groupe.
🌑 Détails : ${err.message}
╚═════ஜ۩۞۩ஜ═════╝
🩸 « Même les ténèbres ont leurs limites… »`;

      await sock.sendMessage(msg.key.remoteJid, { text: errorText }, { quoted: msg });
    }
  }
};