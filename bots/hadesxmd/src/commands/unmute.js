// unmute.js
export default {
    name: "unmute",
    description: "Ouvre le groupe (tout le monde peut envoyer des messages)",

    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        // Vérifier si c'est un groupe
        if (!from.endsWith("@g.us")) {
            return await sock.sendMessage(from, {
                text: `╔═════ஜ۩۞۩ஜ═════╗
❌ *Cette invocation est réservée aux groupes.*
☠️ Les mortels isolés ne peuvent en bénéficier.
╚═════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 - 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`
            }, { quoted: msg });
        }

        try {
            // Ouvrir le groupe (tout le monde peut écrire)
            await sock.groupSettingUpdate(from, "not_announcement");

            const replyText = `╔═════ஜ۩۞۩ஜ═════╗
⚡ *DÉCRET D’HADÈS* ⚡
╚═════ஜ۩۞۩ஜ═════╝

👁️ Les chaînes de silence sont brisées.
💀 Tous les mortels peuvent désormais parler.
🌑 Mais souvenez-vous... Hadès écoute.
`;

            await sock.sendMessage(from, { text: replyText }, { quoted: msg });

        } catch (err) {
            console.error("❌ Hadès XMD : Erreur unmute :", err);

            await sock.sendMessage(from, {
                text: `╔═════ஜ۩۞۩ஜ═════╗
❌ *Échec du décret !*
╚═════ஜ۩۞۩ஜ═════╝

⚠️ Impossible d’ouvrir le groupe.
Vérifie mes permissions, serviteur.
`
            }, { quoted: msg });
        }
    }
};