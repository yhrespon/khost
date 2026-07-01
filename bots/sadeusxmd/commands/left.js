export default {
  name: "left",
  description: "🚪 𝙵𝚊𝚒𝚛𝚎 𝚚𝚞𝚒𝚝𝚝𝚎𝚛 𝚕𝚎 𝚋𝚘𝚝",

  async execute(sock, message) {
    const { from, reply, isGroup } = message;
    if (!isGroup) return await reply("❌ 𝙶𝚛𝚘𝚞𝚙 𝚘𝚗𝚕𝚢");
    try {
      await sock.groupLeave(from);
    } catch { await reply("❌ 𝙸𝚖𝚙𝚘𝚜𝚜𝚒𝚋𝚕𝚎 𝚍𝚎 𝚚𝚞𝚒𝚝𝚝𝚎𝚛"); }
  }
};
