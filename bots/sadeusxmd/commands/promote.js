export default {
  name: "promote",
  description: "𝙿𝚛𝚘𝚖𝚘𝚞𝚟𝚘𝚒𝚛 𝚎𝚗 𝚊𝚍𝚖𝚒𝚗",

  async execute(sock, message, args) {
    const { from, reply, isGroup, sender, raw } = message;
    if (!isGroup) return await reply("❌ 𝙶𝚛𝚘𝚞𝚙 𝚘𝚗𝚕𝚢");
    try {
      const mentioned = raw.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      const quotedUser = raw.message?.extendedTextMessage?.contextInfo?.participant;
      let targets = [...mentioned];
      if (quotedUser && !targets.includes(quotedUser)) targets.push(quotedUser);
      if (targets.length === 0 && args[0]) {
        const num = args[0].replace(/[^0-9]/g, "");
        if (num.length < 8) return await reply("❌ 𝙽𝚞𝚖𝚎́𝚛𝚘 𝚒𝚗𝚟𝚊𝚕𝚒𝚍𝚎");
        targets.push(`${num}@s.whatsapp.net`);
      }
      if (targets.length === 0) return await reply("⚠️ 𝙼𝚎𝚗𝚝𝚒𝚘𝚗𝚗𝚎 𝚘𝚞 𝚛𝚎́𝚙𝚘𝚗𝚍𝚜 𝚊̀ 𝚞𝚗 𝚖𝚎𝚜𝚜𝚊𝚐𝚎");

      await sock.groupParticipantsUpdate(from, targets, "promote");
      await sock.sendMessage(from, { react: { text: "🆙", key: raw.key } });

      const names = targets.map(t => `@${t.split("@")[0]}`).join(", ");
      await sock.sendMessage(from, {
        text:
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚙𝚛𝚘𝚖𝚘𝚝𝚎 』
┃ ┣ ✅ 𝙿𝚛𝚘𝚖𝚞 : ${names}
┃ ┗ 👤 𝙿𝚊𝚛 : ${sender}
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`,
        mentions: targets
      });
    } catch { await reply("❌ 𝙸𝚖𝚙𝚘𝚜𝚜𝚒𝚋𝚕𝚎. 𝚅𝚎́𝚛𝚒𝚏𝚒𝚎 𝚖𝚎𝚜 𝚙𝚎𝚛𝚖𝚒𝚜𝚜𝚒𝚘𝚗𝚜."); }
  }
};
