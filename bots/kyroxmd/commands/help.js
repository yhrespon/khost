export const name = "help";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    const reply = `📖 *MENU DES COMMANDES*

• ping
• groupeinfo
• uptime
• ai
• pay
• help

BY DEV HACKERS
j'suis là pour ma première fois accepter mon silence et a ma deuxième version vous ne serez pas deçu`;

    await sock.sendMessage(from, { text: reply }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur help :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "Erreur affichage menu.\n\nBY DEV HACKERS\nj'suis là pour ma première fois accepter mon silence et a ma deuxième version vous ne serez pas deçu"
    }, { quoted: msg });
  }
}
