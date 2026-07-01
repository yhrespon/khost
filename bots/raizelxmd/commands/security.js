// ✅ commands/security.js — version RAIZEL uniforme avec ping.js
import fs from "fs";
import { jidDecode } from "@whiskeysockets/baileys";
import { statusSecurity } from "../security.js";

export default (() => {
  const FILE = "security.json";
  const SUDO_FILE = "./sudo.json";

  const emojis = {
    antiViewOnce: "👁️‍🗨️",
    antiLoc: "📍",
    antiSticker: "🖼️",
    antiMessage: "💬",
    antiPicture: "🖼️",
    antiAudio: "🎵",
    antiVideo: "📹"
  };

  const protections = [
    "antiViewOnce",
    "antiLoc",
    "antiSticker",
    "antiMessage",
    "antiPicture",
    "antiAudio",
    "antiVideo"
  ];

  // =================== HELPERS ===================
  const readJSON = (file) => {
    if (!fs.existsSync(file)) return {};
    try { return JSON.parse(fs.readFileSync(file, "utf-8")); } 
    catch { return {}; }
  };

  const writeJSON = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  };

  const loadSudo = () => {
    if (!fs.existsSync(SUDO_FILE)) return [];
    return JSON.parse(fs.readFileSync(SUDO_FILE, "utf-8"));
  };

  const getBareNumber = (jid) => {
    if (!jid) return "";
    return String(jid).split("@")[0].replace(/[^0-9]/g, "");
  };

  const isOwner = (sock, senderId) => {
    try {
      const sudoList = global.bot?.config?.sudoList || [];
      const ownerNum = global.owner || "";

      let userLid = "";
      const botNumber = sock.user?.id.split(":")[0] + "@s.whatsapp.net";
      try {
        const data = fs.existsSync(`sessions/${botNumber}/creds.json`)
          ? JSON.parse(fs.readFileSync(`sessions/${botNumber}/creds.json`, "utf8"))
          : {};
        userLid = data?.me?.lid || sock.user?.lid || "";
      } catch { userLid = sock.user?.lid || ""; }

      const lidList = userLid ? [userLid.split(":")[0] + "@lid"] : [];
      const normalizedSender = senderId.includes("@") ? senderId : senderId + "@s.whatsapp.net";
      const bareSender = getBareNumber(senderId);

      return (
        sudoList.includes(bareSender) ||
        ownerNum === bareSender ||
        lidList.includes(normalizedSender) ||
        loadSudo().map(getBareNumber).includes(bareSender)
      );
    } catch {
      return false;
    }
  };

  const toggleProtection = (key, value) => {
    statusSecurity[key] = !!value;        // ← Intégré avec statusSecurity
    return statusSecurity[key];
  };

  // =================== COMMANDES ===================
  return protections.map((key) => ({
    name: key.toLowerCase(),
    aliases: [key.toLowerCase()],
    description: `Activer/désactiver ${key} (Owner/Sudo uniquement)`,
    execute: async (sock, ctx, args) => {
      try {
        const from = ctx.from || "";
        const reply = ctx.reply || (() => {});

        if (!from) return;

        const jid =
          ctx.raw?.key?.fromMe
            ? sock.user?.id || ""
            : ctx.raw?.key?.participant || ctx.from || "";

        if (!isOwner(sock, jid)) {
          return await reply(`❌ Cette commande est réservée aux owners/sudo.`);
        }

        const currentStatus = statusSecurity[key] || false;

        if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
          return await reply(
            `${emojis[key]} ${key} est actuellement ${currentStatus ? "activé" : "désactivé"}\nUsage : .${key.toLowerCase()} <on/off>`
          );
        }

        const status = args[0].toLowerCase() === "on";
        toggleProtection(key, status);

        await reply(`${emojis[key]} ${key} ${status ? "activé" : "désactivé"} pour ce groupe !`);

        if (ctx.raw?.key) {
          await sock.sendMessage(from, { react: { text: emojis[key], key: ctx.raw.key } });
        }
      } catch (err) {
        console.error(`Erreur commande ${key}:`, err);
        const reply = ctx.reply || (() => {});
        await reply(`❌ Erreur interne: ${err.message}`);
      }
    }
  }));
})();