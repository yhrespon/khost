import { downloadContentFromMessage, BufferJSON, proto, generateWAMessageFromContent } from "@whiskeysockets/baileys";
// src/commands/setpp.js
import fs from "fs";
import path from "path";

export default {
  name: "setpp",
  description: "Changer la photo de profil du bot",
  async execute(sock, m, args) {
    try {
      // Vérifier si le message contient une image
      let messageType = Object.keys(m.message)[0];
      if (messageType !== "imageMessage" && (!m.message.extendedTextMessage || !m.message.extendedTextMessage.contextInfo || !m.message.extendedTextMessage.contextInfo.quotedMessage || !m.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage)) {
        return await sock.sendMessage(m.key.remoteJid, { text: "❌ Veuillez envoyer une image ou répondre à une image pour définir comme photo de profil." }, { quoted: m });
      }

      // Récupérer le flux de l'image
      let stream;
      if (messageType === "imageMessage") {
        stream = await downloadContentFromMessage(m.message.imageMessage, "image");
      } else {
        stream = await downloadContentFromMessage(m.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage, "image");
      }

      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      // Changer la photo de profil
      await sock.updateProfilePicture(sock.user.id, buffer);
      await sock.sendMessage(m.key.remoteJid, { text: "✅ Photo de profil mise à jour !" }, { quoted: m });
    } catch (err) {
      console.error("❌ setpp error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: `❌ Impossible de changer la photo de profil: ${err.message}` }, { quoted: m });
    }
  }
};