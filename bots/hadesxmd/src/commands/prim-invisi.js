export default {

    name: "prim-invisi",

    description: "Commande réservée aux utilisateurs Premium",

    async execute(sock, msg, args) {

        try {

            const from = msg.key.remoteJid;

        const text = `╔═════ஜ۩۞۩ஜ═════╗
👑   𝐻𝐴𝐷𝐸𝑺 𝑋𝑀𝐷     👑 
╚═════ஜ۩۞۩ஜ═════╝

⚠️ _Cette commande est disponible uniquement pour les membres Premiums._

╔═༶•┈⛧ CONTACT DEV ⛧┈•༶═╗
║ 👑 DEV - RAIZEL & KNUT               
║ 👑 
╚═༶•┈⛧----------------⛧┈•༶═╝`;

            await sock.sendMessage(from, { text }, { quoted: msg });

        } catch (err) {

            console.error("Erreur pri-vortex:", err);

            await sock.sendMessage(msg.key.remoteJid, { text: "❌ Une erreur est survenue." }, { quoted: msg });

        }

    }

};