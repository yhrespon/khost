export const name = "contact";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    const caption = `👑 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑👑

📞 CONTACT DÉVELOPPEUR :
+224 626 64 71 41/+2250710096696

✨ Voici mon règne, acceptez-moi tel que je suis.
𝐗𝐌𝐃 𝐕𝟏-𝐊𝐘𝐑𝐎 vient laisser sa signature.

━━━━━━━━━━━━━━━━━━
BY 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑`;

    await sock.sendMessage(from, {
      image: { url: "https://files.catbox.moe/b3yv0e.jpg" },
      caption: caption
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur contact :", err);
    await sock.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Impossible d'afficher le contact.\nBY DEV HACKER" },
      { quoted: msg }
    );
  }
}
