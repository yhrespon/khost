import fs from "fs";
import path from "path";
import axios from "axios";
import { getDevice } from "@whiskeysockets/baileys";

// ─── UTILS ─────────────────────────
function getBareNumber(input) {
  if (!input) return "";
  return String(input).split("@")[0].split(":")[0].replace(/[^0-9]/g, "");
}

// ─── COMMANDES ─────────────────────────
export default [
  // 📱 DEVICE
  {
    name: "device",
    description: "Révèle l’appareil utilisé par un utilisateur (reply obligatoire)",
    emoji: "📱",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});
      const raw = ctx.raw || {};

      try {
        const info = raw.message?.extendedTextMessage?.contextInfo;
        if (!info?.stanzaId || !info?.participant) {
          if (raw.key) await sock.sendMessage(from, { react: { text: "⚠️", key: raw.key } });
          return await reply("⚠️ Réponds à un message pour sonder l’appareil.");
        }

        const deviceInfo = getDevice(info.stanzaId) || "Inconnu";
        const target = getBareNumber(info.participant);
        const text = `📱 Appareil détecté\nUtilisateur : ${target}\nAppareil : ${deviceInfo}`;

        if (raw.key) await sock.sendMessage(from, { react: { text: "📱", key: raw.key } });
        await sock.sendMessage(from, { text });
      } catch (err) {
        console.error(err);
        if (raw.key) await sock.sendMessage(from, { react: { text: "❌", key: raw.key } });
        await reply("❌ Impossible de détecter l’appareil.");
      }
    },
  },

  // 💻 INFO ZAP
  {
    name: "infozap",
    description: "Indique si l’utilisateur utilise WhatsApp Messenger ou Business",
    emoji: "💻",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});
      const raw = ctx.raw || {};

      try {
        let targetJid = null;

        const quoted = raw.message?.extendedTextMessage?.contextInfo;
        if (quoted?.participant) targetJid = quoted.participant;
        else if (raw.mentionedJid?.length) targetJid = raw.mentionedJid[0];
        else if (args?.length) targetJid = args[0].includes("@") ? args[0] : `${args[0]}@s.whatsapp.net`;
        else targetJid = raw.key?.participant || from;

        const targetName = getBareNumber(targetJid);
        let isBusiness = false;

        try {
          const res = await sock.onWhatsApp([targetJid]);
          if (Array.isArray(res) ? res[0]?.isBusiness : res?.isBusiness) isBusiness = true;
        } catch {}

        try {
          const contact = sock.store?.contacts?.get
            ? sock.store.contacts.get(targetJid)
            : sock.store?.contacts?.[targetJid];
          if (contact?.isBusiness || contact?.verifiedName || contact?.businessProfile) isBusiness = true;
        } catch {}

        try {
          if (!isBusiness && typeof sock.getBusinessProfile === "function") {
            const bp = await sock.getBusinessProfile(targetJid).catch(() => null);
            if (bp) isBusiness = true;
          }
        } catch {}

        const waType = isBusiness ? "WhatsApp Business" : "WhatsApp Messenger";
        const text = `💻 Type WhatsApp\nUtilisateur : ${targetName}\nType : ${waType}`;

        if (raw.key) await sock.sendMessage(from, { react: { text: "💻", key: raw.key } });
        await sock.sendMessage(from, { text });
      } catch (err) {
        console.error(err);
        if (raw.key) await sock.sendMessage(from, { react: { text: "❌", key: raw.key } });
        await reply("❌ Impossible de détecter le type de WhatsApp.");
      }
    },
  },

  // 📰 NEWS
  {
    name: "news",
    description: "Affiche les dernières actualités",
    emoji: "📰",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});
      const raw = ctx.raw || {};

      try {
        const apiKey = "dcd720a6f1914e2d9dba9790c188c08c";
        const res = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`);
        const articles = res.data.articles.slice(0, 5);

        let text = `📰 Dernières actualités\n\n`;
        articles.forEach((a, i) => {
          text += `${i + 1}. ${a.title}\n${a.description || "Pas de description"}\n\n`;
        });

        if (raw.key) await sock.sendMessage(from, { react: { text: "📰", key: raw.key } });
        await sock.sendMessage(from, { text });
      } catch (err) {
        console.error(err);
        if (raw.key) await sock.sendMessage(from, { react: { text: "❌", key: raw.key } });
        await reply("❌ Impossible de récupérer les actualités.");
      }
    },
  },

  // ☀️ WEATHER
  {
    name: "weather",
    description: "Affiche la météo d'une ville",
    emoji: "☀️",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      const reply = ctx.reply || (() => {});
      const raw = ctx.raw || {};
      const city = args?.join(" ");

      if (!city) return await reply("⚠️ Fournis le nom de la ville : *.weather Ville*");

      try {
        const apiKey = "4902c0f2550f58298ad4146a92b65e10";
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=fr`
        );
        const w = res.data;

        const text = `☀️ Météo à ${w.name}\nCondition : ${w.weather[0].description}\nTempérature : ${w.main.temp}°C\nVent : ${w.wind.speed} m/s\nHumidité : ${w.main.humidity}%`;

        if (raw.key) await sock.sendMessage(from, { react: { text: "☀️", key: raw.key } });
        await sock.sendMessage(from, { text });
      } catch (err) {
        console.error(err);
        if (raw.key) await sock.sendMessage(from, { react: { text: "❌", key: raw.key } });
        await reply("❌ Impossible de récupérer la météo.");
      }
    },
  },
];