export const name = "owner";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    const text = `
👑 DEV KIYOTAKA BOT V1

📞 Owner : +237658011407
💻 Developer : DEV KIYOTAKA 

by DEV KIYOTAKA V1
`;

    await sock.sendMessage(from, { text }, { quoted: msg });

  } catch (err) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "Erreur owner.\n\nby DEV KIYOTAKA V1"
    }, { quoted: msg });
  }
}
