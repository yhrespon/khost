export default {
  name: "link",
  description: "🔗 𝙻𝚒𝚎𝚗 𝚍'𝚒𝚗𝚟𝚒𝚝𝚊𝚝𝚒𝚘𝚗",

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
┃ ⛩️ 『 𝚕𝚒𝚗𝚔 』
┃ ┗ 🔗 https://chat.whatsapp.com/${link}
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);
    } catch { await reply("❌ 𝙸𝚖𝚙𝚘𝚜𝚜𝚒𝚋𝚕𝚎"); }
  }
};
