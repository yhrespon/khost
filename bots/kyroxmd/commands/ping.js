export const name = "ping";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    const start = Date.now();
    const sentMsg = await sock.sendMessage(from, { text: "pong !..." }, { quoted: msg });
    const latency = Date.now() - start;

    const reply = `Latence : ${latency} ms\n\n𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑`;

    await sock.sendMessage(from, { text: reply }, { quoted: sentMsg });

  } catch (err) {
    console.error("❌ Erreur ping :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "Impossible de calculer la vitesse.\n\n𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑"
    }, { quoted: msg });
  }
}
