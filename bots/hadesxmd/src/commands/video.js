import axios from "axios";

export default {

  name: "video",

  description: "Télécharge et envoie une vidéo depuis un lien",

  async execute(sock, msg, args) {

    const from = msg.key.remoteJid;

    const url = args[0]; // Exemple : .video https://youtube.com/...

    if (!url || !url.startsWith("http")) {

      return await sock.sendMessage(

        from,

        {

          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗

❌ *Lien manquant !*

⚔️ Donne-moi une URL valide pour invoquer la vidéo.

╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,

        },

        { quoted: msg }

      );

    }

    try {

      // Message de chargement

      await sock.sendMessage(

        from,

        {

          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
🔮 Invocation en cours...
🎥 Téléchargement depuis: ${url}
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,

        },

        { quoted: msg }

      );

      // API de téléchargement

      const response = await axios.post(

        "https://downloader-api-7mul.onrender.com/api/download",

        { url },

        { responseType: "json" }

      );

      if (!response.data || !response.data.filepath) {

        throw new Error("Aucune relique vidéo trouvée.");

      }

      const videoTitle = response.data.title || "Vidéo inconnue";

      const thumbnail = response.data.thumbnail;

      const downloadLink = response.data.filepath;

      // Envoi vignette + infos

      const caption = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
🎥 *VIDÉO TROUVÉE* 🎥
╚════ஜ۩۞۩ஜ═════╝
⚔️ Titre : *${videoTitle}*
🔗 Lien : ${url}
📥 Invocation de la relique vidéo...

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(

        from,

        {

          image: { url: thumbnail },

          caption,

        },

        { quoted: msg }

      );

      // Envoi vidéo directement

      await sock.sendMessage(

        from,

        {

          video: { url: downloadLink },
          mimetype: "video/mp4",
          caption: `🎬 Voici ta relique, mortel.

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,

        },

        { quoted: msg }

      );

    } catch (err) {

      await sock.sendMessage(

        from,

        {

          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ *Échec de l’invocation !*
⚠️ ${err.message}
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,

        },

        { quoted: msg }

      );

    }

  },

};