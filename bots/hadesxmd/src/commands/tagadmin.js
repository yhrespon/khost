import path from "path";

export default {

  name: "tagadmin",

  description: "Mentionne tous les administrateurs du groupe",

  async execute(sock, msg, args) {

    const from = msg.key.remoteJid;

    try {

      const groupMetadata = await sock.groupMetadata(from);

      const admins = groupMetadata.participants.filter(p => p.admin);

      if (admins.length === 0) {

        return await sock.sendMessage(from, {

          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
⚠️ Aucun administrateur trouvé dans ce groupe.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`

        }, { quoted: msg });

      }

      const mentions = admins.map(a => a.id);

      const decoratedAdmins = admins

        .map(a => `⚜️ @${a.id.split("@")[0]}`)

        .join("\n");

      const replyText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
👑 *Les Seigneurs des Ténèbres* 👑
─────────────────────
${decoratedAdmins}
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(

        from,

        {

          image: { url: "https://files.catbox.moe/86zyrz.jpg" },

          caption: replyText,

          mentions

        },

        { quoted: msg }

      );

    } catch (err) {

      console.error("❌ Erreur commande tagadmin :", err);

      await sock.sendMessage(from, {

        text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
⚠️ Une erreur est survenue lors de l’invocation.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`

      }, { quoted: msg });

    }

  }

};