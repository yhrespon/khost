import { getMode } from "../index.js";

export default {
  name: "menu",
  description: "Affiche le menu complet du bot",
  execute: async (sock, ctx, args) => {
    const from = ctx.from || "";
    const reply = ctx.reply || (() => {});
    const raw = ctx.raw || {};

    try {
      const pushName = raw.pushName || "User";

      const totalSeconds = process.uptime();
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const uptime = `${hours}h ${minutes}m ${seconds}s`;

      const mode = getMode();
      const modeText = mode === "private" ? "🔒 PRIVATE" : "🌐 PUBLIC";

      const text = `
┏❍ *ʀᴀɪᴢᴇʟ xᴍᴅ* ❍
┃ • 👤 User : ${pushName}
┃ • ⚙️ Mode : ${modeText}
┃ • ⏱️ Uptime : ${uptime}
┗◇

┏❍ *ɢᴇɴᴇʀᴀʟ* ❍
┃ • ᴍᴇɴᴜ
┃ • ʙᴜɢᴍᴇɴᴜ
┃ • ᴘʀᴇᴍɪᴜᴍᴍᴇɴᴜ
┗◇

┏❍ *ɢʀᴏᴜᴘᴇ* ❍
┃ • ᴀᴅᴅ
┃ • ᴋɪᴄᴋ
┃ • ᴋɪᴄᴋᴀʟʟ
┃ • ᴘʀᴏᴍᴏᴛᴇ
┃ • ᴅᴇᴍᴏᴛᴇ
┃ • ᴘʀᴏᴍᴏᴛᴇᴀʟʟ
┃ • ᴅᴇᴍᴏᴛᴇᴀʟʟ
┃ • ᴅᴇsᴄ
┃ • ʟɪɴᴋ
┃ • ᴍᴜᴛᴇ
┃ • ᴜɴᴍᴜᴛᴇ
┃ • ᴘᴜʀɢᴇ
┃ • ʟᴇᴀᴠᴇ
┃ • ɢᴘᴘ
┗◇

┏❍ *ᴜᴛɪʟɪᴛᴀɪʀᴇs* ❍
┃ • ɪᴀ
┃ • ᴘɪɴɢ
┃ • ᴏᴡɴᴇʀ
┃ • ᴍᴏᴅᴇ
┃ • ᴅᴇᴠɪᴄᴇ
┃ • sᴜᴅᴏ
┃ • sᴇᴛᴘʀᴇꜰɪx
┃ • ᴄʟᴇᴀɴᴘʀᴇꜰɪx
┃ • ɴᴇᴡs
┃ • ᴄᴏɴɴᴇᴄᴛ
┃ • ᴡᴇᴀᴛʜᴇʀ
┃ • ᴅʟᴛ
┃ • ᴄᴀʟᴄ
┃ • ᴛʀᴀɴsʟᴀᴛᴇ
┗◇

┏❍ *ᴘʀᴏᴛᴇᴄᴛɪᴏɴs* ❍
┃ • ᴀɴᴛɪʟɪɴᴋ
┃ • ᴀɴᴛɪᴘʀᴏᴍᴏᴛᴇ
┃ • ᴀɴᴛɪᴅᴇᴍᴏᴛᴇ
┃ • ᴀɴᴛɪʙᴏᴛ
┃ • ᴀɴᴛɪᴠɪᴇᴡᴏɴᴄᴇ
┃ • ᴀɴᴛɪᴅᴇʟᴇᴛᴇ
┃ • ᴀɴᴛɪʟᴏᴄ
┃ • ᴀɴᴛɪsᴛɪᴄᴋᴇʀ
┃ • ᴀɴᴛɪᴍᴇssᴀɢᴇ
┃ • ᴀɴᴛɪᴘɪᴄᴛᴜʀᴇ
┃ • ᴀɴᴛɪᴀᴜᴅɪᴏ
┃ • ᴀɴᴛɪᴠɪᴅᴇᴏ
┗◇

┏❍ *ᴏᴘᴛɪᴏɴs* ❍
┃ • ᴀᴜᴛᴏʀᴇᴀᴄᴛ
┃ • ᴀᴜᴛᴏʀᴇᴄᴏʀᴅɪɴɢ
┃ • ᴀᴜᴛᴏʀᴇᴀᴅ
┃ • ᴀᴜᴛᴏᴛʏᴘɪɴɢ
┃ • ᴀᴜᴛᴏʀᴇᴀᴅsᴛᴀᴛᴜs
┃ • ᴀᴜᴛᴏʙɪᴏ
┃ • ᴀɴᴛɪsᴘᴀᴍ
┃ • ᴀᴜᴛᴏʙᴠɴ
┃ • ᴡᴇʟᴄᴏᴍᴇ
┃ • ʀᴇᴘᴏɴs
┗◇

┏❍ *ᴍᴇᴅɪᴀ* ❍
┃ • sᴛɪᴄᴋᴇʀ
┃ • ᴛᴏᴀᴜᴅɪᴏ
┃ • ᴛᴏᴠɪᴅᴇᴏ
┃ • ɪᴍɢ
┃ • ᴘʟᴀʏ
┃ • ʜᴅ
┃ • ᴛᴛs
┃ • ᴛᴀᴋᴇ
┃ • ᴠᴠ
┃ • sᴀᴠᴇ
┃ • ᴘʜᴏᴛᴏ
┃ • ᴘᴘ
┗◇

┏❍ *ᴛᴀɢ* ❍
┃ • ᴛᴀɢᴀʟʟ
┃ • ᴛᴀɢ
┃ • ᴛᴀɢᴄʀᴇᴀᴛᴏʀ
┃ • sᴇᴛᴛᴀɢ
┃ • ᴛᴀɢᴀᴅᴍɪɴ
┗◇

┏❍ *ꜰᴜɴ* ❍
┃ • ʀɪᴅᴅʟᴇ
┃ • ᴍᴇᴍᴇ
┃ • ᴊᴏᴋᴇ
┃ • ᴛʀɪᴠɪᴀ
┗◇

> *_Powered by DEV-RAIZEL_*
`;

      // Envoi de l'image + menu
      await sock.sendMessage(from, {
        image: { url: "https://files.catbox.moe/4185go.jpg" },
        caption: text
      });

      // Réaction au message
      if (raw.key) await sock.sendMessage(from, { react: { text: "🩸", key: raw.key } });

      // Audio d'ambiance
      await sock.sendMessage(from, {
        audio: { url: "https://files.catbox.moe/f103si.mp3" },
        mimetype: "audio/mpeg"
      });

    } catch (err) {
      console.error(err);
      await reply("❌ Erreur menu.");
    }
  }
};