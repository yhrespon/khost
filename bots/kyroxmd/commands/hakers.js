export const name = "hakers";

export async function execute(sock, msg) {
  try {
    const from = msg.key.remoteJid;

    const IMAGE_URL = "https://files.catbox.moe/b3yv0e.jpg";

    const caption = `╔══════════════════╗
        🤖 𝐏𝐑𝐄𝐒𝐄𝐍𝐓𝐀𝐓𝐈𝐎𝐍 𝐃𝐔 𝐁𝐎𝐓 🤖
╚══════════════════╝

✨ Ce bot a été conçu pour être utile à votre service.
Il a été créé pour vous offrir puissance, sécurité et performance dans vos groupes WhatsApp.

👑 Bot officiel de :
𝐗𝐌𝐃 𝐕𝟏-𝐊𝐘𝐑𝐎

🛠️ Développé par :
🔥 𝐃𝐄𝐕 𝐇𝐀𝐊𝐄𝐑𝐒 🔥

🏠 Ce projet fait partie de la grande maison :
𝐇𝐀𝐊𝐄𝐑𝐒 𝐌𝐀𝐒𝐓𝐄𝐑
dirigée par le grand 𝐃𝐄𝐕 𝐇𝐀𝐊𝐄𝐑𝐒.

━━━━━━━━━━━━━━━━━━━

🚀 Vous voulez rejoindre une communauté puissante ?
💻 Apprendre, évoluer et faire partie d’une élite digitale ?

👉 Rejoignez dès maintenant la maison 𝐇𝐀𝐂𝐊𝐌𝐀𝐒𝐓𝐄𝐑 :

🔗 https://chat.whatsapp.com/FhUXgWgCnzsFpJjRseuYOU?mode=gi_t

📞 Ou contactez directement :
𝐃𝐄𝐕 𝐇𝐀𝐊𝐄𝐑𝐒
+224 626 64 71 41

━━━━━━━━━━━━━━━━━━━

🔥 Ensemble nous bâtissons une communauté forte, ambitieuse et déterminée.

        ✍️ 𝐗𝐌𝐃 𝐕𝟏-𝐊𝐘𝐑𝐎`;

    await sock.sendMessage(
      from,
      {
        image: { url: IMAGE_URL },
        caption: caption
      },
      { quoted: msg }
    );

  } catch (err) {
    console.error("Erreur hakers :", err);
  }
}