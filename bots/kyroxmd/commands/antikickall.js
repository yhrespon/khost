import fs from "fs";

export const name = "antikickall";

export async function execute(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;

    if (!from.endsWith("@g.us")) {
      await sock.sendMessage(from, { text: "⚠️ Cette commande fonctionne uniquement dans les groupes.\n\nBY DEV HACKERS" }, { quoted: msg });
      return;
    }

    const groupFile = "./groups.json";
    let groups = {};
    if (fs.existsSync(groupFile)) {
      groups = JSON.parse(fs.readFileSync(groupFile, "utf-8"));
    }

    if (!groups[from]) {
      groups[from] = {
        antilink: false,
        antibot: false,
        antimessage: false,
        antiaudio: false,
        antitag: false,
        antipurge: false,
        antikickall: false
      };
    }

    if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
      await sock.sendMessage(from, { text: "Usage : !antikickall on/off\n\nBY DEV KIYOTAKA" }, { quoted: msg });
      return;
    }

    const action = args[0].toLowerCase();
    groups[from].antikickall = action === "on";
    fs.writeFileSync(groupFile, JSON.stringify(groups, null, 2));

    await sock.sendMessage(from, {
      text: `✅ Anti-kickall est maintenant *${action.toUpperCase()}*\nLes commandes kickall seront bloquées.\n\nBY 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑`
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Erreur antikickall :", err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: "❌ Impossible de traiter la commande.\n\nBY 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑"
    }, { quoted: msg });
  }
}
