import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import axios from "axios";

export default {
  name: "url",
  description: "📤 𝙾𝚋𝚝𝚎𝚗𝚒𝚛 𝚕'𝚄𝚁𝙻 𝚍'𝚞𝚗 𝚖𝚎́𝚍𝚒𝚊",
  aliases: ["uploadurl", "geturl"],

  async execute(sock, message) {
    const { from, reply, quoted } = message;
    try {
      if (!quoted) return await reply("❌ 𝚁𝚎́𝚙𝚘𝚗𝚍𝚜 𝚊̀ 𝚞𝚗 𝚖𝚎́𝚍𝚒𝚊");
      const quotedMsg = quoted.message;
      let mediaType = null, mediaData = null;

      if (quotedMsg.imageMessage)    { mediaType = "image";    mediaData = quotedMsg.imageMessage; }
      else if (quotedMsg.videoMessage)    { mediaType = "video";    mediaData = quotedMsg.videoMessage; }
      else if (quotedMsg.audioMessage)    { mediaType = "audio";    mediaData = quotedMsg.audioMessage; }
      else if (quotedMsg.documentMessage) { mediaType = "document"; mediaData = quotedMsg.documentMessage; }

      if (!mediaType) return await reply("❌ 𝚃𝚢𝚙𝚎 𝚒𝚗𝚌𝚘𝚗𝚗𝚞");
      await reply("📤 𝙴𝚗𝚟𝚘𝚒...");
      const start = Date.now();

      const stream = await downloadContentFromMessage(mediaData, mediaType);
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);

      if (buffer.length > 200 * 1024 * 1024) return await reply("❌ 𝙵𝚒𝚌𝚑𝚒𝚎𝚛 𝚝𝚛𝚘𝚙 𝚐𝚛𝚘𝚜 (𝚖𝚊𝚡 𝟸𝟶𝟶𝙼𝙱)");

      const formData = new FormData();
      formData.append("reqtype", "fileupload");
      formData.append("fileToUpload", new Blob([buffer]), `upload_${Date.now()}`);

      const uploadResponse = await axios.post("https://catbox.moe/user/api.php", formData, { timeout: 60000 });
      const url = uploadResponse.data.trim();
      if (!url.startsWith("http")) throw new Error("Réponse invalide");

      const totalTime = Date.now() - start;
      const fileSize = (buffer.length / 1024 / 1024).toFixed(2);
      const indicator = totalTime <= 5000 ? "🟢" : totalTime <= 15000 ? "🟡" : "🔴";

      await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚞𝚛𝚕 』
┃ ┣ ${indicator} 🔗 ${url}
┃ ┣ 📁 𝚃𝚢𝚙𝚎 : ${mediaType}
┃ ┣ 📏 𝙿𝚘𝚒𝚍𝚜 : ${fileSize}𝙼𝙱
┃ ┗ ⏱️ ${totalTime}𝚖𝚜
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);
    } catch { await reply("❌ 𝙴𝚌𝚑𝚎𝚌 𝚍𝚎 𝚕'𝚎𝚗𝚟𝚘𝚒"); }
  }
};
