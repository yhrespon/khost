export default {
  name: "infozap",
  description: "Révèle si l’utilisateur utilise WhatsApp Messenger ou Business",

  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      // Déterminer la cible
      let targetJid = null;
      let targetName = "";

      const quoted = msg.message?.extendedTextMessage?.contextInfo;

      if (quoted?.participant) {
        targetJid = quoted.participant;
        targetName = targetJid.split("@")[0];
      }

      const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (!targetJid && mentions.length) {
        targetJid = mentions[0];
        targetName = targetJid.split("@")[0];
      }

      if (!targetJid && args.length) {
        const a = args[0];
        targetJid = a.includes("@") ? a : `${a}@s.whatsapp.net`;
        targetName = a.split("@")[0];
      }

      if (!targetJid) {
        targetJid = msg.key.participant || msg.key.remoteJid;
        targetName = (targetJid || "").split("@")[0];
      }

      if (!targetJid) {
        return await sock.sendMessage(
          from,
          {
            text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ *Invocation incomplète !*
⚔️ Mentionne, réponds ou entre un numéro valide.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 - 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`
          },
          { quoted: msg }
        );
      }

      // Détection Business / Messenger
      let isBusiness = false;

      // Vérifie via onWhatsApp
      try {
        if (typeof sock.onWhatsApp === "function") {
          const res = await sock.onWhatsApp([targetJid]);
          const info = Array.isArray(res) ? res[0] : res;
          if (info?.isBusiness) isBusiness = true;
        }
      } catch {}

      // Vérifie via store (si dispo)
      try {
        const contact = sock.store?.contacts?.get
          ? sock.store.contacts.get(targetJid)
          : sock.store?.contacts?.[targetJid];

        if (contact?.isBusiness || contact?.verifiedName || contact?.businessProfile) {
          isBusiness = true;
        }
      } catch {}

      // Vérifie via API BusinessProfile si dispo
      try {
        if (!isBusiness && typeof sock.getBusinessProfile === "function") {
          const bp = await sock.getBusinessProfile(targetJid).catch(() => null);
          if (bp) isBusiness = true;
        }
      } catch {}

      const waType = isBusiness ? "WhatsApp Business" : "WhatsApp Messenger";

      const revealText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗

📱 *Révélation d’Hadès :*
L’âme visée (${targetName}) utilise : *${waType}*

╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 - 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text: revealText }, { quoted: msg });

    } catch (err) {
      console.error("❌ Erreur infozap :", err);

      const errorText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ *Échec de la divination !*
Impossible de sonder le type de WhatsApp.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 - 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text: errorText }, { quoted: msg });
    }
  }
};