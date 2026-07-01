import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { Sticker } from 'wa-sticker-formatter';

export const name = "take";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    // Vérifier s'il y a une image dans le message ou une citation
    let mediaMessage = null;
    let mediaType = null;

    // Cas 1 : image/vidéo directement dans le message
    if (msg.message?.imageMessage) {
      mediaMessage = msg.message.imageMessage;
      mediaType = "image";
    } else if (msg.message?.videoMessage) {
      mediaMessage = msg.message.videoMessage;
      mediaType = "video";
    }
    // Cas 2 : message cité
    else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
      if (quoted.imageMessage) {
        mediaMessage = quoted.imageMessage;
        mediaType = "image";
      } else if (quoted.videoMessage) {
        mediaMessage = quoted.videoMessage;
        mediaType = "video";
      }
    }

    if (!mediaMessage) {
      return await sock.sendMessage(from, {
        text: "❌ Veuillez envoyer une image/vidéo ou répondre à un message contenant un média."
      }, { quoted: msg });
    }

    // Télécharger le média
    const buffer = await downloadMediaMessage(
      { message: { [mediaType + 'Message']: mediaMessage } },
      'buffer',
      {},
      { reuploadRequest: sock.updateMediaMessage }
    );

    // Nom du sticker
    const stickerName = args.join(" ") || "DEV KIYOTAKA";

    // Créer le sticker
    const sticker = new Sticker(buffer, {
      pack: 'Sticker Pack',
      author: stickerName,
      type: mediaType === 'image' ? 'full' : 'crop',
      quality: 80,
      background: '#000000'
    });

    const stickerBuffer = await sticker.toBuffer();
    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur take :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "❌ Impossible de créer le sticker.\nby 𝐃𝐄𝐕 𝐊𝐈𝐘𝐎𝐓𝐀𝐊𝐀"
    }, { quoted: msg });
  }
}