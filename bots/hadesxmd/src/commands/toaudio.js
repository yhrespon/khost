import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import ffmpeg from "fluent-ffmpeg";

import ffmpegPath from "ffmpeg-static";

import fs from "fs";

import { join } from "path";


ffmpeg.setFfmpegPath(ffmpegPath);

export default {

  name: "toaudio",

  description: "Convertit une vidéo en audio (mp3)",

  async execute(sock, msg, args) {

    try {

      // Récupération du message vidéo (direct ou cité)

      let quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;

      let videoMsg =

        quoted.videoMessage ||

        quoted.viewOnceMessageV2?.message?.videoMessage ||

        quoted.viewOnceMessageV2Extension?.message?.videoMessage;

      if (!videoMsg) {

        return await sock.sendMessage(msg.key.remoteJid, {

          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
⚠️ Réponds ou envoie une *vidéo* pour la convertir en *audio*.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`

        }, { quoted: msg });

      }

      // Téléchargement du flux vidéo

      const stream = await downloadContentFromMessage(videoMsg, "video");

      let buffer = Buffer.from([]);

      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      // Dossier temporaire

      const tempDir = "./temp";

      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      const inputPath = join(tempDir, "video.mp4");

      const outputPath = join(tempDir, "audio.mp3");

      fs.writeFileSync(inputPath, buffer);

      // Conversion vidéo → audio

      await new Promise((resolve, reject) => {

        ffmpeg(inputPath)

          .toFormat("mp3")

          .on("end", resolve)

          .on("error", reject)

          .save(outputPath);

      });

      // Envoi du fichier audio

      const audioBuffer = fs.readFileSync(outputPath);

      await sock.sendMessage(msg.key.remoteJid, {

        audio: audioBuffer,

        mimetype: "audio/mp4",

        ptt: false,

        caption: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
Ton audio est prêt.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`

      }, { quoted: msg });

      // Nettoyage

      fs.unlinkSync(inputPath);

      fs.unlinkSync(outputPath);

    } catch (e) {

      console.error("❌ Erreur toaudio :", e);

      await sock.sendMessage(msg.key.remoteJid, {

        text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ Une erreur est survenue : ${e.message}
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`

      }, { quoted: msg });

    }

  }

};