export default {
  name: "tag",
  description: "𝙼𝚎𝚗𝚝𝚒𝚘𝚗𝚗𝚎𝚛 𝚝𝚘𝚞𝚜 (𝚜𝚒𝚕𝚎𝚗𝚌𝚒𝚎𝚞𝚡)",

  async execute(sock, message) {
    const { from, reply } = message;
    try {
      if (!from.endsWith("@g.us")) return;
      const groupMetadata = await sock.groupMetadata(from);
      const mentions = groupMetadata.participants.map(p => p.id);

      await sock.sendMessage(from, {
        text:
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚝𝚊𝚐 』
┃ ┗ 📢 ${mentions.length} 𝚖𝚎𝚖𝚋𝚛𝚎(𝚜) 𝚝𝚊𝚐𝚐𝚎́(𝚜)
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`,
        mentions
      });
    } catch { await reply("❌"); }
  }
};
