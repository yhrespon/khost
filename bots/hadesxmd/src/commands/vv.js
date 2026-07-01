import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {

  name: "vv",

  description: "Récupérer une photo, vidéo ou audio vue unique (Hadès XMD)",

  async execute(sock, msg, args) {

    const from = msg.key.remoteJid;

    try {

      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted) {

        return await sock.sendMessage(

          from,

          {

            text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
⚔️ Réponds à une *photo*, *vidéo* ou *audio* vue unique.
Seul Hadès peut briser l’ombre du *one-view*.
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,

          },

          { quoted: msg }

        );

      }

      const innerMsg =

        quoted.viewOnceMessageV2?.message ||

        quoted.viewOnceMessageV2Extension?.message ||

        quoted;

      // --- IMAGE ---

      if (innerMsg.imageMessage) {

        const stream = await downloadContentFromMessage(innerMsg.imageMessage, "image");

        let buffer = Buffer.from([]);

        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        return await sock.sendMessage(

          from,

          {

            image: buffer,

            caption: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗ 
📸 *Image vue unique arrachée aux ombres !* 
Hadès ne laisse rien disparaître...  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,

          },

          { quoted: msg }

        );

      }

      // --- VIDÉO ---

      if (innerMsg.videoMessage) {

        const stream = await downloadContentFromMessage(innerMsg.videoMessage, "video");

        let buffer = Buffer.from([]);

        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        return await sock.sendMessage(

          from,

          {

            video: buffer,

            caption: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗ 
🎥 *Vidéo vue unique saisie aux ténèbres !* 
Hadès déchire le voile de l’oubli...  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,

          },

          { quoted: msg }

        );

      }

      // --- AUDIO ---

      if (innerMsg.audioMessage) {

        const stream = await downloadContentFromMessage(innerMsg.audioMessage, "audio");

        let buffer = Buffer.from([]);

        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        await sock.sendMessage(

          from,

          {

            audio: buffer,

            mimetype: "audio/mp4",

            ptt: innerMsg.audioMessage.ptt || false,

          },

          { quoted: msg }

        );

        return await sock.sendMessage(

          from,

          {

            text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗  
🎵 *Audio vue unique libéré des chaînes !* 
La voix n’est plus prisonnière...  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,

          },

          { quoted: msg }

        );

      }

      // Si ce n’est pas un média valide

      await sock.sendMessage(

        from,

        {

          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗  
❌ Ce n’est pas une photo, vidéo ou audio vue unique.  
L’ombre n’a rien à révéler ici...  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,

        },

        { quoted: msg }

      );

    } catch (e) {

      await sock.sendMessage(

        from,

        {

          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗  
💀 Une erreur est survenue...  
❌ Détails : ${e.message}  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,

        },

        { quoted: msg }

      );

    }

  },

};