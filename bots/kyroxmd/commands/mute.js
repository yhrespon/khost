export const name = "mute";

export async function execute(sock, msg, args){

const from = msg.key.remoteJid;

if(!from.endsWith("@g.us")){
return sock.sendMessage(from,{text:"❌ Cette commande fonctionne seulement dans un groupe."},{quoted:msg});
}

try{

let pp;

try{
pp = await sock.profilePictureUrl(from,"image");
}catch{
pp = "https://files.catbox.moe/u1c1j5.jpg";
}

await sock.groupSettingUpdate(from,"announcement");

await sock.sendMessage(from,{
image:{url:pp},
caption:`🔒 GROUPE FERMÉ

Le groupe est temporairement fermé par l'administration.
Merci de respecter le calme pendant cette période.

Les discussions sont suspendues pour le moment.
Les administrateurs travaillent actuellement.

Le groupe sera bientôt réouvert.
Merci pour votre patience.

BY DEV HACKER`
},{quoted:msg});

}catch(err){
console.log(err);
}

}