import fs from "fs";
import path from "path";
import gTTS from "gtts";

// ─── UTILS ─────────────────────────
function ensureTmpDir() {
  const dir = path.join("./tmp");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ─── COMMANDE TTS ─────────────────────────
export default {
  name: "tts",
  aliases: ["say"],
  description: "Convertit un texte en audio (français)",
  execute: async (sock, ctx, args) => {
    const from = ctx.from || "";
    const reply = ctx.reply || (() => {});
    const raw = ctx.raw || {};

    const sender = raw.pushName || getBareNumber(raw.key?.participant) || from;

    try {
      ensureTmpDir();

      // Récupère le texte depuis le message cité ou args
      let text = "";
      const quoted = raw.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (quoted) {
        text = quoted.conversation || quoted.extendedTextMessage?.text || "";
      } else if (args?.length) {
        text = args.join(" ");
      }

      if (!text) {
        if (raw.key) await sock.sendMessage(from, { react: { text: "⚠️", key: raw.key } });
        return await reply("❌ Veuillez fournir le texte à convertir en audio ou répondre à un message.");
      }

      // Génère l'audio
      const tts = new gTTS(text, "fr");
      const filePath = path.join("./tmp", `tts_${Date.now()}.mp3`);
      await new Promise((resolve, reject) => {
        tts.save(filePath, (err) => (err ? reject(err) : resolve()));
      });

      // Envoie le fichier audio
      await sock.sendMessage(from, {
        audio: fs.readFileSync(filePath),
        mimetype: "audio/mpeg",
      });

      fs.unlinkSync(filePath);

      if (raw.key) await sock.sendMessage(from, { react: { text: "🔊", key: raw.key } });
    } catch (err) {
      console.error("Erreur TTS :", err);
      if (raw.key) await sock.sendMessage(from, { react: { text: "❌", key: raw.key } });
      await reply("❌ Une erreur est survenue lors de la génération de l'audio");
    }
  }
};

// ─── UTILS LOCAL ─────────────────────────
function getBareNumber(input) {
  if (!input) return "";
  return String(input).split("@")[0].split(":")[0].replace(/[^0-9]/g, "");
}