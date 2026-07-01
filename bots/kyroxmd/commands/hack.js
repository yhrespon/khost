export const name = "hack";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    const target = args[0] || "Cible";

    await sock.sendMessage(from, {
      text: `💻 Initialisation du hack sur ${target}...\n\nby 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑`
    }, { quoted: msg });

  } catch {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "Erreur hack.\n\nby 𝐃𝐄𝐕 𝐊𝐈𝐘𝐎𝐓𝐀𝐊𝐀"
    }, { quoted: msg });
  }
}
