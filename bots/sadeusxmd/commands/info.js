export default {
  name: "info",
  description: "𝙸𝚗𝚏𝚘𝚜 𝚋𝚘𝚝",
  async execute(sock, ctx) {
    const isGroup = ctx.isGroup ? "𝙾𝚞𝚒" : "𝙽𝚘𝚗";
    await ctx.reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚒𝚗𝚏𝚘 』
┃ ┣ ➢ 𝙽𝚞𝚖𝚎́𝚛𝚘 : ${ctx.from}
┃ ┗ ➢ 𝙶𝚛𝚘𝚞𝚙𝚎 : ${isGroup}
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);
  }
};
