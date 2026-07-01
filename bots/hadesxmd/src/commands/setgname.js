export default {
  name: "setgname",
  description: "Change le nom du groupe dans le style Hadès avec réaction 👑",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    // Vérifie que c’est un groupe
    if (!from.endsWith("@g.us")) {
      return await sock.sendMessage(from, {
        text: "❌ Cette commande est uniquement utilisable dans un groupe."
      }, { quoted: msg });
    }

    // 🔹 Réaction automatique 👑
    try {
      await sock.sendMessage(from, { react: { text: "👑", key: msg.key } });
    } catch (err) {
      console.log("⚠️ Erreur réaction 👑 ignorée :", err.message);
    }

    // Récupère le texte à utiliser
    let newName = args.join(" "); // texte après la commande
    if (!newName && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation) {
      // Si pas de texte après la commande mais en réponse à un message
      newName = msg.message.extendedTextMessage.contextInfo.quotedMessage.conversation;
    }

    if (!newName) {
      return await sock.sendMessage(from, {
        text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ Tu dois fournir un nom pour le groupe, soit après la commande, soit en répondant à un message.
╚════ஜ۩۞۩ஜ═════╝`
      }, { quoted: msg });
    }

    // Essaye de changer le nom du groupe
    try {
      await sock.groupUpdateSubject(from, newName);
      await sock.sendMessage(from, {
        text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
⚡ Le nom du groupe a été changé sous le regard du Dieu Hadès ⚡
🔹 Nouveau nom : *${newName}*
🌑 Obéissance et respect sont exigés
╚════ஜ۩۞۩ஜ═════╝`
      }, { quoted: msg });
    } catch (err) {
      console.log("❌ Erreur changement nom :", err);
      await sock.sendMessage(from, {
        text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
⚠️ Impossible de changer le nom du groupe.
🌑 Vérifie que j'ai les permissions nécessaires.
╚════ஜ۩۞۩ஜ═════╝`
      }, { quoted: msg });
    }
  },
};