export const name = "kick";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    if (!from.endsWith("@g.us"))
      return sock.sendMessage(from, { text: "Commande groupe uniquement." }, { quoted: msg });

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

    if (!mentioned)
      return sock.sendMessage(from, { text: "Mentionne la personne à expulser." }, { quoted: msg });

    await sock.groupParticipantsUpdate(from, mentioned, "remove");

    await sock.sendMessage(from, {
      text: `👢 Utilisateur expulsé.

BY DEV KIYOTAKA
j'suis là pour ma première fois accepter mon silence et a ma deuxième version vous ne serez pas deçu`
    }, { quoted: msg });

  } catch (err) {
    console.error("Erreur kick :", err);
  }
}
