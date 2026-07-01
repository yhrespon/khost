// mygroups.js
export default {
  name: "mygroups",
  description: "Liste tous les groupes où tu es présent avec une image en fond et réagit au message",

  async execute(sock, msg, args) {
    const sender = msg.key.participant || msg.key.remoteJid; // le lanceur
    const replyTo = msg.key.remoteJid; // où envoyer le message (inbox ou groupe)

    try {
      // Réagit au message avec ⚜️
      await sock.sendMessage(replyTo, {
        react: { text: "⚜️", key: msg.key }
      });

      // Récupère tous les groupes où le bot est présent
      const allGroups = await sock.groupFetchAllParticipating();
      const groupList = Object.values(allGroups); // metadata de chaque groupe

      // Filtre les groupes où le lanceur est présent
      const userGroups = groupList
        .filter(group => group.participants.some(p => p.id === sender))
        .map(group => group.subject || "Nom inconnu");

      // Prépare le texte qui sera la légende
      let caption;
      if (userGroups.length === 0) {
        caption = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
❌ Tu n'es membre d'aucun groupe où je suis présent.  
╚════ஜ۩۞۩ஜ═════╝`;
      } else {
        caption = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
📜 Tu es membre de ${userGroups.length} groupe(s) :  


${userGroups.map((g, i) => `🔹 ${i + 1}. ${g}`).join("\n")}  
╚════ஜ۩۞۩ஜ═════╝`;
      }

      // Envoie l'image avec la légende
      await sock.sendMessage(replyTo, {
        image: { url: "https://files.catbox.moe/y0q5l9.jpg" },
        caption
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ Erreur mygroups :", err);
      const caption = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
⚡ Impossible de récupérer tes groupes.  
🌑 Vérifie mes permissions et réessaie.  
╚════ஜ۩۞۩ஜ═════╝`;
      await sock.sendMessage(replyTo, {
        image: { url: "https://files.catbox.moe/y0q5l9.jpg" },
        caption
      }, { quoted: msg });
    }
  },
};