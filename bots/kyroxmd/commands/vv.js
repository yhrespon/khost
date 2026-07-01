import { downloadMediaMessage } from '@whiskeysockets/baileys';

export const name = "vv";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quotedMsg) {
      return sock.sendMessage(from, {
        text: "❌ Réponds à une image/vidéo vue unique avec !vv"
      }, { quoted: msg });
    }

    // IMAGE
    if (quotedMsg.imageMessage) {
      return await sendMedia(sock, msg, quotedMsg.imageMessage, "image");
    }

    // VIDEO
    if (quotedMsg.videoMessage) {
      return await sendMedia(sock, msg, quotedMsg.videoMessage, "video");
    }

    // STICKER (optionnel)
    if (quotedMsg.stickerMessage) {
      return await sendMedia(sock, msg, quotedMsg.stickerMessage, "sticker");
    }

    return sock.sendMessage(from, {
      text: "❌ Le message cité n'est pas une image/vidéo/sticker."
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur vv :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "❌ Impossible de traiter la vue unique."
    }, { quoted: msg });
  }
}

async function sendMedia(sock, msg, mediaMessage, type) {
  const from = msg.key.remoteJid;

  const buffer = await downloadMediaMessage(
    { message: { [`${type}Message`]: mediaMessage } },
    'buffer',
    {},
    { reuploadRequest: sock.updateMediaMessage }
  );

  if (type === "image") {
    await sock.sendMessage(from, { image: buffer }, { quoted: msg });
  }

  else if (type === "video") {
    await sock.sendMessage(from, { video: buffer }, { quoted: msg });
  }

  else if (type === "sticker") {
    await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
  }
}