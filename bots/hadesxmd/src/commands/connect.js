import fs from "fs";
import path from "path";

export default {
  name: 'connect',
  description: 'Informations de connexion du bot',
  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;
      await sock.sendMessage(from, {
        text: [
          '╔══════════════════════════════╗',
          '║  👑 HADES XMD — CONNEXION   ║',
          '╚══════════════════════════════╝',
          '',
          '✅ Bot actif et connecté.',
          '⚙️  Le pairing se fait via Krinyx.',
          '',
          '👨‍💻 Dev by Raizel & Knut',
          '📢 https://whatsapp.com/channel/0029VbBU3ISHwXb5Gd65Jp1I'
        ].join('\n')
      }, { quoted: msg });
    } catch (err) {
      console.error('Erreur connect:', err);
    }
  }
};
