export default {
  name: "ping",
  description: "Tester la réactivité et voir l'uptime du bot",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    try {
      // 🔹 Réaction initiale sur le message de l’utilisateur
      await sock.sendMessage(from, {
        react: {
          text: "⏳", // réaction "chargement"
          key: msg.key,
        },
      });

      // 🔹 Calcul de la latence
      const start = Date.now();
      const sent = await sock.sendMessage(from, { text: "📡 Calcul de la latence..." }, { quoted: msg });
      const latency = Date.now() - start;

      // 🔹 Calcul de l’Uptime
      const uptimeSeconds = process.uptime();
      const uptimeHours = Math.floor(uptimeSeconds / 3600);
      const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
      const uptimeSecs = Math.floor(uptimeSeconds % 60);
      const uptimeText = `${uptimeHours}h ${uptimeMinutes}m ${uptimeSecs}s`;

      // 🔹 Réponse finale stylisée
      await sock.sendMessage(
        from,
        {
          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
🏓  *PONG !*
📡 Latence : *${latency} ms*
⏳ Uptime : *${uptimeText}*
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,
          edit: sent.key,
        }
      );

      // 🔹 Mise à jour de la réaction finale (remplace ⏳ par 🏓)
      await sock.sendMessage(from, {
        react: {
          text: "🏓",
          key: msg.key,
        },
      });
    } catch (e) {
      await sock.sendMessage(from, { text: `❌ Erreur: ${e.message}` }, { quoted: msg });
    }
  },
};