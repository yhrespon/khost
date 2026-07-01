export default {
  name: "invite",
  description: "✉️ 𝙴𝚗𝚟𝚘𝚢𝚎𝚛 𝚕𝚎 𝚕𝚒𝚎𝚗 𝚍'𝚒𝚗𝚟𝚒𝚝𝚊𝚝𝚒𝚘𝚗",

  async execute(sock, message) {
    const { from, reply, isGroup } = message;
    if (!isGroup) return await reply("❌ 𝙶𝚛𝚘𝚞𝚙 𝚘𝚗𝚕𝚢");
    try {
      const link = await sock.groupInviteCode(from);
      await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚒𝚗𝚟𝚒𝚝𝚎 』
┃ ┗ ✉️ https://chat.whatsapp.com/${link}
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);
    } catch { await reply("❌ 𝙸𝚖𝚙𝚘𝚜𝚜𝚒𝚋𝚕𝚎"); }
  }
};
