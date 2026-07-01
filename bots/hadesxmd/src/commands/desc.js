export default {
  name: "desc",
  description: "Change la description du groupe avec style Hadès",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    // Vérifie que c’est un groupe
    if (!from.endsWith("@g.us")) {
      return await sock.sendMessage(from, {
        text: "❌ Cette commande est uniquement utilisable dans un groupe."
      }, { quoted: msg });
    }

    // Récupère le texte à utiliser
    let newDesc = args.join(" "); // texte après la commande
    if (!newDesc && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation) {
      newDesc = msg.message.extendedTextMessage.contextInfo.quotedMessage.conversation;
    }

    if (!newDesc) {
      return await sock.sendMessage(from, {
        text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ Veuillez fournir une description pour le groupe, soit après la commande, soit en répondant à un message.
╚════ஜ۩۞۩ஜ═════╝`
      }, { quoted: msg });
    }

    // Essaye de changer la description
    try {
      await sock.groupUpdateDescription(from, newDesc);
      await sock.sendMessage(from, {
        text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
⚡ La description du groupe a été changée sous le regard du Dieu Hadès ⚡
🌑 Nouvelle description :
${newDesc}
🌌 Obéissance et respect sont exigés.
╚════ஜ۩۞۩ஜ═════╝`
      }, { quoted: msg });
    } catch (err) {
      console.log("❌ Erreur changement description :", err);
      await sock.sendMessage(from, {
        text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
⚠️ Impossible de changer la description du groupe.
🌑 Vérifie que j'ai les permissions nécessaires.
╚════ஜ۩۞۩ஜ═════╝`
      }, { quoted: msg });
    }
  },
};