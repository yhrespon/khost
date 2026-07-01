export default {
  name: "tagall",
  description: "𝙼𝚎𝚗𝚝𝚒𝚘𝚗𝚗𝚎𝚛 𝚝𝚘𝚞𝚜 𝚕𝚎𝚜 𝚖𝚎𝚖𝚋𝚛𝚎𝚜",

  async execute(sock, message) {
    const { from, reply } = message;
    try {
      if (!from.endsWith("@g.us")) return await reply("❌ 𝙶𝚛𝚘𝚞𝚙 𝚘𝚗𝚕𝚢");

      const start = Date.now();
      const groupMetadata = await sock.groupMetadata(from);
      const participants = groupMetadata.participants || [];
      const mentions = participants.map(p => p.id);
      const latency = Date.now() - start;

      const maxDisplay = 15;
      let membersList = participants.slice(0, maxDisplay)
        .map((p, i) => `┃ ┣ ➢ @${p.id.split("@")[0]}`).join("\n");
      if (participants.length > maxDisplay)
        membersList += `\n┃ ┗ ➢ ... 𝚎𝚝 ${participants.length - maxDisplay} 𝚊𝚞𝚝𝚛𝚎𝚜`;

      await sock.sendMessage(from, {
        text:
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚝𝚊𝚐𝚊𝚕𝚕 』
┃ ┣ 👥 𝙼𝚎𝚖𝚋𝚛𝚎𝚜 : ${participants.length}
┃ ┣ ⚡ 𝚃𝚎𝚖𝚙𝚜 : ${latency}𝚖𝚜
${membersList}
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`,
        mentions
      });
    } catch { await reply("❌ 𝙴𝚛𝚛𝚎𝚞𝚛"); }
  }
};
