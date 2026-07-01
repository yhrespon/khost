export const name = "kickall";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    if (!from.endsWith("@g.us")) {
      return await sock.sendMessage(from, { text: "❌ Cette commande fonctionne seulement dans un groupe." }, { quoted: msg });
    }

    // Récupérer la liste des participants
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants;

    let count = 0;
    for (const p of participants) {
      if (!p.admin) { // Ne pas kicker les admins
        try {
          await sock.groupParticipantsUpdate(from, [p.id], "remove");
          count++;
        } catch (err) {
          console.error(`Impossible de supprimer ${p.id}:`, err);
        }
      }
    }

    const reply = `🧹 Tous les membres non-admin ont été supprimés ! Nombre : ${count}\n\nBY 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑`;
    await sock.sendMessage(from, { text: reply }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur kickall :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "Impossible de kicker tous les membres. Vérifie que le bot est admin.\n\nBY 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑"
    }, { quoted: msg });
  }
}
