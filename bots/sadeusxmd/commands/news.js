import axios from "axios";

export default {
  name: "news",
  description: "📰 𝙰𝚌𝚝𝚞𝚊𝚕𝚒𝚝𝚎́𝚜",
  aliases: ["headlines", "latestnews"],

  async execute(sock, message) {
    const { from, reply } = message;
    try {
      const apiKey = "dcd720a6f1914e2d9dba9790c188c08c";
      await reply("📰 𝙲𝚑𝚊𝚛𝚐𝚎𝚖𝚎𝚗𝚝...");

      const { data } = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`);
      const articles = data.articles?.slice(0, 5) || [];
      if (!articles.length) return await reply("❌ 𝙰𝚞𝚌𝚞𝚗𝚎 𝚊𝚌𝚝𝚞");

      let text = `╭━━━━━━━━━━━━━━━╮\n   🐍 SADEUS XMD V1🐍\n╰━━━━━━━━━━━━━━━╯\n╭━━━━━━━━━━━━━━━╮\n┃ ⛩️ 『 𝚗𝚎𝚠𝚜 』\n`;
      articles.forEach((a, i) => {
        const isLast = i === articles.length - 1;
        const short = a.description ? (a.description.length > 80 ? a.description.substring(0,80)+"..." : a.description) : "";
        text += `┃ ${isLast?"┗":"┣"} ➢ *${i+1}. ${a.title || "?"}*\n`;
        if (short) text += `┃     📝 ${short}\n`;
      });
      text += `┣━━━━━━━━━━━━━━━┫\n┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs\n╰━━━━━━━━━━━━━━━╯`;

      await sock.sendMessage(from, { text });
    } catch { await reply("❌ 𝙴𝚛𝚛𝚎𝚞𝚛"); }
  }
};
