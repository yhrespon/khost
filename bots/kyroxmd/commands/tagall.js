export const name = "tagall";

export async function execute(sock, msg, args){

const from = msg.key.remoteJid;

if(!from.endsWith("@g.us")){
return sock.sendMessage(from,{text:"❌ Cette commande fonctionne seulement dans un groupe."},{quoted:msg});
}

try{

const metadata = await sock.groupMetadata(from);
const participants = metadata.participants;

let text = `📢 MESSAGE POUR TOUT LE GROUPE

Tous les membres sont mentionnés.
Merci de lire attentivement ce message.

`;

let mentions = [];

for(let p of participants){

mentions.push(p.id);
text += `@${p.id.split("@")[0]}\n`;

}

let pp;

try{
pp = await sock.profilePictureUrl(from,"image");
}catch{
pp = "https://files.catbox.moe/u1c1j5.jpg";
}

await sock.sendMessage(from,{
image:{url:pp},
caption:`${text}

BY DEV HACKER`,
mentions:mentions
},{quoted:msg});

}catch(err){
console.log(err);
}

}