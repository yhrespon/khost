import mumaker from "mumaker";

const messageTemplates = {
    error: (msg) => ({ text: msg }),
    success: (text, imageUrl) => ({
        image: { url: imageUrl },
        caption: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
✨ Texte : ${text}
🎨 Type : impressive
╚════ஜ۩۞۩ஜ═════╝`
    })
};

export default {
    name: "impressive",
    description: "Génère un texte coloré et peint 3D (.impressive)",

    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid;

        try {
            let text = args.join(' ');
            if (!text && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
                text = quoted.conversation || quoted.extendedTextMessage?.text;
            }

            if (!text) return await sock.sendMessage(chatId, messageTemplates.error("❌ Texte manquant.\nExemple: .impressive Mon texte ici ou en réponse à un message"), { quoted: msg });

            await sock.sendMessage(chatId, { text: "⏳ Génération en cours..." }, { quoted: msg });

            const result = await mumaker.ephoto("https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html", text);
            if (!result?.image) throw new Error("Impossible de générer l'image");

            await sock.sendMessage(chatId, messageTemplates.success(text, result.image), { quoted: msg });
        } catch (error) {
            console.error("Erreur commande impressive:", error);
            await sock.sendMessage(chatId, messageTemplates.error(`❌ Erreur: ${error.message}`), { quoted: msg });
        }
    }
};