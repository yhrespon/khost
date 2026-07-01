import fetch from "node-fetch";

export default {
  name: "image",
  description: "🔍 𝚁𝚎𝚌𝚑𝚎𝚛𝚌𝚑𝚎 𝚍'𝚒𝚖𝚊𝚐𝚎𝚜",
  aliases: ["img", "searchimg", "pic"],

  async execute(sock, message) {
    const { from, reply, args } = message;
    try {
      const query = args.join(" ").trim();
      if (!query) return await reply("❌ 𝚄𝚜𝚊𝚐𝚎 : .𝚒𝚖𝚊𝚐𝚎 <𝚛𝚎𝚌𝚑𝚎𝚛𝚌𝚑𝚎>");

      await reply("🔍 𝚁𝚎𝚌𝚑𝚎𝚛𝚌𝚑𝚎 𝚎𝚗 𝚌𝚘𝚞𝚛𝚜...");
      const start = Date.now();

      const words = query.split(" ");
      const lastWord = words[words.length - 1];
      const count = parseInt(lastWord) || 5;
      const searchQuery = parseInt(lastWord) ? words.slice(0, -1).join(" ") : query;
      const imageCount = Math.min(Math.max(count, 1), 10);

      const res = await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(searchQuery)}&form=HDRSC2`, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const html = await res.text();
      const searchTime = Date.now() - start;

      const urlPattern = /murl&quot;:&quot;(.*?)&quot;/g;
      const matches = []; let match;
      while ((match = urlPattern.exec(html)) !== null) matches.push(match[1]);
      const imageUrls = matches.filter(u => u.startsWith("http")).slice(0, imageCount);

      if (!imageUrls.length) return await reply("❌ 𝙰𝚞𝚌𝚞𝚗𝚎 𝚒𝚖𝚊𝚐𝚎 𝚝𝚛𝚘𝚞𝚟𝚎́𝚎");

      const indicator = searchTime <= 3000 ? "🟢" : searchTime <= 7000 ? "🟡" : "🔴";
      await reply(`${indicator} ${imageUrls.length} 𝚒𝚖𝚊𝚐𝚎(𝚜) 𝚝𝚛𝚘𝚞𝚟𝚎́𝚎(𝚜) — ⚡ ${searchTime}𝚖𝚜\n⏳ 𝙴𝚗𝚟𝚘𝚒...`);

      let sentCount = 0, failCount = 0;
      for (let i = 0; i < imageUrls.length; i++) {
        try {
          const imgRes = await fetch(imageUrls[i], { timeout: 10000 });
          const buffer = await imgRes.buffer();
          if (buffer.length < 1024) { failCount++; continue; }
          await sock.sendMessage(from, { image: buffer, caption: `📸 ${searchQuery} (${sentCount+1}/${imageUrls.length})` });
          sentCount++;
          if (i < imageUrls.length - 1) await new Promise(r => setTimeout(r, 1000));
        } catch { failCount++; }
      }

      const totalTime = Date.now() - start;
      await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚒𝚖𝚊𝚐𝚎 』
┃ ┣ 🔍 ${searchQuery}
┃ ┣ ✅ 𝙴𝚗𝚟𝚘𝚢𝚎́𝚎𝚜 : ${sentCount}
┃ ┣ ❌ 𝙴𝚌𝚑𝚎𝚌𝚜 : ${failCount}
┃ ┗ ⏱️ ${totalTime}𝚖𝚜
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);
    } catch { await reply("❌ 𝙴𝚛𝚛𝚎𝚞𝚛"); }
  }
};
