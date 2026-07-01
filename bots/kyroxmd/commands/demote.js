export const name = "demote";

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
      await sock.sendMessage(from, { text: "⚠️ Vous devez répondre ou mentionner un membre à rétrograder.\n\nBY DEV HAKERS" }, { quoted: msg });
      return;
    }

    // Démotion
    await sock.groupParticipantsUpdate(from, [target], "demote");

    await sock.sendMessage(from, { text: `✅ ${target} a été rétrogradé !\n\nBY DEV HACKER` }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur demote :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "❌ Impossible de rétrograder ce membre.\n\nBY DEV HACKER"
    }, { quoted: msg });
  }
}
