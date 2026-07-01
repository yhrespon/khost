export default {
    name: "add",
    description: "Ajouter un membre dans un groupe",

    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        // Vérifie si c'est un groupe
        if (!from.endsWith("@g.us")) {
            return await sock.sendMessage(from, {
                text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ *Commande réservée aux groupes seulement.*
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`
            }, { quoted: msg });
        }

        // Vérifie si un numéro est donné
        if (!args.length) {
            return await sock.sendMessage(from, {
                text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
⚠️ *Veuillez entrer un numéro à ajouter.*
Exemple : .add 237699999999
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`
            }, { quoted: msg });
        }

        try {
            let number = args[0].replace(/[^0-9]/g, ""); // Nettoyer le numéro

            if (!number) {
                return await sock.sendMessage(from, {
                    text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ *Numéro invalide.*
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`
                }, { quoted: msg });
            }

            const jid = `${number}@s.whatsapp.net`;

            // Tente d'ajouter le membre
            await sock.groupParticipantsUpdate(from, [jid], "add");

            await sock.sendMessage(from, {
                text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
✅ Le numéro *${number}* a été ajouté avec succès au groupe.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`
            }, { quoted: msg });

        } catch (e) {
            console.error("❌ Erreur commande add :", e);

            await sock.sendMessage(from, {
                text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
⚠️ Impossible d'ajouter ce numéro. Il se peut que :
- Le numéro n’utilise pas WhatsApp
- Il a bloqué l’invitation
- Ou WhatsApp limite l’ajout direct
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`
            }, { quoted: msg });
        }
    }
};