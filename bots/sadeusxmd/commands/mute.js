export default {
  name: "mute",
  description: "🔇 𝙼𝚞𝚝𝚎𝚛 𝚕𝚎 𝚐𝚛𝚘𝚞𝚙𝚎",

  async execute(sock, message) {
    const { from, reply, isGroup } = message;
    if (!isGroup) return await reply("❌ 𝙶𝚛𝚘𝚞𝚙 𝚘𝚗𝚕𝚢");
    try {
      await sock.groupSettingUpdate(from, "announcement");
      await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚖𝚞𝚝𝚎 』
┃ ┗ 🔇 𝙶𝚛𝚘𝚞𝚙𝚎 𝚖𝚞𝚝𝚎́ — 𝚊𝚍𝚖𝚒𝚗𝚜 𝚜𝚎𝚞𝚕𝚎𝚖𝚎𝚗𝚝
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);
    } catch { await reply("❌ 𝙸𝚖𝚙𝚘𝚜𝚜𝚒𝚋𝚕𝚎 𝚍𝚎 𝚖𝚞𝚝𝚎𝚛"); }
  }
};
