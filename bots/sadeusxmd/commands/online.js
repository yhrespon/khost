export default {
  name: "online",
  description: "𝙻𝚒𝚜𝚝𝚎 𝚍𝚎𝚜 𝚖𝚎𝚖𝚋𝚛𝚎𝚜",
  aliases: ["listonline", "whosonline"],

  async execute(sock, message) {
    const { from, reply } = message;
    try {
      if (!from.endsWith("@g.us")) return await reply("❌ 𝙶𝚛𝚘𝚞𝚙 𝚘𝚗𝚕𝚢");

      const start = Date.now();
      const groupMetadata = await sock.groupMetadata(from);
      const participants = groupMetadata.participants || [];
      const latency = Date.now() - start;
      const mentions = participants.map(p => p.id);
      const maxDisplay = 20;

      let memberList = participants.slice(0, maxDisplay)
        .map((p, i) => `┃ ┣ ➢ @${p.id.split("@")[0]}`).join("\n");
      if (participants.length > maxDisplay)
        memberList += `\n┃ ┗ ➢ ... 𝚎𝚝 ${participants.length - maxDisplay} 𝚊𝚞𝚝𝚛𝚎𝚜`;

      await sock.sendMessage(from, {
        text:
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚘𝚗𝚕𝚒𝚗𝚎 』
┃ ┣ 👥 𝚃𝚘𝚝𝚊𝚕 : ${participants.length}
┃ ┣ ⚡ 𝚃𝚎𝚖𝚙𝚜 : ${latency}𝚖𝚜
${memberList}
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`,
        mentions
      });
    } catch { await reply("❌ 𝙴𝚛𝚛𝚎𝚞𝚛"); }
  }
};
