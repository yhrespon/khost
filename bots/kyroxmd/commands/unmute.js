export const name = "unmute";

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

await sock.groupSettingUpdate(from,"not_announcement");

await sock.sendMessage(from,{
image:{url:pp},
caption:`🔓 GROUPE OUVERT

Le groupe est maintenant réouvert.

Vous pouvez reprendre les discussions.
Merci d'avoir respecté la pause.

Les conversations sont de nouveau autorisées.

Respectez les règles du groupe.
Bonne discussion à tous !

BY DEV HACKER`
},{quoted:msg});

}catch(err){
console.log(err);
}

}