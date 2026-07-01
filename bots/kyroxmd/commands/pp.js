export const name = "pp";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    let target;

    // Si mention dans groupe
    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
      target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else {
      target = msg.key.participant || msg.key.remoteJid;
    }

    const ppUrl = await sock.profilePictureUrl(target, "image").catch(() => null);

    if (!ppUrl) {
      return await sock.sendMessage(from, {
        text: "❌ Impossible de récupérer la photo.\n\nby 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑"
      }, { quoted: msg });
    }

    await sock.sendMessage(from, {
      image: { url: ppUrl },
      caption: "🖼️ Photo de profil récupérée.\n\nby 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑"
    }, { quoted: msg });

  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "Erreur pp.\n\nby 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑"
    }, { quoted: msg });
  }
}
