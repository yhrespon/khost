import fs from "fs";

export const name = "unwarn";

const file = "./warnGroup.json";

if(!fs.existsSync(file)){
fs.writeFileSync(file, JSON.stringify({},null,2));
}

export async function execute(sock,msg,args){

const from = msg.key.remoteJid;

if(!from.endsWith("@g.us")){
return sock.sendMessage(from,{text:"❌ Commande seulement pour les groupes."},{quoted:msg});
}

const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

if(!mentioned){
return sock.sendMessage(from,{text:"❌ Mentionne la personne."},{quoted:msg});
}

let warns = JSON.parse(fs.readFileSync(file));

for(const user of mentioned){

if(!warns[user] || warns[user] === 0){
return sock.sendMessage(from,{text:"❌ Cet utilisateur n'a aucun avertissement."},{quoted:msg});
}

warns[user]--;

let pp;

try{
pp = await sock.profilePictureUrl(from,"image");
}catch{
pp="https://files.catbox.moe/u1c1j5.jpg";
}

await sock.sendMessage(from,{
image:{url:pp},
caption:`✅ AVERTISSEMENT RETIRÉ

@${user.split("@")[0]} a maintenant :

${warns[user]}/3 avertissements.

BY DEV HACKER`,
mentions:[user]
},{quoted:msg});

}

fs.writeFileSync(file,JSON.stringify(warns,null,2));

}