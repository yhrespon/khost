// tag
import fs from "fs";
import path from "path";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

const TAG_SOUNDS_DIR = "./tag_sounds";
const TAG_SETTINGS_DIR = "./tag_settings";

if (!fs.existsSync(TAG_SOUNDS_DIR)) fs.mkdirSync(TAG_SOUNDS_DIR);
if (!fs.existsSync(TAG_SETTINGS_DIR)) fs.mkdirSync(TAG_SETTINGS_DIR);

function getBareNumber(input) {
  if (!input) return "";
  return String(input).split("@")[0].split(":")[0].replace(/[^0-9]/g, "");
}

export const tagCommands = [
  {
    name: "tagall",
    description: "Taguer tous les membres d’un groupe",
    execute: async (sock, ctx) => {
      const from = ctx.from;
      const raw = ctx.raw;
      if (!from.endsWith("@g.us")) return;

      try {
        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;
        const mentions = participants.map(p => p.id);
        const textMentions = participants.map(p => `@${p.id.split("@")[0]}`).join("\n");

        const signature = "✨ 𝑷𝒂𝒔 𝒃𝒆𝒔𝒐𝒊𝒏 𝒅𝒆 𝒍𝒊𝒌𝒆, 𝒋𝒆 𝒔𝒂𝒊𝒔 𝒅𝒆́𝒋𝒂̀ 𝒒𝒖𝒆 𝒋𝒆 𝒔𝒖𝒊𝒔 𝒍𝒂 𝒏𝒐𝒕𝒊𝒇 𝒍𝒂 𝒑𝒍𝒖𝒔 𝒊𝒎𝒑𝒐𝒓𝒕𝒂𝒏𝒕𝒆\n👑 𝐃𝐄𝐕-𝐑𝐀𝐈𝐙𝐄𝐋";

        await sock.sendMessage(from, {
          image: { url: "https://files.catbox.moe/aanan8.jpg" },
          caption: signature + "\n\n📢 TAGALL\n\n" + textMentions,
          mentions,
        });
      } catch (err) {
        console.error("❌ Erreur tagall :", err);
      }
    },
  },

  {
    name: "tagcreator",
    description: "Taguer le créateur principal du groupe",
    execute: async (sock, ctx) => {
      const from = ctx.from;
      const raw = ctx.raw;
      if (!from.endsWith("@g.us")) return;

      try {
        const groupMetadata = await sock.groupMetadata(from);
        const creatorId = groupMetadata.owner;
        if (!creatorId) return;

        const text = `👑 Le créateur principal du groupe est : @${creatorId.split("@")[0]}`;
        await sock.sendMessage(from, { text, mentions: [creatorId] });
        if (raw?.key) await sock.sendMessage(from, { react: { text: "👑", key: raw.key } });
      } catch (err) {
        console.error("❌ Erreur tagcreator :", err);
      }
    },
  },

  {
    name: "tagadmin",
    description: "Taguer tous les admins du groupe",
    execute: async (sock, ctx) => {
      const from = ctx.from;
      const raw = ctx.raw;
      if (!from.endsWith("@g.us")) return;

      try {
        const groupMetadata = await sock.groupMetadata(from);
        const admins = groupMetadata.participants.filter(p => p.admin);
        if (!admins.length) return;

        const mentions = admins.map(a => a.id);
        const textMentions = admins.map(a => `@${a.id.split("@")[0]}`).join("\n");
        const text = `📢 TAGADMIN_\n\n${textMentions}`;

        await sock.sendMessage(from, { text, mentions });
        if (raw?.key) await sock.sendMessage(from, { react: { text: "👑", key: raw.key } });
      } catch (err) {
        console.error("❌ Erreur tagadmin :", err);
      }
    },
  },

  {
    name: "tag",
    description: "Tag tous les membres avec ou sans message cité",
    execute: async (sock, ctx, args) => {
      const from = ctx.from;
      const raw = ctx.raw;
      if (!from.endsWith("@g.us")) return;

      try {
        const groupMetadata = await sock.groupMetadata(from);
        const mentions = groupMetadata.participants.map(p => p.id);

        const quotedMsg = raw.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let messageToSend = quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text || quotedMsg?.imageMessage?.caption || quotedMsg?.videoMessage?.caption || quotedMsg?.documentMessage?.fileName;

        if (!messageToSend && args?.length) messageToSend = args.join(" ");
        await sock.sendMessage(from, { text: messageToSend || "", mentions });
        if (raw?.key) await sock.sendMessage(from, { react: { text: "🦅", key: raw.key } });
      } catch (err) {
        console.error("Erreur tag :", err);
      }
    },
  },

  {
    name: "settag",
    description: "Définir un message audio automatique pour le tag",
    execute: async (sock, ctx) => {
      const from = ctx.from;
      const raw = ctx.raw;
      if (!from.endsWith("@g.us")) return;

      const quoted = raw.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const audioMsg = quoted?.audioMessage;
      if (!audioMsg) return;

      try {
        const filename = `${getBareNumber(from)}.mp3`;
        const filepath = path.join(TAG_SOUNDS_DIR, filename);

        const buffer = await downloadMediaMessage({ message: quoted }, "buffer", {}, { reuploadRequest: sock.updateMediaMessage });
        fs.writeFileSync(filepath, buffer);

        await sock.sendMessage(from, { text: "✅ Son de tag enregistré pour ce groupe !" });
        if (raw?.key) await sock.sendMessage(from, { react: { text: "🎵", key: raw.key } });
      } catch (err) {
        console.error("❌ Erreur settag :", err);
      }
    },
  },

  {
    name: "autotag",
    description: "Activer ou désactiver la réponse audio automatique au bot",
    execute: async (sock, ctx, args) => {
      const from = ctx.from;
      const raw = ctx.raw;
      if (!from.endsWith("@g.us")) return;

      const option = args?.[0]?.toLowerCase();
      if (!option || !["on", "off"].includes(option)) {
        return await sock.sendMessage(from, { text: "⚙️ Usage : *.autotag on* ou *.autotag off*", quoted: raw });
      }

      const filePath = path.join(TAG_SETTINGS_DIR, `${getBareNumber(from)}.json`);
      fs.writeFileSync(filePath, JSON.stringify({ enabled: option === "on" }, null, 2));

      await sock.sendMessage(from, {
        text: option === "on" ? "✅ Réponse audio activée." : "🚫 Réponse audio désactivée.",
        quoted: raw
      });
    },
  },
];

// ─── HANDLE MENTION ──────────────────
export async function handleMention(sock, ctx) {
  const from = ctx.from;
  if (!from.endsWith("@g.us")) return;

  const filePath = path.join(TAG_SETTINGS_DIR, `${getBareNumber(from)}.json`);
  if (!fs.existsSync(filePath)) return;
  const { enabled } = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (!enabled) return;

  const mentioned = ctx.raw.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const botJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
  if (!mentioned.includes(botJid)) return;

  try {
    const audioPath = path.join(TAG_SOUNDS_DIR, `${getBareNumber(from)}.mp3`);
    if (!fs.existsSync(audioPath)) return;

    const buffer = fs.readFileSync(audioPath);
    await sock.sendMessage(from, {
      audio: buffer,
      mimetype: "audio/mpeg",
      quoted: ctx.raw
    });
  } catch (err) {
    console.error("Erreur auto tag audio :", err);
  }
}

export default tagCommands;