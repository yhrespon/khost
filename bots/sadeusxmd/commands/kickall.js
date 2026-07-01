export default {
  name: "kickall",
  description: "🦵 𝙺𝚒𝚌𝚔 𝚝𝚘𝚞𝚜 𝚕𝚎𝚜 𝚖𝚎𝚖𝚋𝚛𝚎𝚜",

  async execute(sock, message) {
    const { from, reply, isGroup } = message;
    const delay = ms => new Promise(r => setTimeout(r, ms));
    if (!isGroup) return await reply("❌ 𝙶𝚛𝚘𝚞𝚙 𝚘𝚗𝚕𝚢");

    const groupMetadata = await sock.groupMetadata(from);
    const botJid = sock.user.id;
    const ownerJid = groupMetadata.owner;

    const targets = groupMetadata.participants
      .map(p => p.id)
      .filter(jid => jid !== botJid && jid !== ownerJid);

    if (!targets.length) return await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚔𝚒𝚌𝚔𝚊𝚕𝚕 』
┃ ┗ ℹ️ 𝙿𝚎𝚛𝚜𝚘𝚗𝚗𝚎 𝚊̀ 𝚔𝚒𝚌𝚔𝚎𝚛
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);

    for (const jid of targets) {
      try { await sock.groupParticipantsUpdate(from, [jid], "remove"); } catch {}
      await delay(3000);
    }

    await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚔𝚒𝚌𝚔𝚊𝚕𝚕 』
┃ ┗ ✅ ${targets.length} 𝚖𝚎𝚖𝚋𝚛𝚎(𝚜) 𝚔𝚒𝚌𝚔𝚎́(𝚜)
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);
  }
};
