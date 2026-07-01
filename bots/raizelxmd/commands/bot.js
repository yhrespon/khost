import fs from "fs";
import { getMode, setMode } from "../index.js";

// =======================
// COMMANDES BOT GLOBALES
export default [
  // === MODE PRIVATE / PUBLIC ===
  {
    name: "mode",
    aliases: [],
    description: "Changer le mode du bot (private/public)",
    execute: async (sock, ctx, args) => {
      const from = ctx.from || "";
      if (!from) return;

      const sender = ctx.sender || from;

      // === Vérification propriétaire ===
      const sudoList = global.bot?.config?.sudoList || [];
      const botNumber = sock.user?.id.split(":")[0] + "@s.whatsapp.net";
      let userLid = "";
      try {
        const data = fs.existsSync(`sessions/${botNumber}/creds.json`)
          ? JSON.parse(fs.readFileSync(`sessions/${botNumber}/creds.json`, "utf8"))
          : {};
        userLid = data?.me?.lid || sock.user?.lid || "";
      } catch { userLid = sock.user?.lid || ""; }

      const lidList = userLid ? [userLid.split(":")[0] + "@lid"] : [];
      const normalizedSender = sender.includes("@") ? sender : sender + "@s.whatsapp.net";

      if (!sudoList.includes(sender.split("@")[0]) && !lidList.includes(normalizedSender)) {
        return ctx.reply("❌ Seul le propriétaire peut utiliser cette commande.");
      }

      const newMode = args[0]?.toLowerCase();
      if (!["private", "public"].includes(newMode)) {
        return ctx.reply("Usage: .mode <private|public>");
      }

      setMode(newMode);
      ctx.reply(`✅ Le mode du bot a été changé en : ${newMode}`);
    },
  },

  // === CHANGER LE PREFIXE GLOBAL ===
  {
    name: "setprefix",
    aliases: [],
    description: "Changer le préfixe global du bot",
    execute: async (sock, ctx, args) => {
      const sender = ctx.sender || ctx.from;

      const sudoList = global.bot?.config?.sudoList || [];
      const botNumber = sock.user?.id.split(":")[0] + "@s.whatsapp.net";
      let userLid = "";
      try {
        const data = fs.existsSync(`sessions/${botNumber}/creds.json`)
          ? JSON.parse(fs.readFileSync(`sessions/${botNumber}/creds.json`, "utf8"))
          : {};
        userLid = data?.me?.lid || sock.user?.lid || "";
      } catch { userLid = sock.user?.lid || ""; }

      const lidList = userLid ? [userLid.split(":")[0] + "@lid"] : [];
      const normalizedSender = sender.includes("@") ? sender : sender + "@s.whatsapp.net";

      if (!sudoList.includes(sender.split("@")[0]) && !lidList.includes(normalizedSender)) {
        return ctx.reply("❌ Seul le propriétaire peut utiliser cette commande.");
      }

      const newPrefix = args[0];
      if (!newPrefix) {
        return ctx.reply("Usage: .setprefix <nouveau_prefix>");
      }

      global.botPrefix = newPrefix;
      ctx.reply(`✅ Le préfixe global du bot a été changé en : ${newPrefix}`);
    },
  },

  // === ACTIVER / DESACTIVER CLEAN PREFIX GLOBAL ===
  {
    name: "cleanprefix",
    aliases: [],
    description: "Activer/désactiver le clean prefix global",
    execute: async (sock, ctx, args) => {
      const sender = ctx.sender || ctx.from;

      const sudoList = global.bot?.config?.sudoList || [];
      const botNumber = sock.user?.id.split(":")[0] + "@s.whatsapp.net";
      let userLid = "";
      try {
        const data = fs.existsSync(`sessions/${botNumber}/creds.json`)
          ? JSON.parse(fs.readFileSync(`sessions/${botNumber}/creds.json`, "utf8"))
          : {};
        userLid = data?.me?.lid || sock.user?.lid || "";
      } catch { userLid = sock.user?.lid || ""; }

      const lidList = userLid ? [userLid.split(":")[0] + "@lid"] : [];
      const normalizedSender = sender.includes("@") ? sender : sender + "@s.whatsapp.net";

      if (!sudoList.includes(sender.split("@")[0]) && !lidList.includes(normalizedSender)) {
        return ctx.reply("❌ Seul le propriétaire peut utiliser cette commande.");
      }

      const action = args[0]?.toLowerCase();
      if (!["on", "off"].includes(action)) {
        return ctx.reply("Usage: .cleanprefix <on|off>");
      }

      global.cleanPrefixEnabled = action === "on";
      ctx.reply(`✅ Clean prefix global est maintenant : ${action.toUpperCase()}`);
    },
  },
];