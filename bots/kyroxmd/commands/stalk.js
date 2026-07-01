export const name = "stalk";

export async function execute(sock,msg,args){

const from = msg.key.remoteJid;

let target;

if(msg.message?.extendedTextMessage?.contextInfo?.mentionedJid){
target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
}else{
target = msg.key.participant || msg.key.remoteJid;
}

try{

const pp = await sock.profilePictureUrl(target,"image").catch(()=>null);

const number = target.split("@")[0];

const text = `🕵️ 𝐒𝐓𝐀𝐋𝐊 - 𝐊𝐘𝐑𝐎

📱 Numéro : ${number}
📡 WhatsApp : Actif
🔍 Analyse : Terminée

BY DEV HACKER`;

await sock.sendMessage(from,{
image:{url:pp || "https://files.catbox.moe/u1c1j5.jpg"},
caption:text
},{quoted:msg});

}catch{

await sock.sendMessage(from,{
text:"❌ Impossible d'obtenir les infos."
},{quoted:msg});

}

}