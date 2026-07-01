export default {

  name: "tag",

  description: "Taguer tous les membres d’un groupe avec un message ou un média cité",

  async execute(sock, msg, args) {

    const from = msg.key.remoteJid;

    // Vérifie si c'est un groupe

    if (!from.endsWith("@g.us")) {

      return await sock.sendMessage(

        from,

        {

          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗

❌ *Commande réservée aux groupes seulement.*

╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`

        },

        { quoted: msg }

      );

    }

    try {

      const groupMetadata = await sock.groupMetadata(from);

      const participants = groupMetadata.participants;

      const mentions = participants.map(p => p.id);

      // Vérifier si on a répondu à un message

      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (quotedMsg) {

        // Cas 1 : Texte simple

        if (quotedMsg.conversation) {

          return await sock.sendMessage(

            from,

            { text: quotedMsg.conversation, mentions },

            { quoted: msg }

          );

        }

        // Cas 2 : Texte enrichi

        if (quotedMsg.extendedTextMessage?.text) {

          return await sock.sendMessage(

            from,

            { text: quotedMsg.extendedTextMessage.text, mentions },

            { quoted: msg }

          );

        }

        // Cas 3 : Image

        if (quotedMsg.imageMessage) {

          return await sock.sendMessage(

            from,

            {

              image: quotedMsg.imageMessage,

              caption: quotedMsg.imageMessage.caption || "🖼️ Image",

              mentions,

            },

            { quoted: msg }

          );

        }

        // Cas 4 : Vidéo

        if (quotedMsg.videoMessage) {

          return await sock.sendMessage(

            from,

            {

              video: quotedMsg.videoMessage,

              caption: quotedMsg.videoMessage.caption || "🎬 Vidéo",

              mentions,

            },

            { quoted: msg }

          );

        }

        // Cas 5 : Sticker

        if (quotedMsg.stickerMessage) {

          return await sock.sendMessage(

            from,

            { sticker: quotedMsg.stickerMessage, mentions },

            { quoted: msg }

          );

        }

        // Cas 6 : Audio / Voice

        if (quotedMsg.audioMessage) {

          return await sock.sendMessage(

            from,

            {

              audio: quotedMsg.audioMessage,

              ptt: quotedMsg.audioMessage.ptt || false,

              mimetype: quotedMsg.audioMessage.mimetype,

              fileName: "voice.mp3",

              mentions,

            },

            { quoted: msg }

          );

        }

        // Cas 7 : Document

        if (quotedMsg.documentMessage) {

          return await sock.sendMessage(

            from,

            {

              document: quotedMsg.documentMessage,

              fileName: quotedMsg.documentMessage.fileName || "📄 Document",

              mimetype: quotedMsg.documentMessage.mimetype,

              mentions,

            },

            { quoted: msg }

          );

        }

        // Cas inconnu

        return await sock.sendMessage(

          from,

          { text: "📌 Message non supporté", mentions },

          { quoted: msg }

        );

      }

      // Si on envoie un texte après la commande

      if (args.length) {

        const message = args.join(" ");

        return await sock.sendMessage(from, { text: message, mentions }, { quoted: msg });

      }

      // Sinon → message par défaut

      return await sock.sendMessage(

        from,

        { text: "HADES XMD", mentions },

        { quoted: msg }

      );

    } catch (e) {

      console.error("❌ Erreur commande tag :", e);

      await sock.sendMessage(

        from,

        {

          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗

☠️ Échec lors de l’envoi du tag infernal.

> Détails : ${e.message}

╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`

        },

        { quoted: msg }

      );

    }

  },

};