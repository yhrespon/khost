import axios from "axios";

export default {
  name: "hades",
  description: "Poser une question à l’IA Hadès",

  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;
      const query = args.join(" ");

      if (!query) {
        const usageText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
⚠️ *Invocation incorrecte !*
Exemple : *.hades qui est le dieu le plus puissant ?*
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 - 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

        await sock.sendMessage(from, { text: usageText }, { quoted: msg });
        return;
      }

      // Message d’attente
      await sock.sendMessage(
        from,
        {
          text: `🌒🕯️ *Les ombres murmurent… Hadès réfléchit.*`,
        },
        { quoted: msg }
      );

      // Appel API
      const apiUrl = `https://apis.davidcyriltech.my.id/ai/chatbot?query=${encodeURIComponent(query)}`;
      const { data } = await axios.get(apiUrl);

      if (!data.success || !data.result) {
        throw new Error("Aucune réponse obtenue des abîmes...");
      }

      // Réponse stylisée
      const reply = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
Réponse d’Hadès : ${data.result}
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 - 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text: reply }, { quoted: msg });

    } catch (err) {
      console.error("❌ Erreur commande hades :", err);

      const errorText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
❌ *Une faille a perturbé les ombres !*
⚡ Détails : ${err.message}
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 - 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text: errorText }, { quoted: msg });
    }
  },
};