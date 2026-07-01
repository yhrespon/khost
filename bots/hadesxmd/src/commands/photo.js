import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export const name = "photo";

export const description = "Transformer un sticker en photo";

export async function execute(sock, msg, args) {

  const from = msg.key.remoteJid;

  try {

    // Vérifie si on répond à un sticker

    const quoted =

      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

        ?.stickerMessage;

    if (!quoted) {

      const warnText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
⚠️ Réponds à un sticker
pour le transformer en image
╚════ஜ۩۞۩ஜ═════╝
> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      return await sock.sendMessage(from, { text: warnText }, { quoted: msg });

    }

    // Télécharge le sticker

    const stream = await downloadContentFromMessage(quoted, "sticker");

    let buffer = Buffer.from([]);

    for await (const chunk of stream) {

      buffer = Buffer.concat([buffer, chunk]);

    }

    // Envoi de la photo convertie

    const caption = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
🖼️ Sticker → Photo
✔️ Conversion réussie
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

    await sock.sendMessage(

      from,

      { image: buffer, caption },

      { quoted: msg }

    );

  } catch (e) {

    const errText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ Erreur lors de la conversion
⚡ ${e.message}
╚════ஜ۩۞۩ஜ═════╝
> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

    await sock.sendMessage(from, { text: errText }, { quoted: msg });

  }

}