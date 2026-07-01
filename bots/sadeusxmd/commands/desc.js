export default {
  name: "desc",
  description: "📝 𝙼𝚘𝚍𝚒𝚏𝚒𝚎𝚛 𝚕𝚊 𝚍𝚎𝚜𝚌𝚛𝚒𝚙𝚝𝚒𝚘𝚗",

  async execute(sock, message, args) {
    const { from, reply, isGroup } = message;
    if (!isGroup) return await reply("❌ 𝙶𝚛𝚘𝚞𝚙 𝚘𝚗𝚕𝚢");
    const newDesc = args.join(" ");
    if (!newDesc) return await reply("📝 𝚄𝚜𝚊𝚐𝚎 : .𝚍𝚎𝚜𝚌 <𝚗𝚘𝚞𝚟𝚎𝚕𝚕𝚎 𝚍𝚎𝚜𝚌𝚛𝚒𝚙𝚝𝚒𝚘𝚗>");
    try {
      await sock.groupUpdateDescription(from, newDesc);
      await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚍𝚎𝚜𝚌 』
┃ ┗ ✅ 𝙳𝚎𝚜𝚌𝚛𝚒𝚙𝚝𝚒𝚘𝚗 𝚖𝚒𝚜𝚎 𝚊̀ 𝚓𝚘𝚞𝚛
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);
    } catch { await reply("❌ 𝙸𝚖𝚙𝚘𝚜𝚜𝚒𝚋𝚕𝚎 𝚍𝚎 𝚖𝚘𝚍𝚒𝚏𝚒𝚎𝚛"); }
  }
};
