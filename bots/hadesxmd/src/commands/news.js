import axios from "axios";

export default {
  name: "news",
  description: "Afficher les dernières actualités (Hadès XMD)",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    try {
      // Message d’attente sombre
      await sock.sendMessage(from, {
        text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
🌑 Les ombres s’agitent...
📡 Invocation des nouvelles des ténèbres...
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,
      });

      const apiKey = "dcd720a6f1914e2d9dba9790c188c08c"; // ta clé NewsAPI
      const response = await axios.get(
        `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`
      );

      const articles = response.data.articles.slice(0, 5);

      let newsMessage = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
📰 *LES CHRONIQUES DES TÉNÈBRES* 📰
╟─────────────────────────────╢`;

      articles.forEach((article, index) => {
        newsMessage += `\n🌑 ${index + 1}. *${article.title}*\n⚡ ${
          article.description || "Aucune description transmise par les ombres"
        }\n`;
      });

      newsMessage += `╚════ஜ۩۞۩ஜ═════╝

🩸 « Même les ténèbres rapportent la vérité. »

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text: newsMessage }, { quoted: msg });
    } catch (error) {
      console.error("❌ Erreur commande news:", error);

      const failText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
❌ Les ombres refusent de livrer leurs secrets.
⚡ Essaie de nouveau plus tard.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text: failText }, { quoted: msg });
    }
  },
};