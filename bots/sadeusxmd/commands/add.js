export default {
  name: "add",
  description: "𝙰𝚓𝚘𝚞𝚝𝚎𝚛 𝚞𝚗 𝚞𝚝𝚒𝚕𝚒𝚜𝚊𝚝𝚎𝚞𝚛",
  aliases: ["invite", "adduser"],

  async execute(sock, message) {
    const { from, reply } = message;
    try {
      if (!from.endsWith("@g.us")) return await reply("❌ 𝙶𝚛𝚘𝚞𝚙 𝚘𝚗𝚕𝚢");
      const args = message.args || [];
      const phoneNumber = args[0] || "";
      if (!phoneNumber) return await reply("❌ 𝚄𝚜𝚊𝚐𝚎 : .𝚊𝚍𝚍 <𝚗𝚞𝚖𝚎́𝚛𝚘>");

      let clean = phoneNumber.replace(/[^0-9]/g, "");
      if (!clean) return await reply("❌ 𝙽𝚞𝚖𝚎́𝚛𝚘 𝚒𝚗𝚟𝚊𝚕𝚒𝚍𝚎");
      if (!clean.endsWith("@s.whatsapp.net")) clean += "@s.whatsapp.net";

      await reply("🔄 𝙰𝚓𝚘𝚞𝚝 𝚎𝚗 𝚌𝚘𝚞𝚛𝚜...");
      await sock.groupParticipantsUpdate(from, [clean], "add");

      await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚊𝚍𝚍 』
┃ ┗ ✅ ${phoneNumber} 𝚊𝚓𝚘𝚞𝚝𝚎́
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);
    } catch (error) {
      if (error.message?.includes("401")) await reply("❌ 𝙱𝚘𝚝 𝚍𝚘𝚒𝚝 𝚎̂𝚝𝚛𝚎 𝚊𝚍𝚖𝚒𝚗");
      else if (error.message?.includes("403")) await reply("❌ 𝙻'𝚞𝚝𝚒𝚕𝚒𝚜𝚊𝚝𝚎𝚞𝚛 𝚊 𝚋𝚕𝚘𝚚𝚞𝚎́ 𝚕𝚎 𝚋𝚘𝚝");
      else if (error.message?.includes("404")) await reply("❌ 𝚄𝚝𝚒𝚕𝚒𝚜𝚊𝚝𝚎𝚞𝚛 𝚒𝚗𝚝𝚛𝚘𝚞𝚟𝚊𝚋𝚕𝚎");
      else await reply("❌ 𝙸𝚖𝚙𝚘𝚜𝚜𝚒𝚋𝚕𝚎 𝚍'𝚊𝚓𝚘𝚞𝚝𝚎𝚛");
    }
  }
};
