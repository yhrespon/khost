export default {
  name: "kick",
  description: "𝙺𝚒𝚌𝚔 𝚞𝚜𝚎𝚛 𝚏𝚛𝚘𝚖 𝚐𝚛𝚘𝚞𝚙",

  async execute(sock, message, args) {
    const { from, reply, isGroup, sender, raw } = message;
    if (!isGroup) return await reply("❌ 𝙶𝚛𝚘𝚞𝚙 𝚘𝚗𝚕𝚢");

    try {
      const mentioned = raw.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      const quotedUser = raw.message?.extendedTextMessage?.contextInfo?.participant;

      let targets = [...mentioned];
      if (quotedUser && !targets.includes(quotedUser)) targets.push(quotedUser);

      if (targets.length === 0 && args[0]) {
        const phoneNumber = args[0].replace(/[^0-9]/g, "");
        if (phoneNumber.length < 8) return await reply("❌ 𝙸𝚗𝚟𝚊𝚕𝚒𝚍 𝚗𝚞𝚖𝚋𝚎𝚛");
        targets.push(`${phoneNumber}@s.whatsapp.net`);
      }

      if (targets.length === 0) return await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚔𝚒𝚌𝚔 』
┃ ┗ ⚠️ 𝙼𝚎𝚗𝚝𝚒𝚘𝚗𝚗𝚎 𝚘𝚞 𝚛𝚎́𝚙𝚘𝚗𝚍𝚜
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);

      await sock.groupParticipantsUpdate(from, targets, "remove");
      await sock.sendMessage(from, { react: { text: "👋", key: raw.key } });

      const names = targets.map(t => `@${t.split("@")[0]}`).join(", ");
      await sock.sendMessage(from, {
        text:
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚔𝚒𝚌𝚔 』
┃ ┣ ✅ 𝙺𝚒𝚌𝚔𝚎́(𝚜) : ${names}
┃ ┗ 👤 𝙿𝚊𝚛 : ${sender}
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`,
        mentions: targets
      });
    } catch (err) {
      console.error("Kick error:", err);
      await reply("❌ 𝙸𝚖𝚙𝚘𝚜𝚜𝚒𝚋𝚕𝚎 𝚍𝚎 𝚔𝚒𝚌𝚔𝚎𝚛. 𝚅𝚎́𝚛𝚒𝚏𝚒𝚎 𝚖𝚎𝚜 𝚙𝚎𝚛𝚖𝚒𝚜𝚜𝚒𝚘𝚗𝚜.");
    }
  }
};
