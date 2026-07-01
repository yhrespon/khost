// mute.js
export default {
    name: "mute",
    description: "Ferme le groupe (seuls les admins peuvent envoyer des messages)",

    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        // Vérifie si c'est un groupe
        if (!from.endsWith("@g.us")) {
            return await sock.sendMessage(from, {
                text: `╔═════ஜ۩۞۩ஜ═════╗
❌ *Cette commande est réservée aux groupes.*
╚═════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 - 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`
            }, { quoted: msg });
        }

        try {
            // Fermeture du groupe (seuls les admins peuvent envoyer des messages)
            await sock.groupSettingUpdate(from, "announcement");

            await sock.sendMessage(from, {
                text: `╔═════ஜ۩۞۩ஜ═════╗
🔒 *DÉCRET D’HADÈS* 🔒
╚═════ஜ۩۞۩ஜ═════╝

☠️ Le silence s’abat sur ce royaume.
👑 Seuls les administrateurs ont encore voix.
⚔️ Les autres devront attendre la clémence d’Hadès !
`
            }, { quoted: msg });

        } catch (e) {
            console.error("❌ Erreur commande mute :", e);

            await sock.sendMessage(from, {
                text: `╔═════ஜ۩۞۩ஜ═════╗
❌ *Échec du décret !*
╚═════ஜ۩۞۩ஜ═════╝

⚠️ Impossible de fermer le groupe.
Vérifie mes permissions, serviteur.
`
            }, { quoted: msg });
        }
    }
};