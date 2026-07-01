export default {

    name: "left",

    description: "Le bot quitte le groupe avec un dernier message et une image",

    async execute(sock, msg, args) {

        try {

            const from = msg.key.remoteJid;

            // Vérifie que c'est bien un groupe

            if (!from?.endsWith?.("@g.us")) {

                return await sock.sendMessage(from, {

                    text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ Cette invocation ne peut être prononcée qu’au sein d’un cercle sacré (groupe).
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`

                }, { quoted: msg });

            }

            // Texte d’adieu stylisé

  const goodbyeText = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
🌓🤴🏾 Adieu, pauvres âmes...
⚔️ Les flammes d’Hadès se retirent de ce groupe.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

            // Envoi du message avec image

            await sock.sendMessage(from, {

                image: { url: "https://files.catbox.moe/n7tu54.jpg" },

                caption: goodbyeText

            }, { quoted: msg });

            // Quitter le groupe

            await sock.groupLeave(from);

        } catch (err) {

            console.error("❌ Erreur left :", err);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ Les chaînes infernales empêchent Hadès de quitter ce groupe...
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`

            }, { quoted: msg });

        }

    }

};