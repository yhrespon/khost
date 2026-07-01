import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { Sticker, StickerTypes } from "wa-sticker-formatter";


export default {

  name: "take",

  description: "Reprendre un sticker et le re-signer au nom d'Hadès",

  async execute(sock, msg, args) {

    const from = msg.key.remoteJid;

    try {

      // Vérifier si c’est bien un sticker en réponse

      const quotedSticker = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;

      if (!quotedSticker) {

        return await sock.sendMessage(from, {

          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗

⚔️ Réponds à un *sticker* pour que je le scelle sous ton nom.

╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`

        }, { quoted: msg });

      }

      // Téléchargement du sticker

      const stream = await downloadContentFromMessage(quotedSticker, "sticker");

      let buffer = Buffer.from([]);

      for await (const chunk of stream) {

        buffer = Buffer.concat([buffer, chunk]);

      }

      // Re-création avec nouvelle signature

      const sticker = new Sticker(buffer, {

        pack: "",

        author: msg.pushName || " ${msg.pushName} ",

        type: StickerTypes.FULL,

        quality: 80,

      });

      await sock.sendMessage(from, { sticker: await sticker.build() }, { quoted: msg });

    } catch (e) {

      console.error("❌ Erreur take :", e);

      await sock.sendMessage(from, {

        text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗

☠️ Échec de la réincarnation du sceau infernal.

> Détails : ${e.message}

╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`

      }, { quoted: msg });

    }

  }

};