export const name = "tag";

export async function execute(sock,msg,args){

const from = msg.key.remoteJid

if(!from.endsWith("@g.us")){
return sock.sendMessage(from,{text:"❌ Commande groupe seulement"})
}

const metadata = await sock.groupMetadata(from)

const participants = metadata.participants.map(p=>p.id)

const text = args.join(" ")

await sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:`📢 ${text}

BY DEV HACKER`,
mentions:participants
},{quoted:msg})

}