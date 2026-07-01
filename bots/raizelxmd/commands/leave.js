// commands/leave.js
import fs from "fs";

export default {
  name: "leave",
  aliases: ["left", "exit"],
  description: "Permet au bot de quitter un groupe (seulement owners/sudo).",
  execute: async (sock, ctx, args) => {
    try {
      const from = ctx.from;
      const reply = ctx.reply || (() => {});

      if (!from || !from.endsWith("@g.us")) return; // seulement groupes

      const sender = ctx.sender || from;

      // === FONCTIONS INTERNES ===
      const getBareNumber = (input) => {
        if (!input) return "";
        return String(input).split("@")[0].replace(/[^0-9]/g, "");
      };

      const loadSudo = () => {
        const SUDO_FILE = "./sudo.json";
        if (!fs.existsSync(SUDO_FILE)) return [];
        return JSON.parse(fs.readFileSync(SUDO_FILE, "utf-8"));
      };

      const isOwner = (senderId) => {
        try {
          const sudoList = global.bot?.config?.sudoList || [];
          const ownerNum = global.owner || "";

          // Obtenir LID du bot
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
            sudoList.includes(bareSender) ||            // sudo du bot
            ownerNum === bareSender ||                  // global.owner
            lidList.includes(normalizedSender) ||      // LID de la session
            loadSudo().map(getBareNumber).includes(bareSender) // sudo.json
          );
        } catch (err) {
          console.error("Erreur isOwner:", err);
          return false;
        }
      };

      const isProtectedUser = (id) => {
        const botJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
        const protectedIds = [
          botJid,
          ...(global.owners || []).map(n => n + "@s.whatsapp.net"),
          ...((global.bot?.config?.sudoList) || []).map(n => n + "@s.whatsapp.net"),
          global.owner + "@s.whatsapp.net"
        ];
        return protectedIds.includes(id);
      };

      // === VÉRIFICATION OWNER ===
      if (!isOwner(sender)) {
        return await reply("❌ Tu n’as pas la permission de quitter ce groupe.");
      }

      // Réaction 🦎 au message original si possible
      if (ctx.raw?.key) {
        await sock.sendMessage(from, { react: { text: "🦎", key: ctx.raw.key } });
      }

      // Quitter le groupe
      await sock.groupLeave(from);

    } catch (err) {
      console.error("[leave.execute]", err);
      if (ctx.from) {
        await sock.sendMessage(ctx.from, { text: "❌ Impossible de quitter le groupe pour le moment." });
      }
    }
  }
};