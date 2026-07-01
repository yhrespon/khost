export default {
  name: "demoteall",
  description: "𝚁𝚎́𝚝𝚛𝚘𝚐𝚛𝚊𝚍𝚎𝚛 𝚝𝚘𝚞𝚜 𝚕𝚎𝚜 𝚊𝚍𝚖𝚒𝚗𝚜",

  async execute(sock, message) {
    const { from, reply, raw, sender } = message;
    try {
      const groupMeta = await sock.groupMetadata(from);
      const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
      const owners = global.owners || [];
      const sudoList = (global.bots?.get(botJid)?.config?.sudoList || []).map(n => n.split("@")[0]);

      const toDemote = groupMeta.participants
        .filter(p => p.admin && p.id !== botJid && !owners.includes(p.id.split("@")[0]) && !sudoList.includes(p.id.split("@")[0]))
        .map(p => p.id);

      if (toDemote.length === 0) return await reply("⚠️ 𝙰𝚞𝚌𝚞𝚗 𝚊𝚍𝚖𝚒𝚗 𝚊̀ 𝚛𝚎́𝚝𝚛𝚘𝚐𝚛𝚊𝚍𝚎𝚛");

      await sock.groupParticipantsUpdate(from, toDemote, "demote");
      await sock.sendMessage(from, { react: { text: "⬇️", key: raw.key } });

      const names = toDemote.map(t => `@${t.split("@")[0]}`).join(", ");
      await sock.sendMessage(from, {
        text:
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚍𝚎𝚖𝚘𝚝𝚎𝚊𝚕𝚕 』
┃ ┣ ✅ 𝚁𝚎́𝚝𝚛𝚘𝚐𝚛𝚊𝚍𝚎́𝚜 : ${names}
┃ ┗ 👤 𝙿𝚊𝚛 : ${sender}
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`,
        mentions: toDemote
      });
    } catch { await reply("❌ 𝙴𝚛𝚛𝚎𝚞𝚛"); }
  }
};
