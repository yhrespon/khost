export const name = "ban";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    if (!from.endsWith("@g.us"))
      return sock.sendMessage(from, { text: "Commande groupe uniquement." }, { quoted: msg });

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

    if (!mentioned)
      return sock.sendMessage(from, { text: "Mentionne la personne à bannir." }, { quoted: msg });

    await sock.groupParticipantsUpdate(from, mentioned, "remove");

    await sock.sendMessage(from, {
      text: `🚫 Utilisateur banni.

BY 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑 /𝐗𝐌𝐃 𝐕𝟏-𝐊𝐘𝐑𝐎
j'suis là pour faire reigner le respect accepter mon silence et a ma deuxième version vous ne serez pas deçu`
    }, { quoted: msg });

  } catch (err) {
    console.error("Erreur ban :", err);
  }
}
