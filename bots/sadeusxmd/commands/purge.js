export default {
  name: "purge",
  description: "𝚁𝚎𝚝𝚒𝚛𝚎𝚛 𝚝𝚘𝚞𝚜 𝚕𝚎𝚜 𝚗𝚘𝚗-𝚊𝚍𝚖𝚒𝚗𝚜",

  async execute(sock, message) {
    const { from, reply } = message;
    try {
      if (!from.endsWith("@g.us")) return;

      const groupData = await sock.groupMetadata(from);
      const toRemove = groupData.participants.filter(p => !p.admin).map(p => p.id);

      if (toRemove.length === 0) return await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚙𝚞𝚛𝚐𝚎 』
┃ ┗ ℹ️ 𝙰𝚞𝚌𝚞𝚗 𝚗𝚘𝚗-𝚊𝚍𝚖𝚒𝚗
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);

      await reply(`🚫 𝙿𝚞𝚛𝚐𝚎 𝚍𝚎 ${toRemove.length} 𝚖𝚎𝚖𝚋𝚛𝚎(𝚜)...`);

      for (let i = 0; i < toRemove.length; i += 3) {
        const batch = toRemove.slice(i, i + 3);
        await sock.groupParticipantsUpdate(from, batch, "remove");
        if (i + 3 < toRemove.length) await new Promise(r => setTimeout(r, 1000));
      }

      await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚙𝚞𝚛𝚐𝚎 』
┃ ┗ ✅ ${toRemove.length} 𝚖𝚎𝚖𝚋𝚛𝚎(𝚜) 𝚛𝚎𝚝𝚒𝚛𝚎́(𝚜)
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);
    } catch { await reply("❌"); }
  }
};
