export const name = "left";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    if (!from.endsWith("@g.us")) {
      return await sock.sendMessage(from, { text: "❌ Cette commande fonctionne seulement dans un groupe." }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: "👋 Le bot quitte le groupe.\n\nby 𝐃𝐄𝐕 𝐊𝐈𝐘𝐎𝐓𝐀𝐊𝐀" }, { quoted: msg });
    await sock.groupLeave(from);

  } catch (err) {
    console.error("❌ Erreur left :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "Impossible de quitter le groupe.\n\nBY 𝐃𝐄𝐕 𝐊𝐈𝐘𝐎𝐓𝐀𝐊𝐀"
    }, { quoted: msg });
  }
}
