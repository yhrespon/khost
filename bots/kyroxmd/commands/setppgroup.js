export const name = "setppgroup";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, {
        text: "❌ Groupe uniquement.\n\nby 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑"
      }, { quoted: msg });
    }

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted?.imageMessage) {
      return sock.sendMessage(from, {
        text: "❌ Réponds à une image.\n\nby 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑"
      }, { quoted: msg });
    }

    const buffer = await sock.downloadMediaMessage({
      message: quoted
    });

    await sock.updateProfilePicture(from, buffer);

    await sock.sendMessage(from, {
      text: "✅ Photo du groupe mise à jour.\n\nby 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑"
    }, { quoted: msg });

  } catch {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "Erreur setppgroup.\n\nby 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑"
    }, { quoted: msg });
  }
}
