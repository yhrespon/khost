export const name = "engage";

export async function execute(sock,msg,args){

const from = msg.key.remoteJid;

if(!from.endsWith("@g.us")){
return sock.sendMessage(from,{
text:"❌ Cette commande fonctionne seulement dans un groupe.\n\nBY DEV HACKER"
},{quoted:msg});
}

try{

const metadata = await sock.groupMetadata(from);
const participants = metadata.participants;

const mentions = participants.map(p => p.id);

let text = `🖤────────── 𝐄𝐍𝐆𝐀𝐆𝐄 - 𝐊𝐘𝐑𝐎 ──────────🖤

📢 ACTIVITÉ DU GROUPE

Tout le monde est appelé :

• Réagissez aux messages
• Votez aux sondages
• Participez à la discussion
• Soutenez les membres
• Gardez le groupe actif

━━━━━━━━━━━━━━━━━━

`;

participants.forEach((p,i)=>{
text += `@${p.id.split("@")[0]} `;
});

text += `

━━━━━━━━━━━━━━━━━━
BY DEV HACKER`;

let pp;

try{
pp = await sock.profilePictureUrl(from,"image");
}catch{
pp = "https://files.catbox.moe/u1c1j5.jpg";
}

await sock.sendMessage(from,{
image:{url:pp},
caption:text,
mentions
},{quoted:msg});

}catch(err){

await sock.sendMessage(from,{
text:"❌ Impossible de lancer ENGAGE.\n\nBY DEV HACKER"
},{quoted:msg});

}

}