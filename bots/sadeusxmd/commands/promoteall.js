export default {
  name: "promoteall",
  description: "📈 𝙿𝚛𝚘𝚖𝚘𝚞𝚟𝚘𝚒𝚛 𝚝𝚘𝚞𝚜 𝚕𝚎𝚜 𝚖𝚎𝚖𝚋𝚛𝚎𝚜",

  async execute(sock, message) {
    const { from, reply, isGroup } = message;
    if (!isGroup) return await reply("❌ 𝙶𝚛𝚘𝚞𝚙 𝚘𝚗𝚕𝚢");
    try {
      const group = await sock.groupMetadata(from);
      const botId = sock.user?.id.split(":")[0] + "@s.whatsapp.net";
      const membersToPromote = group.participants.map(p => p.id).filter(id => id !== botId && id !== group.owner);
      if (!membersToPromote.length) return await reply("ℹ️ 𝙰𝚞𝚌𝚞𝚗 𝚖𝚎𝚖𝚋𝚛𝚎 𝚊̀ 𝚙𝚛𝚘𝚖𝚘𝚞𝚟𝚘𝚒𝚛");

      for (const m of membersToPromote) await sock.groupParticipantsUpdate(from, [m], "promote");

      await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚙𝚛𝚘𝚖𝚘𝚝𝚎𝚊𝚕𝚕 』
┃ ┣ ✅ ${membersToPromote.length} 𝚖𝚎𝚖𝚋𝚛𝚎(𝚜) 𝚙𝚛𝚘𝚖𝚞(𝚜)
┃ ┗ 🚫 𝙱𝚘𝚝 & 𝚙𝚛𝚘𝚙𝚛𝚒𝚎́𝚝𝚊𝚒𝚛𝚎 𝚎𝚡𝚌𝚕𝚞𝚜
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);
    } catch { await reply("❌ 𝙸𝚖𝚙𝚘𝚜𝚜𝚒𝚋𝚕𝚎"); }
  }
};
