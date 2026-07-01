import { getDevice } from "@whiskeysockets/baileys";

export default {
  name: "device",
  description: "📱 𝙳𝚎́𝚝𝚎𝚌𝚝𝚎𝚛 𝚕'𝚊𝚙𝚙𝚊𝚛𝚎𝚒𝚕",

  async execute(sock, message) {
    const { from, reply } = message;
    try {
      const quotedId = message.quoted?.key?.id || message.message?.extendedTextMessage?.contextInfo?.stanzaId;
      if (!quotedId) return await reply("❌ 𝚁𝚎́𝚙𝚘𝚗𝚍𝚜 𝚊̀ 𝚞𝚗 𝚖𝚎𝚜𝚜𝚊𝚐𝚎");

      const code = getDevice(quotedId);
      const deviceNames = { 0:"Android", 1:"iPhone", 2:"Web", 3:"Desktop", 4:"Web" };
      const deviceName = deviceNames[code] || "Inconnu";

      await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚍𝚎𝚟𝚒𝚌𝚎 』
┃ ┗ 📱 𝙰𝚙𝚙𝚊𝚛𝚎𝚒𝚕 : *${deviceName}*
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);
    } catch { await reply("❌ 𝙸𝚖𝚙𝚘𝚜𝚜𝚒𝚋𝚕𝚎"); }
  }
};
