export default {
  name: "ginfo",
  description: "ℹ️ 𝙸𝚗𝚏𝚘𝚜 𝚍𝚞 𝚐𝚛𝚘𝚞𝚙𝚎",

  async execute(sock, message) {
    const { from, reply, isGroup } = message;
    if (!isGroup) return await reply("❌ 𝙶𝚛𝚘𝚞𝚙 𝚘𝚗𝚕𝚢");
    try {
      const group = await sock.groupMetadata(from);
      const desc = group.desc || "❌ 𝙰𝚞𝚌𝚞𝚗𝚎 𝚍𝚎𝚜𝚌𝚛𝚒𝚙𝚝𝚒𝚘𝚗";
      let ppUrl;
      try { ppUrl = await sock.profilePictureUrl(from, "image"); } catch { ppUrl = null; }

      const text =
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚐𝚒𝚗𝚏𝚘 』
┃ ┣ 📄 𝙳𝚎𝚜𝚌 : ${desc}
┃ ┗ 👥 𝙼𝚎𝚖𝚋𝚛𝚎𝚜 : ${group.participants.length}
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`;

      if (ppUrl) await sock.sendMessage(from, { image: { url: ppUrl }, caption: text });
      else await reply(text);
    } catch { await reply("❌ 𝙸𝚖𝚙𝚘𝚜𝚜𝚒𝚋𝚕𝚎 𝚍𝚎 𝚛𝚎́𝚌𝚞𝚙𝚎́𝚛𝚎𝚛 𝚕𝚎𝚜 𝚒𝚗𝚏𝚘𝚜"); }
  }
};
