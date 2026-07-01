export const name = "inactive";

export async function execute(sock,msg,args){

const from = msg.key.remoteJid;

if(!from.endsWith("@g.us")){
return sock.sendMessage(from,{text:"❌ Groupe uniquement\n\nBY DEV HACKER"},{quoted:msg});
}

try{

const metadata = await sock.groupMetadata(from);
const participants = metadata.participants;

let text = `🖤──────── 𝐈𝐍𝐀𝐂𝐓𝐈𝐕𝐄 - 𝐊𝐘𝐑𝐎 ────────🖤

⚠ Membres peu actifs :

`;

participants.slice(-10).forEach((p,i)=>{
text += `${i+1}. @${p.id.split("@")[0]}\n`
});

text += `

📢 Soyez plus actifs dans le groupe

BY DEV HACKER`

await sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:text,
mentions:participants.map(p=>p.id)
},{quoted:msg});

}catch{

sock.sendMessage(from,{text:"❌ erreur inactive"})
}

}