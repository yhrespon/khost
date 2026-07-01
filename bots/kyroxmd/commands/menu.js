export const name = "menu";

export async function execute(sock,msg,args){

const from = msg.key.remoteJid;
const sender = msg.key.participant || msg.key.remoteJid;
const pushname = msg.pushName || "Utilisateur";

const prefix = "!";

function runtime(seconds){

seconds = Number(seconds);

var d = Math.floor(seconds / (3600*24));
var h = Math.floor(seconds % (3600*24) / 3600);
var m = Math.floor(seconds % 3600 / 60);
var s = Math.floor(seconds % 60);

return `${d}j ${h}h ${m}m ${s}s`;
}

const uptime = runtime(process.uptime());

const menu = `🖤──────────── 𝐗𝐌𝐃 𝐕𝟏 - 𝐊𝐘𝐑𝐎 ───────────🖤

"Acceptez mon règne, respectez ma signature."

━━━━━━━━━━━━━━━━━━━━

👤 UTILISATEUR : ${pushname}
⚡ PREFIX : ${prefix}
⏱️ UPTIME : ${uptime}

━━━━━━━━━━━━━━━━━━━━

🛡️ COMMANDES ANTI
• antikickall
• antilink
• antipurge
• antiraid

━━━━━━━━━━━━━━━━━━━━

👥 COMMANDES GROUPE
• add
• demote
• kick
• promote
• tag
• tagall
• hidetag
• mute
• unmute
• lock
• unlock
• setname
• setdesc
• setppgroup
• welcome

━━━━━━━━━━━━━━━━━━━━

⚠️ SYSTÈME WARNING
• warn
• warning
• unwarn
• warnlist
• resetwarn

━━━━━━━━━━━━━━━━━━━━

👑 COMMANDES OWNER
• owner
• sudo
• ban
• purge
• kickall

━━━━━━━━━━━━━━━━━━━━

⚙️ COMMANDES BOT
• ai-kyro
• autoreact
• device
• gclink
• groupeinfo
• info
• ping
• uptime
• menu
• contact

━━━━━━━━━━━━━━━━━━━━

🎵 MÉDIA
• play
• sticker
• url
• vv

━━━━━━━━━━━━━━━━━━━━

🛠️ AUTRES
• hack
• hakers
• kiyotaka
• left
• statuslike
• tagmin
• take
• pp
• xp
• reglement

━━━━━━━━━━━━━━━━━━━━
BY 𝙳𝙴𝚅 𝙷𝙰C𝙺𝙴𝚁
`;

await sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:menu
},{quoted:msg});

}