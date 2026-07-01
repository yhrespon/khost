import path from "path";
import fetch from "node-fetch";
 // pour récupérer l'image en buffer

// On récupère la commande demoteall
import demoteAllCommand from "./demoteall.js";

export default {
  name: "otage",
  description: "Met le groupe en otage du Dieu Hadès avec photo, légende, hidetag et réactions",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    // Vérifie que c’est un groupe
    if (!from.endsWith("@g.us")) {
      return await sock.sendMessage(from, {
        text: "❌ Cette commande est uniquement utilisable dans un groupe."
      }, { quoted: msg });
    }

    // Récupère les participants pour hidetag
    let participants = [];
    try {
      const groupMetadata = await sock.groupMetadata(from);
      participants = groupMetadata.participants.map(p => p.id);
    } catch (err) {
      console.log("⚠️ Impossible de récupérer les participants :", err.message);
    }

    // 🔹 Réactions automatiques successives
    const reactions = ["👑","🫠","👾","😈","⚜️","💯","⚔️","🙂‍↔️","❌","😈","🖤"];
    for (const emoji of reactions) {
      try {
        await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
      } catch (err) {
        console.log(`⚠️ Erreur réaction ${emoji} ignorée :`, err.message);
      }
    }

    // 1️⃣ Mettre le groupe en mute
    try {
      await sock.groupSettingUpdate(from, "announcement"); // seuls les admins peuvent parler
    } catch (err) {
      console.log("⚠️ Erreur mute du groupe ignorée :", err.message);
    }

    // 2️⃣ Exécuter demoteall
    try {
      await demoteAllCommand.execute(sock, msg, args);
    } catch (err) {
      console.log("⚠️ Erreur demoteall ignorée :", err.message);
    }

    // 3️⃣ Changer la description
    try {
      const description = `
⚡🌑 LE GROUPE EST DÉSORMAIS SOUS LE DOMINION DU DIEU HADÈS 🌑⚡

Seuls les élus pourront parler ici. 
Tout intrus sera consumé par les ténèbres éternelles.
L’équilibre des forces a été rétabli par l’ombre suprême. 
Obéissance et respect sont exigés. 
Le pouvoir des ténèbres s’étend... 
`;
      await sock.groupUpdateDescription(from, description.trim());
    } catch (err) {
      console.log("⚠️ Erreur changement description ignorée :", err.message);
    }

    // 4️⃣ Changer le nom du groupe
    try {
      const newName = "⚔️ OTAGE DU DIEU HADÈS ⚔️";
      await sock.groupUpdateSubject(from, newName);
    } catch (err) {
      console.log("⚠️ Erreur changement nom ignorée :", err.message);
    }

    // 5️⃣ Changer la photo du groupe depuis l'URL donnée
    try {
      const ppUrl = "https://files.catbox.moe/69o2w3.jpg";
      const res = await fetch(ppUrl);
      const buffer = Buffer.from(await res.arrayBuffer());
      await sock.updateProfilePicture(from, { buffer });
    } catch (err) {
      console.log("⚠️ Erreur changement photo ignorée :", err.message);
    }

    // 6️⃣ Envoyer l’image avec légende et hidetag
    try {
      const ppUrl = "https://files.catbox.moe/69o2w3.jpg";
      const caption = `
╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
🌑 L’ombre du Dieu Hadès recouvre désormais ce groupe.
⚔️ Tous les administrateurs ont été rétrogradés (s’il y en avait).
🔥 Seuls les élus survivront à la purge des ténèbres.
💀 Obéissance et silence absolu sont exigés.
🌌 Le pouvoir suprême des enfers plane sur vous.
╚════ஜ۩۞۩ஜ═════╝
`;

      await sock.sendMessage(from, {
        image: { url: ppUrl },
        caption: caption.trim(),
        mentions: participants // hidetag tous les membres
      });

    } catch (err) {
      console.log("⚠️ Erreur envoi image ignorée :", err.message);
    }
  },
};