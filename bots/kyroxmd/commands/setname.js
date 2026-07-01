export const name = "setname";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    if (!args.length)
      return sock.sendMessage(from, { text: "Donne un nom.\n\nby 𝐃𝐄𝐕 𝐊𝐈𝐘𝐎𝐓𝐀𝐊𝐀" }, { quoted: msg });

    const newName = args.join(" ");
    await sock.groupUpdateSubject(from, newName);

    await sock.sendMessage(from, {
      text: `✅ Nom changé en : ${newName}\n\nBY 𝐃𝐄𝐕 𝐊𝐈𝐘𝐎𝐓𝐀𝐊𝐀`
    }, { quoted: msg });

  } catch {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "Erreur setname.\n\nBY 𝐃𝐄𝐕 𝐊𝐈𝐘𝐎𝐓𝐀𝐊𝐀"
    }, { quoted: msg });
  }
}
