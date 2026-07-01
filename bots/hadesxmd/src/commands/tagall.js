export default {

  name: "tagall",

  description: "Mentionne tous les membres du groupe avec style Hadès XMD",

  async execute(sock, msg, args) {

    const from = msg.key.remoteJid;

    try {

      // Vérifier que c'est un groupe

      if (!from.endsWith("@g.us")) {

        return await sock.sendMessage(from, {

          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗

⚠️ Cette commande est réservée aux groupes.

╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`

        }, { quoted: msg });

      }

      const groupMetadata = await sock.groupMetadata(from);

      const participants = groupMetadata.participants;

      const mentions = participants.map(p => p.id);

      const decoratedMentions = participants

        .map(p => `⚛️ @${p.id.split("@")[0]}`)

        .join("\n");

      const replyText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗

💀🕷️ *TAGALL* 🕷️💀

─────────────────────

⚡ Que chacun lise et comprenne la puissance des enfers !

🌑 Les dieux des ténèbres veillent...

─────────────────────

${decoratedMentions}

╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(

        from,

        {

          image: { url: "https://files.catbox.moe/q6nuz5.jpg" },

          caption: replyText,

          mentions

        },

        { quoted: msg }

      );

    } catch (err) {

      console.error("❌ Erreur commande tagall :", err);

      await sock.sendMessage(from, {

        text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗

⚠️ Une erreur est survenue lors de l’appel de la commande.

╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`

      }, { quoted: msg });

    }

  }

};