import axios from 'axios';

export const name = "ai-kyro";
export const description = "Pose une question à l'IA Kyro (GPT‑4o).";
export const usage = "!ai-kyro <question>";

export async function execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const query = args.join(" ");

    if(!query){
        await sock.sendMessage(from, {
            image: { url: "https://files.catbox.moe/u1c1j5.jpg" },
            caption: `❌ Veuillez poser une question.\nUsage : !ai-kyro <question>\n\nBY DEV HACKER`
        }, { quoted: msg });
        return;
    }

    await sock.sendMessage(from, {
        image: { url: "https://files.catbox.moe/u1c1j5.jpg" },
        caption: `🤖 L'IA Kyro réfléchit à votre question... Patientez.\n\nBY DEV HACKER`
    }, { quoted: msg });

    try {
        // Appel API GPT-4o de GiftedTech (exemple gratuit)
        const response = await axios.get(`https://api.giftedtech.co.ke/api/ai/gpt4o?apikey=gifted&q=${encodeURIComponent(query)}`);

        if(response.data && response.data.success && response.data.result){
            const answer = response.data.result;

            await sock.sendMessage(from, {
                image: { url: "https://files.catbox.moe/u1c1j5.jpg" },
                caption: `💬 Question : ${query}\n\n🤖 Réponse : ${answer}\n\nBY DEV HACKER`
            }, { quoted: msg });

        } else {
            throw new Error("Réponse invalide de l'API");
        }

    } catch(err){
        console.error("Erreur API ai-kyro :", err);
        await sock.sendMessage(from, {
            image: { url: "https://files.catbox.moe/u1c1j5.jpg" },
            caption: `❌ Une erreur est survenue avec l'IA. Réessaie plus tard.\n\nBY DEV HACKER`
        }, { quoted: msg });
    }
}