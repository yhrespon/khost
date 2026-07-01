import axios from "axios";

const GOOGLE_API_KEY = "AIzaSyDo09jHOJqL6boMeac-xmPHB-yD9dKOKGU";
const GOOGLE_CX = "d1a5b18a0be544a0e";

async function searchImages(query) {
  try {
    const response = await axios.get("https://www.googleapis.com/customsearch/v1", {
      params: {
        q: query,
        cx: GOOGLE_CX,
        searchType: "image",
        key: GOOGLE_API_KEY,
      },
    });

    if (response.data.items && response.data.items.length > 0) {
      const randomIndex = Math.floor(Math.random() * response.data.items.length);
      return response.data.items[randomIndex].link;
    } else {
      return null;
    }
  } catch (err) {
    console.error("❌ Erreur Google API:", err);
    return null;
  }
}

export default {
  name: "img",
  description: "Recherche et renvoie une image depuis Google",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    try {
      const query = args.join(" ");

      // Si aucun mot-clé n'est fourni
      if (!query) {
        const usageText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
❌ *Mot-clé manquant !*

⚔️ Offre un sujet ou un mot-clé pour que je puisse extraire 
l’image des abysses numériques.

💡 Exemple : *.img Hadès*
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 - 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

        return await sock.sendMessage(from, { text: usageText }, { quoted: msg });
      }

      // Message de recherche
      await sock.sendMessage(
        from,
        {
          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
🔍 *Exploration des ténèbres…*

Je recherche une image pour : *${query}*
╚════ஜ۩۞۩ஜ═════╝`,
        },
        { quoted: msg }
      );

      const imageUrl = await searchImages(query);

      if (imageUrl) {
        await sock.sendMessage(from, {
          image: { url: imageUrl },
          caption: `⚡ *Image extraite des abysses numériques.*
> Sujet : *${query}*
> 𝙳𝙴𝚅 - 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,
        });
      } else {
        const notFound = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
❌ *Aucune image trouvée !*

⚔️ Les abysses restent silencieux pour : *${query}*
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 - 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

        await sock.sendMessage(from, { text: notFound }, { quoted: msg });
      }
    } catch (err) {
      console.error("❌ Erreur commande img :", err);

      const errorText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷۩ஜ═╗
❌ *Invocation échouée !*

Les enfers ont consumé ma requête.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 - 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text: errorText }, { quoted: msg });
    }
  },
};