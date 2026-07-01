import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

ffmpeg.setFfmpegPath(ffmpegPath);

const TMP_DIR = path.join("./tmp");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// ─── UTIL ──────────────────────────────
function getBareNumber(input) {
  if (!input) return "";
  return String(input).split("@")[0].split(":")[0].replace(/[^0-9]/g, "");
}

async function downloadBuffer(message, type) {
  const stream = await downloadContentFromMessage(message, type);
  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
  return buffer;
}

// ─── COMMANDES MEDIA AV ─────────────────
export default [
  {
    name: "hd",
    description: "Renvoie l'image en HD",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});

      try {
        const quoted = ctx.raw?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted || !("imageMessage" in quoted)) {
          return await reply("⚠️ Réponds à une image.");
        }

        const buffer = await downloadBuffer(quoted.imageMessage, "image");
        const hdBuffer = await sharp(buffer).resize({ width: 1080 }).toBuffer();
        await sock.sendMessage(from, { image: hdBuffer, caption: "Image HD renvoyée" });

      } catch (err) {
        console.error(err);
        await reply("❌ Impossible de renvoyer l'image en HD.");
      }
    }
  },

  {
    name: "toaudio",
    description: "Convertit une vidéo en audio",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});

      try {
        const quoted = ctx.raw?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted || !("videoMessage" in quoted)) {
          return await reply("⚠️ Réponds à une vidéo.");
        }

        const buffer = await downloadBuffer(quoted.videoMessage, "video");
        const tmpVideo = path.join(TMP_DIR, `${Date.now()}.mp4`);
        const tmpAudio = tmpVideo.replace(".mp4", ".mp3");
        fs.writeFileSync(tmpVideo, buffer);

        await new Promise((resolve, reject) => {
          ffmpeg(tmpVideo)
            .noVideo()
            .audioCodec("libmp3lame")
            .audioBitrate("128k")
            .save(tmpAudio)
            .on("end", resolve)
            .on("error", reject);
        });

        const audioBuffer = fs.readFileSync(tmpAudio);
        await sock.sendMessage(from, {
          audio: audioBuffer,
          mimetype: "audio/mpeg",
          fileName: `audio_${Date.now()}.mp3`,
          ptt: false
        });

        fs.unlinkSync(tmpVideo);
        fs.unlinkSync(tmpAudio);

      } catch (err) {
        console.error(err);
        await reply("❌ Impossible de convertir la vidéo en audio.");
      }
    }
  },

  {
    name: "tovideo",
    description: "Convertit un audio en vidéo avec image de couverture",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});

      try {
        const quoted = ctx.raw?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted || !("audioMessage" in quoted)) {
          return await reply("⚠️ Réponds à un audio.");
        }

        const buffer = await downloadBuffer(quoted.audioMessage, "audio");
        const tmpAudio = path.join(TMP_DIR, `${Date.now()}.mp3`);
        const tmpVideo = tmpAudio.replace(".mp3", ".mp4");
        fs.writeFileSync(tmpAudio, buffer);

        const coverImage = path.join("./assets", "cover.jpg");
        if (!fs.existsSync(coverImage)) throw new Error("Image de couverture introuvable");

        await new Promise((resolve, reject) => {
          ffmpeg(tmpAudio)
            .input(coverImage)
            .loop(1)
            .outputOptions([
              "-shortest",
              "-t 5",
              "-c:v libx264",
              "-c:a aac",
              "-pix_fmt yuv420p",
              "-r 15",
              "-b:a 128k"
            ])
            .save(tmpVideo)
            .on("end", resolve)
            .on("error", reject);
        });

        const videoBuffer = fs.readFileSync(tmpVideo);
        await sock.sendMessage(from, { video: videoBuffer, fileName: `video_${Date.now()}.mp4` });

        fs.unlinkSync(tmpAudio);
        fs.unlinkSync(tmpVideo);

      } catch (err) {
        console.error(err);
        await reply("❌ Impossible de convertir l'audio en vidéo.");
      }
    }
  }
];