import fs from "fs";
import path from "path";

export default {
  name: "mode",
  description: "Basculer le bot entre mode privé et public",
  async execute(sock, msg, args) {
    const value = args[0]?.toLowerCase();

    // Message d’usage au style Hadès XMD
    const usageText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ Usage incorrect
⚔️ Commande: *mode*
💡 Exemple: *!mode private* ou *!mode public*
╚════ஜ۩۞۩ஜ═════╝`;

    if (!value || !["private", "public"].includes(value)) {
      await sock.sendMessage(msg.key.remoteJid, { text: usageText });
      return;
    }

    // Mettre à jour config.json
    const configPath = path.join(process.cwd(), "hadesxmd/config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    config.BOT_MODE = value;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

    // Message de confirmation au style Hadès XMD
    const confirmText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
${value === "private" ? "🔒 *Mode privé activé*" : "🌐 *Mode public activé*"}
⚔️ Type: *Mode du bot*
╚════ஜ۩۞۩ஜ═════╝`;

    await sock.sendMessage(msg.key.remoteJid, { text: confirmText });
  }
};