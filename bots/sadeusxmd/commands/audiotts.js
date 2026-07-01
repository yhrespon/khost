export default {
  name: "audiotts",
  description: "🔊 𝚃𝚎𝚡𝚝 𝚝𝚘 𝚂𝚙𝚎𝚎𝚌𝚑",

  async execute(sock, message) {
    const { from, reply } = message;
    try {
      const text = message.text?.replace(/^\.tts\s*/, "").trim();
      if (!text) return await reply("🔊 𝙴𝚌𝚛𝚒𝚜 𝚝𝚘𝚗 𝚝𝚎𝚡𝚝𝚎");

      const gTTS = (await import("node-gtts")).default;
      const fs = await import("fs");
      const tts = gTTS("en");
      const audioPath = `./temp_${Date.now()}.mp3`;

      await new Promise((resolve, reject) => {
        tts.save(audioPath, text, err => err ? reject(err) : resolve());
      });

      const audioBuffer = fs.readFileSync(audioPath);
      await sock.sendMessage(from, { audio: audioBuffer });
      fs.unlinkSync(audioPath);
    } catch { await reply("❌"); }
  }
};
