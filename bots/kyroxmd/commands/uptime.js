export const name = "uptime";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const reply = `⏳ *TEMPS EN LIGNE*

🕒 ${hours}h ${minutes}m ${seconds}s

BY DEV KIYOTAKA
j'suis là pour ma première fois accepter mon silence et a ma deuxième version vous ne serez pas deçu`;

    await sock.sendMessage(from, { text: reply }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur uptime :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "Erreur lors du calcul du uptime.\n\nBY DEV KIYOTAKA\nj'suis là pour ma première fois accepter mon silence et a ma deuxième version vous ne serez pas deçu"
    }, { quoted: msg });
  }
}
