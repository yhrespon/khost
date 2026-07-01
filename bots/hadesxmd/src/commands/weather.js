import axios from "axios";

export default {

  name: "weather",

  description: "Afficher la météo d'une ville",

  async execute(sock, msg, args) {

    const from = msg.key.remoteJid;

    const city = args.join(" ");

    if (!city) {

      return await sock.sendMessage(

        from,

        {

          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ Fournis le nom de la ville : *.weather Ville*
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,

        },

        { quoted: msg }

      );

    }

    try {

      const apiKey = "4902c0f2550f58298ad4146a92b65e10"; // OpenWeather API

      const response = await axios.get(

        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(

          city

        )}&appid=${apiKey}&units=metric&lang=fr`

      );

      const weather = response.data;

      const weatherText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
        MÉTÉO 
╟─────────────────╢
🌑 Ville : ${weather.name}
🕯️ Condition :${weather.weather[0].description}
⚡ Température : ${weather.main.temp}°C
💨 Vent : ${weather.wind.speed} m/s
💧 Humidité : ${weather.main.humidity}%
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text: weatherText }, { quoted: msg });

    } catch (error) {

      console.error("Erreur météo:", error);

      await sock.sendMessage(

        from,

        {

          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ Impossible de récupérer la météo.  
⚠️ Vérifie le nom de la ville ou réessaie plus tard.
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,

        },

        { quoted: msg }

      );

    }

  },

};