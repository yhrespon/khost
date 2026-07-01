export default {
  name: "block",
  description: "𝙱𝚕𝚘𝚚𝚞𝚎𝚛 𝚞𝚗 𝚞𝚝𝚒𝚕𝚒𝚜𝚊𝚝𝚎𝚞𝚛",
  aliases: ["ban", "blockuser"],

  async execute(sock, message) {
    const { from, reply, args, quoted } = message;
    try {
      let targetUser = null;
      if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0)
        targetUser = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
      else if (quoted?.sender)
        targetUser = quoted.sender;
      else if (args[0]) {
        const num = args[0].replace(/\D/g, "");
        if (num.length >= 10) targetUser = num + "@s.whatsapp.net";
      }

      if (!targetUser) return await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚋𝚕𝚘𝚌𝚔 』
┃ ┣ ➢ .𝚋𝚕𝚘𝚌𝚔 @𝚞𝚜𝚎𝚛
┃ ┣ ➢ .𝚋𝚕𝚘𝚌𝚔 (𝚛𝚎́𝚙𝚘𝚗𝚍𝚛𝚎)
┃ ┗ ➢ .𝚋𝚕𝚘𝚌𝚔 𝚗𝚞𝚖𝚎́𝚛𝚘
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);

      await sock.updateBlockStatus(targetUser, "block");
      const userId = targetUser.split("@")[0];
      await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚋𝚕𝚘𝚌𝚔 』
┃ ┣ ✅ 𝙱𝚕𝚘𝚚𝚞𝚎́ : 📱 ${userId}
┃ ┗ 🚫 𝙰𝚌𝚌𝚎̀𝚜 𝚛𝚎𝚏𝚞𝚜𝚎́
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);
    } catch { await reply("❌ 𝙸𝚖𝚙𝚘𝚜𝚜𝚒𝚋𝚕𝚎"); }
  }
};
