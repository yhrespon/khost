export const name = "promote";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    if (!from.endsWith("@g.us")) {
      await sock.sendMessage(from, { text: `⚠️ Cette commande fonctionne uniquement dans les groupes.\n\nBY DEV KIYOTAKA` }, { quoted: msg });
      return;
    }

    // Vérifie qu'on a reply ou mentionné
    const mentionedJid = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
    let target;
    if (mentionedJid && mentionedJid.length) {
      target = mentionedJid[0];
    } else if (msg.message.extendedTextMessage?.contextInfo?.participant) {
      target = msg.message.extendedTextMessage.contextInfo.participant;
    } else {
      await sock.sendMessage(from, { text: "⚠️ Vous devez répondre ou mentionner un membre à promouvoir.\n\nBY DEV KIYOTAKA" }, { quoted: msg });
      return;
    }

    // Promotion
    await sock.groupParticipantsUpdate(from, [target], "promote");

    await sock.sendMessage(from, { text: `✅ ${target} a été promu administrateur !\n\nBY DEV KIYOTAKA` }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur promote :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "❌ Impossible de promouvoir ce membre.\n\nBY DEV KIYOTAKA"
    }, { quoted: msg });
  }
}
