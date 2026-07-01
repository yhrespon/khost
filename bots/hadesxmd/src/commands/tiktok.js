import axios from "axios";

export default {
  name: "tiktok",
  description: "Télécharge une vidéo TikTok sans watermark",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    // Détermine le lien TikTok
    let tiktokUrl = args[0];

    // Si la commande est en réponse à un message, récupère le texte du message ciblé
    if (!tiktokUrl && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation) {
      tiktokUrl = msg.message.extendedTextMessage.contextInfo.quotedMessage.conversation;
    }

    if (!tiktokUrl) {
      return await sock.sendMessage(from, { text: "❌ Veuillez fournir un lien TikTok ou répondre à un message contenant le lien !" }, { quoted: msg });
    }

    try {
      // Appel de l'API NexOracle
      const apiUrl = `https://api.nexoracle.com/downloader/tiktok-nowm?apikey=free_key@maher_apis&url=${encodeURIComponent(tiktokUrl)}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data || !data.video || !data.video.url) {
        return await sock.sendMessage(from, { text: "❌ Impossible de récupérer la vidéo TikTok." }, { quoted: msg });
      }

      // Télécharge la vidéo en buffer
      const videoResponse = await axios.get(data.video.url, { responseType: "arraybuffer" });
      const videoBuffer = Buffer.from(videoResponse.data, "binary");

      // Envoie la vidéo
      await sock.sendMessage(from, {
        video: videoBuffer,
        caption: "🎬 Voici ta vidéo TikTok sans watermark !"
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ Erreur TikTok :", err);
      await sock.sendMessage(from, { text: "⚡ Impossible de télécharger la vidéo TikTok." }, { quoted: msg });
    }
  },
};