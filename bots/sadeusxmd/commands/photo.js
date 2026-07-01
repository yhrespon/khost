import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
  name: "photo",
  description: "🖼️ 𝚂𝚝𝚒𝚌𝚔𝚎𝚛 → 𝚒𝚖𝚊𝚐𝚎",

  async execute(sock, message) {
    const { from, reply } = message;
    try {
      if (!message.quoted?.message?.stickerMessage) return await reply("❌ 𝚁𝚎́𝚙𝚘𝚗𝚍𝚜 𝚊̀ 𝚞𝚗 𝚜𝚝𝚒𝚌𝚔𝚎𝚛");
      const stream = await downloadContentFromMessage(message.quoted.message.stickerMessage, "sticker");
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      await sock.sendMessage(from, { image: Buffer.concat(chunks) });
    } catch { await reply("❌"); }
  }
};
