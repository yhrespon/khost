export default {
    name: "premium-menu",
    description: "Afficher le menu Premium exclusif",

    async execute(sock, msg, args) {
        try {
            const from = msg.key.remoteJid;

            // 🔹 Réaction initiale sur la commande
            await sock.sendMessage(from, {
                react: {
                    text: "👑", // Réaction Premium
                    key: msg.key,
                },
            });

            // 🔹 Calcul de l’uptime
            const startTime = process.uptime();
            const hours = Math.floor(startTime / 3600);
            const minutes = Math.floor((startTime % 3600) / 60);
            const seconds = Math.floor(startTime % 60);

            let uptime = "";
            if (hours > 0) uptime += `${hours}h `;
            if (minutes > 0) uptime += `${minutes}m `;
            uptime += `${seconds}s`;

            const version = "1.0";
            const seigneur = msg.pushName || "Invité";

            // 🔹 Texte du menu Premium
            const menuText = `╔══════════════════════════╗
       👑 PREMIUM MENU 👑
╚══════════════════════════╝
┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃👤 Seigneur : ${seigneur}
┃🕰️ Uptime   : ${uptime}
┃🧠 Version  : ${version}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛
┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃         『 COMMANDES 』
┃ .prim-vortex (in group)
┃ .prim-invisi 237XXXXXX
┃ .spamx 237XXXXXX
┃ .cerbarus 237XXXXXX 
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛

> 𝙳𝙴𝚅- 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

            // 🔹 Envoi du menu avec image
            await sock.sendMessage(from, {
                image: { url: "https://files.catbox.moe/c0nvz2.jpg" },
                caption: menuText,
            }, { quoted: msg });

            // 🔹 Envoi de l’audio d’intro
            await sock.sendMessage(from, {
                audio: { url: "https://files.catbox.moe/u5x3ed.mp3" },
                mimetype: "audio/mpeg",
            }, { quoted: msg });

        } catch (err) {
            console.error("Erreur premium-menu:", err);
            await sock.sendMessage(msg.key.remoteJid, {
                text: "⚠️ Impossible d’afficher le menu Premium.",
            }, { quoted: msg });
        }
    },
};