import axios from "axios";

export default {
  name: "down-url",
  description: "📥 𝚃𝚎́𝚕𝚎́𝚌𝚑𝚊𝚛𝚐𝚎𝚛 𝚍𝚎𝚙𝚞𝚒𝚜 𝚄𝚁𝙻",

  async execute(sock, message) {
    const { from, reply, args } = message;
    try {
      const url = args[0] || "";
      if (!url) return await reply("❌ 𝚄𝚜𝚊𝚐𝚎 : .𝚍𝚘𝚠𝚗-𝚞𝚛𝚕 <𝚞𝚛𝚕>");
      await reply("📥 𝚃𝚎́𝚕𝚎́𝚌𝚑𝚊𝚛𝚐𝚎𝚖𝚎𝚗𝚝...");
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data);
      const contentType = response.headers["content-type"] || "";

      if (contentType.startsWith("image/")) await sock.sendMessage(from, { image: buffer });
      else if (contentType.startsWith("video/")) await sock.sendMessage(from, { video: buffer });
      else await sock.sendMessage(from, { document: buffer, fileName: url.split("/").pop() || "file.bin" });
    } catch { await reply("❌ 𝙴𝚌𝚑𝚎𝚌"); }
  }
};
