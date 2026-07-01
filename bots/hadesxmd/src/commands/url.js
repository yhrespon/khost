import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

import axios from "axios";

import fs from "fs";

import { join } from "path";

import FormData from "form-data";

export default {

  name: "url",

  description: "Génère une URL à partir d'une image, vidéo ou audio",

  async execute(sock, msg, args) {

    const from = msg.key.remoteJid;

    try {

      const quoted =

        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;

      let type = null;

      if (quoted.imageMessage) type = "image";

      else if (quoted.videoMessage) type = "video";

      else if (quoted.audioMessage) type = "audio";

      if (!type) {

        return await sock.sendMessage(

          from,

          {

            text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗

⚠️ Réponds à une *image, vidéo ou audio* pour obtenir une URL.

╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`

          },

          { quoted: msg }

        );

      }

      // Téléchargement du média

      const stream = await downloadContentFromMessage(quoted[`${type}Message`], type);

      let buffer = Buffer.from([]);

      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      // Sauvegarde temporaire

      const tempDir = "./temp";

      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      const ext = type === "image" ? "jpg" : type === "video" ? "mp4" : "mp3";

      const filePath = join(tempDir, `media_${Date.now()}.${ext}`);

      fs.writeFileSync(filePath, buffer);

      // Upload vers catbox.moe

      const form = new FormData();

      form.append("reqtype", "fileupload");

      form.append("fileToUpload", fs.createReadStream(filePath));

      const upload = await axios.post("https://catbox.moe/user/api.php", form, {

        headers: form.getHeaders(),

      });

      fs.unlinkSync(filePath); // Nettoyage

      const url = upload.data;

      // Message décoré Hadès XMD

      const replyText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
💀 *URL générée avec succès*
👹 Type : ${type.toUpperCase()}
🩸 Lien : ${url}
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text: replyText }, { quoted: msg });

    } catch (e) {

      console.error("❌ Erreur url :", e);

      await sock.sendMessage(

        from,

        {

          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ Impossible de générer l'URL : ${e.message}
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`

        },

        { quoted: msg }

      );

    }

  }

};