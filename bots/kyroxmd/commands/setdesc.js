export const name = "setdesc";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    if (!args.length)
      return sock.sendMessage(from, { text: "Donne une description.\n\nby DEV_HAKERSv2" }, { quoted: msg });

    const desc = args.join(" ");
    await sock.groupUpdateDescription(from, desc);

    await sock.sendMessage(from, {
      text: "✅ Description mise à jour.\n\nby DEV_HAKERSv2"
    }, { quoted: msg });

  } catch {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "Erreur setdesc.\n\nby DEV_HAKERSv2"
    }, { quoted: msg });
  }
}
