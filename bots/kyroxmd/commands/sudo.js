import fs from "fs";

export const name = "sudo";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    if (!args[0]) {
      return await sock.sendMessage(from, { text: "❌ Veuillez indiquer le numéro à ajouter en sudo.\nExemple : !sudo 1234567890\n\nby 𝐃𝐄𝐕 𝐊𝐈𝐘𝐎𝐓𝐀𝐊𝐀" }, { quoted: msg });
    }

    const number = args[0].replace(/[^0-9]/g, "");
    const SUDO_FILE = "./sudo.json";

    let sudo = [];
    if (fs.existsSync(SUDO_FILE)) {
      sudo = JSON.parse(fs.readFileSync(SUDO_FILE, "utf-8"));
    }

    if (!sudo.includes(number)) sudo.push(number);
    fs.writeFileSync(SUDO_FILE, JSON.stringify(sudo, null, 2));

    await sock.sendMessage(from, { text: `✅ ${number} ajouté au sudo.\n\nby DEV KIYOTAKA` }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur sudo :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "Impossible d'ajouter ce membre au sudo.\n\nby 𝐃𝐄𝐕 𝐊𝐈𝐘𝐎𝐓𝐀𝐊𝐀"
    }, { quoted: msg });
  }
}
