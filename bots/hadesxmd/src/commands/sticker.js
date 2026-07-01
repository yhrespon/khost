import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { Sticker, StickerTypes } from "wa-sticker-formatter";

export default {
  name: "sticker",
  description: "Transformer une image/vidéo en sceau démoniaque (sticker)",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    // 🔹 Réaction ⏳ sur la commande
    try {
      await sock.sendMessage(from, { react: { text: "⏳", key: msg.key } });
    } catch (err) {
      console.log("⚠️ Erreur réaction ⏳ ignorée :", err.message);
    }

    try {
      // Détection : image ou vidéo
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const mediaMsg = quoted || msg.message;

      const type = mediaMsg.imageMessage
        ? "imageMessage"
        : mediaMsg.videoMessage
        ? "videoMessage"
        : null;

      if (!type) {
        return await sock.sendMessage(
          from,
          {
            text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
💀 Réponds ou envoie une *image* ou une *vidéo* pour que je la transforme en sceau démoniaque.
╚════ஜ۩۞۩ஜ═════╝`,
          },
          { quoted: msg }
        );
      }

      // Téléchargement du média
      const stream = await downloadContentFromMessage(
        mediaMsg[type],
        type === "imageMessage" ? "image" : "video"
      );

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // Création du sticker
      const sticker = new Sticker(buffer, {
        pack: "𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷 by",
        author: msg.pushName || "HADÈS",
        type: StickerTypes.FULL,
        quality: 80,
      });

      // Envoi du sticker
      await sock.sendMessage(from, { sticker: await sticker.build() }, { quoted: msg });

    } catch (e) {
      console.error("❌ Erreur sticker :", e);

      await sock.sendMessage(
        from,
        {
          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
☠️ Échec lors de la création du sceau : *${e.message}*
╚════ஜ۩۞۩ஜ═════╝`,
        },
        { quoted: msg }
      );
    }
  },
};