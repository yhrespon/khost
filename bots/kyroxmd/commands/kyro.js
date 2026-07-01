export const name = "kyro";

export async function execute(sock,msg,args){

const from = msg.key.remoteJid;
const sender = msg.key.participant || msg.key.remoteJid;
const pushname = msg.pushName || "Utilisateur";

function runtime(seconds){
seconds = Number(seconds);
var d = Math.floor(seconds / (3600*24));
var h = Math.floor(seconds % (3600*24) / 3600);
var m = Math.floor(seconds % 3600 / 60);
var s = Math.floor(seconds % 60);
return `${d}j ${h}h ${m}m ${s}s`;
}

const uptime = runtime(process.uptime());

const text = `🖤──────── 𝐗𝐌𝐃 𝐕𝟏 - 𝐊𝐘𝐑𝐎 ────────🖤

👤 Utilisateur : ${pushname}

⚡ Bot : XMD V1 - KYRO
📡 Statut : En ligne
⏱️ Uptime : ${uptime}

🤖 Système :
Bot WhatsApp multi-commandes
Gestion groupes • IA • Média • Outils

━━━━━━━━━━━━━━━━━━

"Acceptez mon règne, respectez ma signature."

BY DEV HACKER`;

await sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:text,
mentions:[sender]
},{quoted:msg});

}