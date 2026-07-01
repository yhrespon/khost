export default {
  name: "unmute",
  description: "🔊 𝙳𝚎́𝚖𝚞𝚝𝚎𝚛 𝚕𝚎 𝚐𝚛𝚘𝚞𝚙𝚎",

  async execute(sock, message) {
    const { from, reply, isGroup } = message;
    if (!isGroup) return await reply("❌ 𝙶𝚛𝚘𝚞𝚙 𝚘𝚗𝚕𝚢");
    try {
      await sock.groupSettingUpdate(from, "not_announcement");
      await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚞𝚗𝚖𝚞𝚝𝚎 』
┃ ┗ 🔊 𝙶𝚛𝚘𝚞𝚙𝚎 𝚍𝚎́𝚖𝚞𝚝𝚎́ — 𝚝𝚘𝚞𝚜 𝚙𝚎𝚞𝚟𝚎𝚗𝚝 𝚎́𝚌𝚛𝚒𝚛𝚎
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);
    } catch { await reply("❌ 𝙸𝚖𝚙𝚘𝚜𝚜𝚒𝚋𝚕𝚎 𝚍𝚎 𝚍𝚎́𝚖𝚞𝚝𝚎𝚛"); }
  }
};
