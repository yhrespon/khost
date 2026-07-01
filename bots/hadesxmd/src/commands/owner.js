export default {
    name: "owner",
    description: "Afficher les informations sur les créateurs du bot",

    async execute(sock, msg, args) {
        try {
            const from = msg.key.remoteJid;

            const ownerText = `╔═════ஜ۩۞۩ஜ═════╗
    👑 𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷 👑
╟─────────────────╢
🌑 Version : 1.0.0
🕯️ Base : Baileys - Node.js
⚔️ Mode : Privé & Groupe
╟─────────────────╢
👑 Créateurs du Dieu HADÈS :
▪️  𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 
▪️  𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃 
  ────────────────
🔗 Liens officiels :
📌 Groupe Support :https://chat.whatsapp.com/DVDE7J2ia9z9NuLBFCKOLC?mode=ems_copy_t

📌 Chaîne WhatsApp : https://whatsapp.com/channel/0029VbBU3ISHwXb5Gd65Jp1I

📌Canal WhatsApp : https://whatsapp.com/channel/0029VbBU3ISHwXb5Gd65Jp1I

📌 Groupe WhatsApp : https://chat.whatsapp.com/DVDE7J2ia9z9NuLBFCKOLC
╟─────────────────╢
🩸 Signature :
« HADÈS ne suit pas le destin… il l’impose. »
╚═════ஜ۩۞۩ஜ═════╝`;

            // Envoi image + texte
            await sock.sendMessage(from, {
                image: { url: "https://files.catbox.moe/8wdhxw.jpg" },
                caption: ownerText
            }, { quoted: msg });

            // Envoi audio
            await sock.sendMessage(from, {
                audio: { url: "https://files.catbox.moe/2xiqsl.mp4" },
                mimetype: "audio/mpeg"
            }, { quoted: msg });

        } catch (err) {
            console.error("Erreur owner:", err);

            await sock.sendMessage(msg.key.remoteJid, {
                text: "⚠️ Impossible d’afficher les informations sur les créateurs."
            }, { quoted: msg });
        }
    }
};