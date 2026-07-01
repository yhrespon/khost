export default {
  name: "resetlink",
  description: "Réinitialiser le lien du groupe (admin uniquement)",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    if (!from.endsWith("@g.us")) {
      return await sock.sendMessage(from, {
        text: `╔═ஜ۩𝐇𝐀𝐃𝐄𝐒 𝐗𝐌𝐃۩ஜ═╗
❌ *Cette commande est réservée aux groupes.*
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 - 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`
      }, { quoted: msg });
    }

    try {
      // Tente de réinitialiser le lien
      const invite = await sock.groupRevokeInvite(from);
      const newLink = invite?.code ? `https://chat.whatsapp.com/${invite.code}` : "❌ Lien indisponible";

      await sock.sendMessage(from, {
        text: `╔═ஜ۩𝐇𝐀𝐃𝐄𝐒 𝐗𝐌𝐃۩ஜ═╗
✅ Le lien du groupe a été réinitialisé avec succès !
╚════ஜ۩۞۩ஜ═════╝`
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ Erreur commande resetlink :", err);
      await sock.sendMessage(from, {
        text: `╔═ஜ۩𝐇𝐀𝐃𝐄𝐒 𝐗𝐌𝐃۩ஜ═╗
❌ *Une faille a perturbé les abysses !*
⚡ Détails : ${err.message}
╚════ஜ۩۞۩ஜ═════╝`
      }, { quoted: msg });
    }
  }
};