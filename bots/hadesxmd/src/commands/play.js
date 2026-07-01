import axios from "axios";

export const name = "play";
export const description = "Invoque une mélodie depuis YouTube";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const header = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗`;
  const footer = `\n\n> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

  const title = args.join(" ");
  if (!title) {
    return await sock.sendMessage(
      from,
      {
        text: `${header}
❌ *Invocation incomplète !*

⚔️ Offre un titre ou un artiste pour que je puisse ramener la mélodie des enfers.
╚════ஜ۩۞۩ஜ═════╝

${footer}`,
      },
      { quoted: msg }
    );
  }

  try {
    await sock.sendMessage(
      from,
      {
        text: `${header}
🔮 *Invocation en cours...*
🎶 Recherche pour : *${title}*
╚════ஜ۩۞۩ஜ═════╝

${footer}`,
      },
      { quoted: msg }
    );

    // API de recherche
    const apiUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(
      title
    )}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status || !data.result || !data.result.download_url) {
      throw new Error(
        "Aucune relique trouvée ou lien de téléchargement indisponible."
      );
    }

    const video = data.result;

    // Envoi vignette + infos
    const caption = `${header}
🎵 *MÉLODIE TROUVÉE* 🎵
╚════ஜ۩۞۩ஜ═════╝

⚔️ Titre : *${video.title}*
⏱️ Durée : ${video.duration}
👁️ Vues : ${video.views}
🔗 Lien : ${video.video_url}

📥 Invocation du son en cours...
🌑 Offert par *HADÈS XMD*

${footer}`;

    await sock.sendMessage(
      from,
      {
        image: { url: video.thumbnail },
        caption,
      },
      { quoted: msg }
    );

    // Envoi audio
    await sock.sendMessage(
      from,
      {
        audio: { url: video.download_url },
        mimetype: "audio/mp4",
        ptt: false,
      },
      { quoted: msg }
    );
  } catch (err) {
    await sock.sendMessage(
      from,
      {
        text: `${header}
❌ *Échec de l’invocation !*

⚠️ ${err.message}
╚════ஜ۩۞۩ஜ═════╝

${footer}`,
      },
      { quoted: msg }
    );
  }
}