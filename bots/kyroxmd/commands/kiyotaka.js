export const name = "kiyotaka";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    // Message à envoyer après la photo
    const texte = `Fini de souffrir des spams, prenez ce cadeau de ma part et faites-en bonne usage...\n\n🌐 ${"https://codepen.io/Kunz-Misse/full/GgqwpZq"}\n\nBY 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑`;

    // Envoi de l'image
    await sock.sendMessage(from, {
      image: { url: "https://files.catbox.moe/u1c1j5.jpg" },
      caption: texte
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur kiyotaka :", err);
    await sock.sendMessage(from, {
      text: "❌ Impossible d'envoyer le cadeau.\nBY 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑"
    }, { quoted: msg });
  }
}
