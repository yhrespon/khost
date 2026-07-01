// count.js

// Module global pour suivre les messages
if (!global.messageCount) global.messageCount = {};

// Fonction à appeler à chaque message reçu
function trackMessage(message) {
  const from = message.key.remoteJid;
  const sender = message.key.participant || message.key.remoteJid;

  if (!global.messageCount[from]) global.messageCount[from] = {};
  if (!global.messageCount[from][sender]) global.messageCount[from][sender] = 0;

  global.messageCount[from][sender]++;
}

export default {
  name: "count",
  description: "Compter le nombre de messages d’un membre",

  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;
      const mentions =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

      const sender =
        mentions[0] || msg.key.participant || msg.key.remoteJid;

      const count = global.messageCount[from]?.[sender] || 0;

      const text = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
🌑 Membre : @${sender.split("@")[0]}  
🕯️ Total messages : ${count}  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(
        from,
        { text, mentions: [sender] },
        { quoted: msg }
      );
    } catch (err) {
      console.error("❌ Erreur dans count:", err);

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
❌ Erreur : ${err.message}  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,
        },
        { quoted: msg }
      );
    }
  },

  // On expose aussi la fonction pour l’utiliser dans index.js
  trackMessage,
};