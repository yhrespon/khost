import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
  name: "setpp",
  description: "🖼️ 𝙲𝚑𝚊𝚗𝚐𝚎𝚛 𝚕𝚊 𝚙𝚑𝚘𝚝𝚘 𝚍𝚞 𝚋𝚘𝚝",

  async execute(sock, message) {
    const { from, reply } = message;
    try {
      const quoted = message.quoted;
      if (!quoted) return await reply("❌ 𝚁𝚎́𝚙𝚘𝚗𝚍𝚜 𝚊̀ 𝚞𝚗𝚎 𝚒𝚖𝚊𝚐𝚎");
      if (!quoted.message?.imageMessage) return await reply("❌ 𝙻𝚎 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚍𝚘𝚒𝚝 𝚎̂𝚝𝚛𝚎 𝚞𝚗𝚎 𝚒𝚖𝚊𝚐𝚎");

      await reply("🔄 𝙼𝚒𝚜𝚎 𝚊̀ 𝚓𝚘𝚞𝚛...");
      const stream = await downloadContentFromMessage(quoted.message.imageMessage, "image");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      await sock.updateProfilePicture(sock.user.id, buffer);

      await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚜𝚎𝚝𝚙𝚙 』
┃ ┗ ✅ 𝙿𝚑𝚘𝚝𝚘 𝚖𝚒𝚜𝚎 𝚊̀ 𝚓𝚘𝚞𝚛
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);
    } catch (error) { await reply("❌ 𝙴𝚌𝚑𝚎𝚌 : " + error.message); }
  }
};
