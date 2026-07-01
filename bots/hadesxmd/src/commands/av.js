export default {
    name: "av",
    description: "Jeu Action ou Vérité dans le groupe",

    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        // 🔹 Réaction initiale sur la commande entrée

await sock.sendMessage(from, {

    react: {

        text: "👑", // Emoji de réaction (modifiable selon ton style)

        key: msg.key, // Réagit sur le message de la commande utilisateur

    },

});

        try {
            // Vérifie si c'est un groupe
            if (!from.endsWith("@g.us")) {
                return await sock.sendMessage(from, {
                    text: `╔═════ஜ۩۞۩ஜ═════╗
❌ Cette invocation ne fonctionne que dans un *groupe*.
╚═════ஜ۩۞۩ஜ═════╝`
                }, { quoted: msg });
            }

            // Récupère la liste des membres
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;

            if (!participants || participants.length === 0) {
                return await sock.sendMessage(from, {
                    text: `╔═════ஜ۩۞۩ஜ═════╗
❌ Impossible de sonder les âmes du groupe.
╚═════ஜ۩۞۩ஜ═════╝`
                }, { quoted: msg });
            }

            // Message dramatique de chargement
            await sock.sendMessage(from, {
                text: `╔═════ஜ۩۞۩ஜ═════╗
⏳ Invocation des enfers en cours...
🌑 Les ténèbres choisissent leur cible...
╚═════ஜ۩۞۩ஜ═════╝`
            }, { quoted: msg });

            // Attente dramatique
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Choisir une cible au hasard
            const randomIndex = Math.floor(Math.random() * participants.length);
            const chosen = participants[randomIndex].id;

            // Envoi du défi
            await sock.sendMessage(from, {
                text: `╔═════ஜ۩۞۩ஜ═════╗
🎲 *ACTION OU VÉRITÉ ?* 🎲

👉 @${chosen.split("@")[0]}  
Réponds immédiatement :
⚔️ *Action* ou 👁️ *Vérité* ?
╚═════ஜ۩۞۩ஜ═════╝`,
                mentions: [chosen]
            }, { quoted: msg });

        } catch (error) {
            console.error("❌ Erreur AV:", error);

            await sock.sendMessage(from, {
                text: `╔═════ஜ۩۞۩ஜ═════╗
❌ Une erreur est survenue dans le rituel.
🌑 Les ombres refusent de jouer.
╚═════ஜ۩۞۩ஜ═════╝`
            }, { quoted: msg });
        }
    }
};
