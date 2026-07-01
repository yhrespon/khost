import fs from "fs";
import axios from "axios";

export const groupinfoCommands = [
  // 📝 DESCRIPTION DU GROUPE
  {
    name: "desc",
    aliases: ["description", "gdesc"],
    emoji: "📝",
    async execute(sock, context, args) {
      const from = context.from;
      if (!from.endsWith("@g.us")) return context.reply("⚠️ Cette commande doit être utilisée dans un groupe.");

      try {
        const metadata = await sock.groupMetadata(from);
        const desc = metadata.desc || "📭 Aucune description définie.";
        const groupName = metadata.subject || "Groupe sans nom";

        const text = `Informations du groupe\n\n👥 Nom : ${groupName}\n📝 Description :\n${desc}`;
        await context.reply(text);
        if (context.raw?.key) await sock.sendMessage(from, { react: { text: "📝", key: context.raw.key } });
      } catch (e) {
        await context.reply("❌ Erreur : " + e.message);
      }
    }
  },

  // 🖼️ PHOTO DE PROFIL DU GROUPE
  {
    name: "gpp",
    aliases: ["grouppp", "groupicon", "groupavatar"],
    emoji: "🖼️",
    async execute(sock, context, args) {
      const from = context.from;
      if (!from.endsWith("@g.us")) return context.reply("⚠️ Utilisable uniquement dans un groupe !");

      try {
        let ppUrl;
        try { ppUrl = await sock.profilePictureUrl(from, "image"); } 
        catch { ppUrl = "https://files.catbox.moe/2yz2qu.jpg"; }

        const metadata = await sock.groupMetadata(from);
        const caption = `🖼️ Photo de profil du groupe\n👥 Nom : ${metadata.subject || "Groupe"}`;

        await sock.sendMessage(from, { image: { url: ppUrl }, caption });
        if (context.raw?.key) await sock.sendMessage(from, { react: { text: "🖼️", key: context.raw.key } });
      } catch (e) {
        await context.reply("❌ Erreur GPP : " + e.message);
      }
    }
  },

  // 👤 PHOTO DE PROFIL UTILISATEUR
  {
    name: "pp",
    aliases: ["profile", "avatar"],
    emoji: "👤",
    async execute(sock, context, args) {
      const from = context.from;

      try {
        // Détecte la cible : reply, mention ou argument
        const target =
          context.raw?.quoted?.key?.participant ||
          context.raw?.message?.extendedTextMessage?.contextInfo?.participant ||
          context.raw?.mentionedJid?.[0] ||
          (args[0] ? args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : context.sender);

        let ppUrl;
        try { ppUrl = await sock.profilePictureUrl(target, "image"); } 
        catch { ppUrl = "https://files.catbox.moe/2yz2qu.jpg"; }

        const userName = target.split("@")[0];
        const caption = `👤 Profil de ${userName}`;

        await sock.sendMessage(from, { image: { url: ppUrl }, caption });
        if (context.raw?.key) await sock.sendMessage(from, { react: { text: "👤", key: context.raw.key } });
      } catch (e) {
        await context.reply("❌ Erreur PP : " + e.message);
      }
    }
  },

  // 🤖 COMMANDE IA
  {
    name: "ia",
    aliases: ["ai", "hades"],
    emoji: "🤖",
    async execute(sock, context, args) {
      const from = context.from;
      const question = args.join(" ");

      if (!question) return context.reply("⚠️ Pose une question à l’IA.\nExemple : *.ia qui est Zeus ?*");

      try {
        await context.reply("🤔 Raizel réfléchit...");

        const apiUrl = `https://apis.davidcyriltech.my.id/ai/chatbot?query=${encodeURIComponent(question)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.success || !data.result) throw new Error("Aucune réponse obtenue de l'IA.");

        const replyText = `Réponse d'Hadès :\n${data.result}`;
        await context.reply(replyText);
        if (context.raw?.key) await sock.sendMessage(from, { react: { text: "🤖", key: context.raw.key } });
      } catch (err) {
        await context.reply("❌ Erreur IA : " + err.message);
      }
    }
  }
];

export default groupinfoCommands;