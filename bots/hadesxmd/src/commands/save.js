import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default {
  name: "save",
  description: "Sauvegarde un texte ou un média en message privé",

  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;
      const selfJid = sock.user.id; // JID du bot

      // Vérifie si c’est une réponse ou un envoi direct
      const quoted = msg.message?.extendedTextMessage
        ? msg.message.extendedTextMessage.contextInfo?.quotedMessage
        : msg.message;

      if (!quoted) {
        await sock.sendMessage(
          from,
          {
            text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
⚠️ Réponds à un message, média ou sticker avec *.save*
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,
          },
          { quoted: msg }
        );
        return;
      }

      const type = Object.keys(quoted)[0];

      // === Texte ===
      if (type === "conversation" || type === "extendedTextMessage") {
        const text =
          quoted.conversation ||
          quoted.extendedTextMessage?.text ||
          "⚡ Message vide";

        await sock.sendMessage(selfJid, {
          text: `╔════🔥 𝐇𝐀𝐃È𝐒 𝐗𝐌𝐃 🔥════╗
📜 *Message Sauvegardé*
⚔️ Contenu : ${text}
╚═══════════════════════╝`,
        });

        await sock.sendMessage(
          from,
          {
            text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
✅ Le texte a été gravé dans les flammes d’Hadès.
╚════ஜ۩۞۩ஜ═════╝`,
          },
          { quoted: msg }
        );
        return;
      }

      // === Médias ===
      const buffer = await downloadMediaMessage(
        { message: quoted },
        "buffer",
        {},
        { logger: console }
      );

      let sendContent = {};

      if (type === "imageMessage") {
        sendContent = {
          image: buffer,
          caption: "🔥 Image sauvegardée dans le royaume d’Hadès",
        };
      } else if (type === "videoMessage") {
        sendContent = {
          video: buffer,
          caption: "🎥 Vidéo conservée par les flammes d’Hadès",
        };
      } else if (type === "audioMessage") {
        sendContent = {
          audio: buffer,
          mimetype: "audio/mpeg",
          fileName: "hades_audio.mp3",
        };
      } else if (type === "documentMessage") {
        sendContent = {
          document: buffer,
          fileName: quoted.documentMessage.fileName || "hades_doc",
        };
      } else if (type === "stickerMessage") {
        sendContent = { sticker: buffer };
      } else {
        await sock.sendMessage(
          from,
          {
            text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
❌ Ce type de média n’est pas encore reconnu par Hadès.
╚════ஜ۩۞۩ஜ═════╝`,
          },
          { quoted: msg }
        );
        return;
      }

      // Envoi dans le privé du bot
      await sock.sendMessage(selfJid, sendContent);

      await sock.sendMessage(
        from,
        {
          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
✅ Le média a été sauvegardé dans les enfers 🔥
╚════ஜ۩۞۩ஜ═════╝`,
        },
        { quoted: msg }
      );
    } catch (e) {
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
❌ *Erreur save* : ${e.message}
╚════ஜ۩۞۩ஜ═════╝`,
        },
        { quoted: msg }
      );
    }
  },
};