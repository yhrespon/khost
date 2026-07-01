export default {
  name: "tagadmin",
  description: "𝚃𝚊𝚐 𝚊𝚍𝚖𝚒𝚗𝚜 𝚍𝚞 𝚐𝚛𝚘𝚞𝚙𝚎",
  aliases: ["admin", "admintag", "mentionadmin"],

  async execute(sock, message) {
    const { from, reply } = message;
    try {
      if (!from.endsWith("@g.us")) return await reply("❌ 𝙶𝚛𝚘𝚞𝚙 𝚘𝚗𝚕𝚢");

      const start = Date.now();
      const groupMetadata = await sock.groupMetadata(from);
      const admins = groupMetadata.participants.filter(p => p.admin);
      const latency = Date.now() - start;

      if (admins.length === 0) return await reply("❌ 𝙰𝚞𝚌𝚞𝚗 𝚊𝚍𝚖𝚒𝚗");

      const mentions = admins.map(p => p.id);
      let adminList = admins.map((a, i) =>
        `┃ ${i === admins.length-1 ? "┗" : "┣"} ➢ 👑 @${a.id.split("@")[0]}`
      ).join("\n");

      let indicator = latency <= 300 ? "🟢" : latency <= 800 ? "🟡" : "🔴";

      await sock.sendMessage(from, {
        text:
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚝𝚊𝚐𝚊𝚍𝚖𝚒𝚗 』
┃ ┣ ${indicator} 𝙰𝚍𝚖𝚒𝚗𝚜 : ${admins.length} / ${groupMetadata.participants.length}
┃ ┣ ⚡ 𝚃𝚎𝚖𝚙𝚜 : ${latency}𝚖𝚜
${adminList}
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`,
        mentions
      });
    } catch { await reply("❌ 𝙴𝚛𝚛𝚎𝚞𝚛"); }
  }
};
