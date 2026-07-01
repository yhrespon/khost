export const name = "info";

export async function execute(sock, msg, args) {
  try {
    const text = `
🤖  𝐗𝐌𝐃 𝐕𝟏-𝐊𝐘𝐑𝐎 BOT
⚙️ Version: V1
👨‍💻 Developer: 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑
🔥 Mode: Ultra KIYOTAKA

BY 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑
`;

    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });

  } catch {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "Erreur info.\n\nby 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑"
    }, { quoted: msg });
  }
}
