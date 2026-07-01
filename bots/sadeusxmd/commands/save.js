export default {
  name: "save",
  description: "💾 𝚂𝚊𝚞𝚟𝚎𝚐𝚊𝚛𝚍𝚎𝚛 𝚞𝚗 𝚖𝚎𝚜𝚜𝚊𝚐𝚎",
  aliases: ["keep", "backup"],

  async execute(sock, message) {
    const { from, reply } = message;
    try {
      if (!message.quoted) return await reply("❌ 𝚁𝚎́𝚙𝚘𝚗𝚍𝚜 𝚊̀ 𝚞𝚗 𝚖𝚎𝚜𝚜𝚊𝚐𝚎");
      await reply("💾 𝚂𝚊𝚞𝚟𝚎𝚐𝚊𝚛𝚍𝚎...");

      const quoted = message.quoted;
      const selfJid = sock.user.id;

      if (quoted.text) {
        await sock.sendMessage(selfJid, { text: `💾 *SADEUS XMD — 𝚂𝙰𝚅𝙴*\n\n${quoted.text}` });
        return await reply("✅ 𝚃𝚎𝚡𝚝𝚎 𝚜𝚊𝚞𝚟𝚎𝚐𝚊𝚛𝚍𝚎́");
      }

      let mediaType = ["image","video","audio","document"].find(t => quoted.type === t);
      if (!mediaType) return await reply("❌ 𝚃𝚢𝚙𝚎 𝚗𝚘𝚗 𝚜𝚞𝚙𝚙𝚘𝚛𝚝𝚎́");

      const buffer = await quoted.download();
      if (!buffer) return await reply("❌ 𝙴́𝚌𝚑𝚎𝚌 𝚍𝚞 𝚝𝚎́𝚕𝚎́𝚌𝚑𝚊𝚛𝚐𝚎𝚖𝚎𝚗𝚝");

      const opts = {};
      if (mediaType === "image")    { opts.image = buffer; opts.caption = "💾 𝚂𝚊𝚞𝚟𝚎𝚐𝚊𝚛𝚍𝚎́"; }
      else if (mediaType === "video") { opts.video = buffer; opts.caption = "💾 𝚂𝚊𝚞𝚟𝚎𝚐𝚊𝚛𝚍𝚎́"; }
      else if (mediaType === "audio") { opts.audio = buffer; opts.mimetype = "audio/mp4"; }
      else { opts.document = buffer; opts.fileName = quoted.filename || `file_${Date.now()}`; }

      await sock.sendMessage(selfJid, opts);
      await reply("✅ 𝙼𝚎́𝚍𝚒𝚊 𝚜𝚊𝚞𝚟𝚎𝚐𝚊𝚛𝚍𝚎́");
    } catch { await reply("❌ 𝙴𝚛𝚛𝚎𝚞𝚛"); }
  }
};
