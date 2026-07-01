import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import { join } from "path";
import { downloadContentFromMessage, downloadMediaMessage, getContentType } from "@whiskeysockets/baileys";
import axios from "axios";
import FormData from "form-data";

ffmpeg.setFfmpegPath(ffmpegPath);

export default [
  {
    name: "url",
    description: "Génère une URL pour un média",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});
      const sender = ctx.sender || "User";

      try {
        const quoted = ctx.raw?.message?.extendedTextMessage?.contextInfo?.quotedMessage || ctx.raw?.message;
        const type = quoted?.imageMessage ? "image" : quoted?.videoMessage ? "video" : quoted?.audioMessage ? "audio" : null;
        if (!type) return await reply("⚠️ Réponds à un média pour générer une URL.");

        const stream = await downloadContentFromMessage(quoted[`${type}Message`], type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        const tempDir = "./temp";
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
        const ext = type === "image" ? "jpg" : type === "video" ? "mp4" : "mp3";
        const filePath = join(tempDir, `media_${Date.now()}.${ext}`);
        fs.writeFileSync(filePath, buffer);

        const form = new FormData();
        form.append("reqtype", "fileupload");
        form.append("fileToUpload", fs.createReadStream(filePath));
        const upload = await axios.post("https://catbox.moe/user/api.php", form, { headers: form.getHeaders() });

        fs.unlinkSync(filePath);
        await reply(`✅ URL générée : ${upload.data}`);
        if (ctx.raw?.key) await sock.sendMessage(from, { react: { text: "🔗", key: ctx.raw.key } });

      } catch (e) {
        console.error("❌ Erreur url :", e);
        await reply("❌ Erreur URL : " + e.message);
      }
    }
  },

  {
    name: "save",
    description: "Sauvegarde un média ou texte",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});

      try {
        let msg = ctx.raw?.message?.extendedTextMessage?.contextInfo?.quotedMessage || ctx.raw?.message;
        while (msg?.ephemeralMessage || msg?.viewOnceMessage || msg?.viewOnceMessageV2 || msg?.documentWithCaptionMessage) {
          msg = msg.ephemeralMessage?.message || msg.viewOnceMessage?.message || msg.viewOnceMessageV2?.message || msg.documentWithCaptionMessage?.message;
        }

        const type = getContentType(msg);

        if (type === "conversation" || type === "extendedTextMessage") {
          const text = msg.conversation || msg.extendedTextMessage?.text || "⚡ Message vide";
          await sock.sendMessage(sock.user.id, { text: `💾 Sauvegarde:\n\n${text}` });
          return await reply("✅ Texte sauvegardé");
        }

        const buffer = await downloadMediaMessage({ message: msg }, "buffer", {}, { logger: console });
        let fileName = Date.now().toString();
        let sendContent = {};

        switch (type) {
          case "imageMessage": fileName += ".jpg"; sendContent = { image: buffer, caption: "💾 Sauvegarde image" }; break;
          case "videoMessage": fileName += ".mp4"; sendContent = { video: buffer, caption: "💾 Sauvegarde vidéo" }; break;
          case "audioMessage": fileName += ".mp3"; sendContent = { audio: buffer, mimetype: "audio/mpeg", fileName }; break;
          case "documentMessage": fileName = msg.documentMessage.fileName || fileName + ".doc"; sendContent = { document: buffer, fileName }; break;
          case "stickerMessage": fileName += ".webp"; sendContent = { sticker: buffer }; break;
          default: return await reply("❌ Type non supporté : " + type);
        }

        await sock.sendMessage(sock.user.id, sendContent);
        await reply("✅ Média sauvegardé");
        if (ctx.raw?.key) await sock.sendMessage(from, { react: { text: "💾", key: ctx.raw.key } });

      } catch (e) {
        console.error("❌ Erreur save :", e);
        await reply("❌ Erreur save : " + e.message);
      }
    }
  },

  {
    name: "play",
    description: "Joue une mélodie depuis YouTube",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});
      const title = args.join(" ");
      if (!title) return await reply("❌ Aucune mélodie spécifiée.");

      try {
        const apiUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(title)}`;
        const { data } = await axios.get(apiUrl);
        if (!data.status || !data.result || !data.result.download_url) throw new Error("Aucune mélodie trouvée.");

        const video = data.result;
        await sock.sendMessage(from, { image: { url: video.thumbnail }, caption: `🎵 ${video.title}\n⏱️ ${video.duration}` });
        await sock.sendMessage(from, { audio: { url: video.download_url, mimetype: "audio/mp4", ptt: false } });
        if (ctx.raw?.key) await sock.sendMessage(from, { react: { text: "🎵", key: ctx.raw.key } });

      } catch (err) {
        console.error("❌ Erreur play :", err);
        await reply("❌ Erreur play : " + err.message);
      }
    }
  },

  {
    name: "img",
    description: "Recherche une image sur Google",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});
      const query = args.join(" ");
      if (!query) return await reply("❌ Mot-clé manquant pour la recherche.");

      try {
        const GOOGLE_API_KEY = "AIzaSyDo09jHOJqL6boMeac-xmPHB-yD9dKOKGU";
        const GOOGLE_CX = "d1a5b18a0be544a0e";

        const res = await axios.get("https://www.googleapis.com/customsearch/v1", {
          params: { q: query, cx: GOOGLE_CX, searchType: "image", key: GOOGLE_API_KEY },
        });

        if (!res.data.items || res.data.items.length === 0) return await reply("❌ Aucune image trouvée.");

        const imgUrl = res.data.items[Math.floor(Math.random() * res.data.items.length)].link;
        await sock.sendMessage(from, { image: { url: imgUrl }, caption: `🖼️ Sujet : ${query}` });
        if (ctx.raw?.key) await sock.sendMessage(from, { react: { text: "🖼️", key: ctx.raw.key } });

      } catch (err) {
        console.error("❌ Erreur img :", err);
        await reply("❌ Erreur img : " + err.message);
      }
    }
  }
];