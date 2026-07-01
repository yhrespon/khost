import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
  name: "sticker",
  description: "🎨 𝙸𝚖𝚊𝚐𝚎 → 𝚜𝚝𝚒𝚌𝚔𝚎𝚛",

  async execute(sock, message) {
    const { from, reply } = message;
    try {
      const quoted = message.quoted;
      if (!quoted) return await reply("❌ 𝚁𝚎́𝚙𝚘𝚗𝚍𝚜 𝚊̀ 𝚞𝚗𝚎 𝚒𝚖𝚊𝚐𝚎");
      if (!quoted.message?.imageMessage) return await reply("❌ 𝙻𝚎 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚍𝚘𝚒𝚝 𝚎̂𝚝𝚛𝚎 𝚞𝚗𝚎 𝚒𝚖𝚊𝚐𝚎");

      await reply("🎨 𝙲𝚛𝚎́𝚊𝚝𝚒𝚘𝚗 𝚎𝚗 𝚌𝚘𝚞𝚛𝚜...");
      const stream = await downloadContentFromMessage(quoted.message.imageMessage, "image");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      await sock.sendMessage(from, { sticker: buffer });
    } catch (error) { await reply("❌ 𝙴𝚛𝚛𝚎𝚞𝚛 : " + error.message); }
  }
};
