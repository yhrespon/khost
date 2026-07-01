export const name = "groupeinfo";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    if (!from.endsWith("@g.us")) {
      return await sock.sendMessage(from, {
        text: "❌ Cette commande fonctionne uniquement en groupe.\n\nBY DEV HAKERS\nj'suis là pour ma première fois accepter mon silence et a ma deuxième version vous ne serez pas deçu"
      }, { quoted: msg });
    }

    const metadata = await sock.groupMetadata(from);

    const groupName = metadata.subject;
    const participants = metadata.participants.length;
    const desc = metadata.desc || "Aucune description";

    const reply = `📌 *INFORMATIONS DU GROUPE*

📛 Nom : ${groupName}
👥 Membres : ${participants}
📝 Description : ${desc}

BY DEV HACKER/𝐗𝐌𝐃 𝐕𝟏-𝐊𝐘𝐑𝐎
j'suis là pour ma première fois accepter mon silence et a ma deuxième version vous ne serez pas deçu`;

    await sock.sendMessage(from, { text: reply }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur groupeinfo :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "Impossible de récupérer les infos du groupe.\n\nBY DEV HACKER\nj'suis là pour ma première fois accepter mon silence et a ma deuxième version vous ne serez pas deçu"
    }, { quoted: msg });
  }
}
