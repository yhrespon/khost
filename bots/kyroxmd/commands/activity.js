export const name = "activity";

export async function execute(sock,msg,args){

const from = msg.key.remoteJid;

if(!from.endsWith("@g.us")){
return sock.sendMessage(from,{
text:"❌ Cette commande fonctionne seulement dans un groupe\n\nBY DEV HACKER"
},{quoted:msg});
}

try{

const metadata = await sock.groupMetadata(from);
const participants = metadata.participants;

let text = `🖤──────── 𝐀𝐂𝐓𝐈𝐕𝐈𝐓𝐘 - 𝐊𝐘𝐑𝐎 ────────🖤

📊 LISTE DES MEMBRES

`;

participants.slice(0,20).forEach((p,i)=>{
text += `${i+1}. @${p.id.split("@")[0]}\n`
});

text += `

⚡ Continuez à participer
⚡ Réagissez aux messages
⚡ Votez aux sondages

BY DEV HACKER`

await sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:text,
mentions:participants.map(p=>p.id)
},{quoted:msg});

}catch{

sock.sendMessage(from,{text:"❌ erreur activity"})
}

}