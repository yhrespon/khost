export const name = "setppbot";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted?.imageMessage) {
      return await sock.sendMessage(from, {
        text: "❌ Réponds à une image.\n\nby DEV HACKERS"
      }, { quoted: msg });
    }

    const buffer = await sock.downloadMediaMessage({
      message: quoted
    });

    await sock.updateProfilePicture(sock.user.id, buffer);

    await sock.sendMessage(from, {
      text: "✅ Photo du bot mise à jour.\n\nby DEV HACKERS"
    }, { quoted: msg });

  } catch {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "Erreur setppbot.\n\nby DEV HAKERS"
    }, { quoted: msg });
  }
}
