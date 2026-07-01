import axios from "axios";

export default {
  name: "play",
  description: "🎵 𝚃𝚎́𝚕𝚎́𝚌𝚑𝚊𝚛𝚐𝚎𝚛 𝚞𝚗𝚎 𝚖𝚞𝚜𝚒𝚚𝚞𝚎",
  aliases: ["song", "music", "mp3"],

  async execute(sock, message) {
    const { from, reply, args } = message;
    try {
      const query = args.join(" ");
      if (!query) return await reply("❌ 𝚄𝚜𝚊𝚐𝚎 : .𝚙𝚕𝚊𝚢 <𝚝𝚒𝚝𝚛𝚎>");

      const start = Date.now();
      await reply(`🔍 𝚁𝚎𝚌𝚑𝚎𝚛𝚌𝚑𝚎 : *${query}*`);

      const { data } = await axios.get(`https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(query)}`, { timeout: 30000 });
      if (!data?.status || !data?.result?.download_url) return await reply("❌ 𝙰𝚞𝚌𝚞𝚗 𝚛𝚎́𝚜𝚞𝚕𝚝𝚊𝚝");

      const video = data.result;
      const searchTime = Date.now() - start;

      await sock.sendMessage(from, {
        image: { url: video.thumbnail || "" },
        caption:
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚙𝚕𝚊𝚢 』
┃ ┣ 🎵 ${video.title || "Inconnu"}
┃ ┣ ⏱️ ${video.duration || "?"}
┃ ┗ ⚡ ${searchTime}𝚖𝚜
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`
      });

      await sock.sendMessage(from, { audio: { url: video.download_url }, mimetype: "audio/mp4", ptt: false });
    } catch (error) {
      if (error.code === "ECONNABORTED") await reply("❌ 𝚃𝚒𝚖𝚎𝚘𝚞𝚝");
      else await reply("❌ 𝙴𝚌𝚑𝚎𝚌 𝚍𝚞 𝚝𝚎́𝚕𝚎́𝚌𝚑𝚊𝚛𝚐𝚎𝚖𝚎𝚗𝚝");
    }
  }
};
