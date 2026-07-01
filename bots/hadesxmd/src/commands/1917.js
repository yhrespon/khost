import mumaker from "mumaker";

const messageTemplates = {
    error: (msg) => ({ text: msg }),
    success: (text, imageUrl) => ({
        image: { url: imageUrl },
        caption: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
✨ Texte : ${text}
🎨 Type : 1917
╚════ஜ۩۞۩ஜ═════╝`
    })
};

export default {
    name: "1917",
    description: "Génère un texte style 1917 (.1917)",

    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJi;
       

        try {
            let text = args.join(' ');
            if (!text && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
                text = quoted.conversation || quoted.extendedTextMessage?.text;
            }

            if (!text) return await sock.sendMessage(chatId, messageTemplates.error("❌ Texte manquant.\nExemple: .1917 Mon texte ici ou en réponse à un message"), { quoted: msg });

            await sock.sendMessage(chatId, { text: "⏳ Génération en cours..." }, { quoted: msg });

            const result = await mumaker.ephoto("https://en.ephoto360.com/1917-style-text-effect-523.html", text);
            if (!result?.image) throw new Error("Impossible de générer l'image");

            await sock.sendMessage(chatId, messageTemplates.success(text, result.image), { quoted: msg });
        } catch (error) {
            console.error("Erreur commande 1917:", error);
            await sock.sendMessage(chatId, messageTemplates.error(`❌ Erreur: ${error.message}`), { quoted: msg });
        }
    }
};