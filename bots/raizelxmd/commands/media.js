import { Sticker, StickerTypes } from "wa-sticker-formatter";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default [
  {
    name: "sticker",
    description: "Créer un sticker à partir d'une image ou vidéo",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});
      const sender = ctx.sender || "User";

      try {
        const quoted = ctx.raw?.message?.extendedTextMessage?.contextInfo?.quotedMessage || ctx.raw?.message;
        const type = quoted?.imageMessage ? "imageMessage" : quoted?.videoMessage ? "videoMessage" : null;

        if (!type) {
          return await reply("⚠️ Réponds ou envoie une image/vidéo pour créer un sticker.");
        }

        const stream = await downloadContentFromMessage(quoted[type], type.replace("Message", ""));
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        const sticker = new Sticker(buffer, {
          pack: "RAIZEL XMD",
          author: sender,
          type: StickerTypes.FULL,
          quality: 70,
        });

        await sock.sendMessage(from, { react: { text: "✨", key: ctx.raw?.key } });
        await sock.sendMessage(from, { sticker: await sticker.build() });

      } catch (e) {
        console.error("❌ Erreur sticker :", e);
        await reply("❌ Erreur création sticker : " + e.message);
      }
    }
  },

  {
    name: "take",
    description: "Réattribuer un sticker à votre nom",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});
      const sender = ctx.sender || "User";

      try {
        const quotedSticker = ctx.raw?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
        if (!quotedSticker) return await reply("⚠️ Réponds à un sticker pour le réassigner.");

        const stream = await downloadContentFromMessage(quotedSticker, "sticker");
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        const sticker = new Sticker(buffer, {
          pack: "",
          author: sender,
          type: StickerTypes.FULL,
          quality: 80,
        });

        await sock.sendMessage(from, { react: { text: "🪄", key: ctx.raw?.key } });
        await sock.sendMessage(from, { sticker: await sticker.build() });

      } catch (e) {
        console.error("❌ Erreur take :", e);
        await reply("❌ Erreur take : " + e.message);
      }
    }
  },

  {
    name: "vv",
    description: "Récupère le média vue unique",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});

      try {
        const quoted = ctx.raw?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) return await reply("⚠️ Réponds à une photo, vidéo ou audio vue unique.");

        const innerMsg = quoted.viewOnceMessageV2?.message || quoted.viewOnceMessageV2Extension?.message || quoted;

        if (innerMsg.imageMessage) {
          const stream = await downloadContentFromMessage(innerMsg.imageMessage, "image");
          let buffer = Buffer.from([]);
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
          await sock.sendMessage(from, { image: buffer, caption: "📸 Vue unique désactivée" });
          await sock.sendMessage(from, { react: { text: "📸", key: ctx.raw?.key } });
          return;
        }

        if (innerMsg.videoMessage) {
          const stream = await downloadContentFromMessage(innerMsg.videoMessage, "video");
          let buffer = Buffer.from([]);
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
          await sock.sendMessage(from, { video: buffer, caption: "🎥 Vue unique désactivée" });
          await sock.sendMessage(from, { react: { text: "🎥", key: ctx.raw?.key } });
          return;
        }

        if (innerMsg.audioMessage) {
          const stream = await downloadContentFromMessage(innerMsg.audioMessage, "audio");
          let buffer = Buffer.from([]);
          for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
          await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mp4", ptt: innerMsg.audioMessage.ptt || false });
          await sock.sendMessage(from, { react: { text: "🎵", key: ctx.raw?.key } });
          return;
        }

        await reply("❌ Pas une photo, vidéo ou audio vue unique.");
      } catch (e) {
        console.error("❌ Erreur vv :", e);
        await reply("❌ Erreur vv : " + e.message);
      }
    }
  },

  {
    name: "photo",
    description: "Transforme un sticker en photo",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});

      try {
        const quoted = ctx.raw?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
        if (!quoted) return await reply("⚠️ Réponds à un sticker pour le transformer en photo.");

        const stream = await downloadContentFromMessage(quoted, "sticker");
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        await sock.sendMessage(from, { text: "✅ Sticker converti en photo !" });
        await sock.sendMessage(from, { image: buffer, caption: "🖼️ Sticker converti en photo" });
        await sock.sendMessage(from, { react: { text: "🖼️", key: ctx.raw?.key } });

      } catch (e) {
        console.error("❌ Erreur photo :", e);
        await reply("❌ Erreur conversion sticker → photo : " + e.message);
      }
    }
  }
];