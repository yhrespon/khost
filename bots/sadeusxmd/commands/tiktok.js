export default {
  name: "tiktok",
  description: "📱 𝚃𝚎́𝚕𝚎́𝚌𝚑𝚊𝚛𝚐𝚎𝚛 𝚃𝚒𝚔𝚃𝚘𝚔",
  aliases: ["tt", "tiktokdl"],

  async execute(sock, message) {
    const { from, reply } = message;
    try {
      const args = message.args || [];
      const tiktokUrl = (args.join(" ") || message.text?.replace(/^\.\w+\s*/, "") || "").trim();

      if (!tiktokUrl) return await reply("❌ 𝚄𝚜𝚊𝚐𝚎 : .𝚝𝚒𝚔𝚝𝚘𝚔 <𝚕𝚒𝚎𝚗>");
      if (!tiktokUrl.includes("tiktok.com")) return await reply("❌ 𝙻𝚒𝚎𝚗 𝚒𝚗𝚟𝚊𝚕𝚒𝚍𝚎");

      await reply("⏳ 𝚃𝚎́𝚕𝚎́𝚌𝚑𝚊𝚛𝚐𝚎𝚖𝚎𝚗𝚝...");

      const res = await fetch(`https://delirius-apiofc.vercel.app/download/tiktok?url=${encodeURIComponent(tiktokUrl)}`);
      const data = await res.json();
      if (!data?.status || !data?.data) return await reply("❌ 𝙴𝚌𝚑𝚎𝚌");

      const { like, comment, share, author, meta } = data.data;
      const videoUrl = meta.media.find(v => v.type === "video")?.org;
      if (!videoUrl) return await reply("❌ 𝚅𝚒𝚍𝚎́𝚘 𝚒𝚗𝚍𝚒𝚜𝚙𝚘𝚗𝚒𝚋𝚕𝚎");

      await sock.sendMessage(from, {
        video: { url: videoUrl },
        caption:
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚝𝚒𝚔𝚝𝚘𝚔 』
┃ ┣ 👤 ${author.nickname}
┃ ┣ ❤️ ${like}  💬 ${comment}  🔄 ${share}
┃ ┗ ✅ 𝚃𝚎́𝚕𝚎́𝚌𝚑𝚊𝚛𝚐𝚎𝚖𝚎𝚗𝚝 𝚛𝚎́𝚞𝚜𝚜𝚒
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`
      });
    } catch { await reply("❌ 𝙴𝚛𝚛𝚎𝚞𝚛"); }
  }
};
