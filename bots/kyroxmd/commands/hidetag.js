export const name = "hidetag";

export async function execute(sock, msg, args){

const from = msg.key.remoteJid;

if(!from.endsWith("@g.us")){
return sock.sendMessage(from,{text:"❌ Cette commande fonctionne seulement dans un groupe."},{quoted:msg});
}

try{

const metadata = await sock.groupMetadata(from);
const participants = metadata.participants;

let mentions = [];

for(let p of participants){
mentions.push(p.id);
}

let message = args.join(" ");

if(!message){
message = `📢 MESSAGE IMPORTANT

Tous les membres sont concernés par cette annonce.

Merci de lire attentivement ce message.`;
}

let pp;

try{
pp = await sock.profilePictureUrl(from,"image");
}catch{
pp = "https://files.catbox.moe/u1c1j5.jpg";
}

await sock.sendMessage(from,{
image:{url:pp},
caption:`${message}

BY DEV HACKER`,
mentions:mentions
},{quoted:msg});

}catch(err){
console.log(err);
}

}