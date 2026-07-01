import axios from "axios";

export default {
  name: "weather",
  description: "🌤️ 𝙼𝚎́𝚝𝚎́𝚘",

  async execute(sock, message) {
    const { from, reply, args } = message;
    try {
      const city = args.join(" ");
      if (!city) return await reply("🌍 𝚄𝚜𝚊𝚐𝚎 : .𝚠𝚎𝚊𝚝𝚑𝚎𝚛 <𝚟𝚒𝚕𝚕𝚎>");

      await reply(`🔍 𝚁𝚎𝚌𝚑𝚎𝚛𝚌𝚑𝚎 𝚙𝚘𝚞𝚛 ${city}...`);

      const apiKey = "4902c0f2550f58298ad4146a92b65e10";
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
      );

      const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
      const sunset  = new Date(data.sys.sunset  * 1000).toLocaleTimeString();

      await reply(
`╭━━━━━━━━━━━━━━━╮
   🐍 SADEUS XMD V1🐍
╰━━━━━━━━━━━━━━━╯
╭━━━━━━━━━━━━━━━╮
┃ ⛩️ 『 𝚠𝚎𝚊𝚝𝚑𝚎𝚛 』
┃ ┣ 📍 ${data.name}, ${data.sys.country}
┃ ┣ 🌡️ ${data.main.temp}°C (𝚛𝚎𝚜𝚜𝚎𝚗𝚝𝚒 ${data.main.feels_like}°C)
┃ ┣ 💧 𝙷𝚞𝚖𝚒𝚍𝚒𝚝𝚎́ : ${data.main.humidity}%
┃ ┣ 🌬️ 𝚅𝚎𝚗𝚝 : ${data.wind.speed} 𝚖/𝚜
┃ ┣ ☁️ 𝙽𝚞𝚊𝚐𝚎𝚜 : ${data.clouds.all}%
┃ ┣ 🌅 𝙻𝚎𝚟𝚎𝚛 : ${sunrise}
┃ ┗ 🌇 𝙲𝚘𝚞𝚌𝚑𝚎𝚛 : ${sunset}
┣━━━━━━━━━━━━━━━┫
┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs
╰━━━━━━━━━━━━━━━╯`);
    } catch { await reply("❌ 𝙸𝚖𝚙𝚘𝚜𝚜𝚒𝚋𝚕𝚎 𝚍𝚎 𝚛𝚎́𝚌𝚞𝚙𝚎́𝚛𝚎𝚛 𝚕𝚊 𝚖𝚎́𝚝𝚎́𝚘"); }
  }
};
