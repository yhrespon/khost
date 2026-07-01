export const name = "purge";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    if (!from.endsWith("@g.us")) {
      return await sock.sendMessage(from, {
        text: "❌ Cette commande fonctionne seulement dans un groupe."
      }, { quoted: msg });
    }

    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants;

    let count = 0;

    for (const p of participants) {
      if (!p.admin) {
        try {
          await sock.groupParticipantsUpdate(from, [p.id], "remove");
          count++;
        } catch (err) {
          console.error(`Impossible de supprimer ${p.id}:`, err);
        }
      }
    }

    const messageFinal = `
🌹𝑃𝑒𝑟𝑠𝑜𝑛𝑛𝑒 𝑛𝑒 𝑠𝑎𝑖𝑡 𝑞𝑢𝑎𝑛𝑑 𝑙𝑎 𝑚𝑜𝑟𝑡 𝑣𝑖𝑒𝑛𝑑𝑟𝑎 𝑛𝑜𝑢𝑠 𝑐𝑢𝑒𝑖𝑙𝑙𝑖𝑟...
𝑀𝑎𝑖𝑠 𝑞𝑢'𝑖𝑙 𝑛𝑜𝑢𝑠 𝑟𝑒𝑠𝑡𝑒 𝑢𝑛𝑒 𝑠𝑒𝑢𝑙 𝑗𝑜𝑢𝑟𝑛é𝑒 𝑜𝑢 𝑢𝑛𝑒 𝑠𝑜𝑖𝑥𝑎𝑛𝑡𝑎𝑖𝑛𝑒 𝑑'𝑎𝑛𝑛é𝑒𝑠 𝑎 𝑣𝑖𝑣𝑟𝑒,
𝑜𝑛 𝑎𝑢𝑟𝑎 𝑡𝑜𝑢𝑗𝑜𝑢𝑟𝑠 𝑙𝑒 𝑠𝑒𝑛𝑡𝑖𝑚𝑒𝑛𝑡 𝑑𝑒 𝑛𝑒 𝑝𝑎𝑠 𝑎𝑣𝑜𝑖𝑟 𝑒𝑢 𝑎𝑠𝑠𝑒𝑧 𝑑𝑒 𝑡𝑒𝑚𝑝𝑠...

✨ La purge est terminée.
Membres supprimés : ${count}

BY DEV HACKERS
`;

    await sock.sendMessage(from, {
      image: { url: "https://files.catbox.moe/b3yv0e.jpg" },
      caption: messageFinal
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur purge :", err);

    await sock.sendMessage(msg.key.remoteJid, {
      text: "Impossible de purger le groupe. Vérifie que le bot est admin.\n\nby DEV HACKES"
    }, { quoted: msg });
  }
}
