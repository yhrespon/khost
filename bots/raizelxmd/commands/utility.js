import fetch from "node-fetch";

// ─── UTILS ─────────────────────────
function getBareNumber(input) {
  if (!input) return "";
  return String(input).split("@")[0].split(":")[0].replace(/[^0-9]/g, "");
}

// ─── COMMANDES ─────────────────────────
export default [
  // ===== COMMANDE GOOGLE =====
  {
    name: "google",
    description: "Recherche sur Google et renvoie le top résultat",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});
      const raw = ctx.raw || {};

      if (!args?.length) {
        if (raw.key) await sock.sendMessage(from, { react: { text: "⚠️", key: raw.key } });
        return await reply("⚠️ Fournis un terme à rechercher.");
      }

      const query = args.join(" ");
      try {
        const response = await fetch(`https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_CX}`);
        const data = await response.json();

        if (!data.items?.length) {
          if (raw.key) await sock.sendMessage(from, { react: { text: "❌", key: raw.key } });
          return await reply("❌ Aucun résultat trouvé.");
        }

        const top = data.items[0];
        const text = `🔎 Google Result:\n\nTitle: ${top.title}\nLink: ${top.link}\nSnippet: ${top.snippet}`;
        await sock.sendMessage(from, { text });
      } catch (err) {
        console.error("Erreur GOOGLE :", err);
        if (raw.key) await sock.sendMessage(from, { react: { text: "❌", key: raw.key } });
        await reply("❌ Impossible de rechercher sur Google.");
      }
    },
  },

  // ===== COMMANDE CALC =====
  {
    name: "calc",
    description: "Calculatrice rapide",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});
      const raw = ctx.raw || {};

      if (!args?.length) {
        if (raw.key) await sock.sendMessage(from, { react: { text: "⚠️", key: raw.key } });
        return await reply("⚠️ Fournis une expression à calculer.");
      }

      const expr = args.join(" ");
      try {
        const result = Function(`"use strict"; return (${expr})`)();
        await sock.sendMessage(from, { text: `🧮 Résultat : ${result}` });
      } catch (err) {
        console.error("Erreur CALC :", err);
        if (raw.key) await sock.sendMessage(from, { react: { text: "❌", key: raw.key } });
        await reply("❌ Expression invalide.");
      }
    },
  },

  // ===== COMMANDE TRANSLATE =====
  {
    name: "translate",
    description: "Traduit un texte dans la langue ciblée",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});
      const raw = ctx.raw || {};

      if (!args || args.length < 2) {
        return await reply("⚠️ Usage : /translate [langue] [texte]");
      }

      const languages = {
        anglais: "en",
        french: "fr",
        français: "fr",
        espagnol: "es",
        italien: "it",
        chinois: "zh-CN",
        japonais: "ja",
        allemand: "de",
        arabe: "ar",
        russe: "ru",
        portugais: "pt"
      };

      const targetLang = languages[args[0].toLowerCase()] || args[0];
      const textToTranslate = args.slice(1).join(" ");

      try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|${targetLang}`);
        const data = await res.json();
        const translated = data.responseData?.translatedText || "❌ Traduction introuvable";

        const formatted = `🌐 Traduction (${targetLang}) :\n${translated}`;
        await sock.sendMessage(from, { text: formatted });
      } catch (err) {
        console.error("Erreur TRANSLATE :", err);
        if (raw.key) await sock.sendMessage(from, { react: { text: "❌", key: raw.key } });
        await reply("❌ Impossible de traduire le texte.");
      }
    },
  },

  // ===== COMMANDE SHORTLINK =====
  {
    name: "r",
    description: "Raccourcit un lien URL",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});
      const raw = ctx.raw || {};

      if (!args?.length) {
        if (raw.key) await sock.sendMessage(from, { react: { text: "⚠️", key: raw.key } });
        return await reply("⚠️ Fournis une URL à raccourcir.");
      }

      const url = args[0];
      try {
        const res = await fetch(`https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(url)}`);
        const data = await res.json();

        if (!data.ok) {
          if (raw.key) await sock.sendMessage(from, { react: { text: "❌", key: raw.key } });
          return await reply("❌ Impossible de raccourcir l'URL.");
        }

        const shortUrl = data.result.full_short_link;
        await sock.sendMessage(from, { text: `🔗 URL raccourcie : ${shortUrl}` });
      } catch (err) {
        console.error("Erreur SHORTLINK :", err);
        if (raw.key) await sock.sendMessage(from, { react: { text: "❌", key: raw.key } });
        await reply("❌ Impossible de raccourcir l'URL.");
      }
    },
  },
];