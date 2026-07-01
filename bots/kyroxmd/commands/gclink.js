export const name = "gclink";

export async function execute(sock, msg, args) {

const from = msg.key.remoteJid

if(!from.endsWith("@g.us")){
return sock.sendMessage(from,{text:"❌ Cette commande fonctionne seulement dans un groupe"})
}

try{

const code = await sock.groupInviteCode(from)

await sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:`🔗 *LIEN DU GROUPE*

https://chat.whatsapp.com/${code}

BY DEV HACKER`
},{quoted:msg})

}catch(err){

sock.sendMessage(from,{text:"❌ Impossible de récupérer le lien"})
}

}