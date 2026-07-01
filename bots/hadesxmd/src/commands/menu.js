export default {
    name: "menu",
    description: "Afficher le menu complet des commandes disponibles",

    async execute(sock, msg, args) {
        try {
            const from = msg.key.remoteJid;

            // 🔹 Réaction 👑 sur la commande entrée
            await sock.sendMessage(from, {
                react: {
                    text: "👑", // Emoji de réaction
                    key: msg.key, // Le message sur lequel réagir
                },
            });

            // 🔹 Calcul uptime
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

            // 🔹 Texte du menu
            const menuText = `╔══════════════════════════╗
      👑 HADES XMD 👑
╚══════════════════════════╝
┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃👤 Seigneur : ${seigneur}
┃🕰️ Uptime   : ${uptime}
┃🧠 Version  : ${version}
┃ 🔄mode     :public /private 
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛
┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃           『🧭MENUS』
┃ .premium-menu
┃ .bug-menu 
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛
┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃
┃      『 𝐔𝐓𝐈𝐋𝐒 ⚙️ 』
┃  .hades
┃  .count
┃  .setpp
┃  .clear
┃  .delete
┃  .device
┃  .infos
┃  .infozap
┃  .news
┃  .owner
┃  .weather
┃  .ping
┃  .statusauto on/off
┃  .autorecording
┃  .autoview
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃      『 𝐌𝐄𝐃𝐈𝐀 💾 』
┃  .vv
┃  .play
┃  .img
┃  .photo
┃  .pp
┃  .sticker
┃  .take
┃  .toaudio
┃  .save
┃  .url
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃      『 𝐆𝐑𝐎𝐔𝐏𝐒 👥 』
┃  .add
┃  .av (jeu)
┃  .promote
┃  .demote
┃  .desc
┃  .promoteall
┃  .demoteall
┃  .getlink
┃  .gpp
┃  .mute
┃  .unmute
┃  .mygroups
┃  .purge
┃  .purgeall
┃  .groupinfo
┃  .welcome on/off
┃  .kickall
┃  .kick
┃  .left
┃  .count
┃  .autoreact on/off
┃  .tagall
┃  .tag
┃  .tagadmin
┃  .tagcreator
┃  .respons
┃  .otage 
┃  .setgname
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃      『 𝐏𝐑𝐎𝐓𝐄𝐂𝐓𝐈𝐎𝐍𝐒 🔒 』
┃  .antilink 
┃  .antipromote 
┃  .antispam 
┃  .antibot 
┃  .antidemote 
┃  .antitag 
┃  .antiphoto 
┃  .antivideo
┃  .antimessage 
┃  .anticall
┃  .antiaudio
┃  .antisticker 
┣━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃      『 EDIT🖼️ 』
┃  .1917
┃  .arena
┃  .fire
┃  .glitch 
┃  .impressive
┃  .purple
┃  .snow
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛

> 𝙳𝙴𝚅- 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

            // 🔹 Envoi du menu avec image
            await sock.sendMessage(from, {
                image: { url: "https://files.catbox.moe/vbg0hd.jpg" },
                caption: menuText
            }, { quoted: msg });

            // 🔹 Envoi de l’audio
            await sock.sendMessage(from, {
                audio: { url: "https://files.catbox.moe/4uyqjj.mp4" },
                mimetype: "audio/mpeg"
            }, { quoted: msg });

        } catch (err) {
            console.error("Erreur menu:", err);
            await sock.sendMessage(msg.key.remoteJid, {
                text: "⚠️ Impossible d’afficher le menu."
            }, { quoted: msg });
        }
    }
};