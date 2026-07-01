export const name = "device";

export async function execute(sock,msg,args){

const from = msg.key.remoteJid

let device="💻 WhatsApp Web / Desktop"

if(msg.key.id.length > 21){
device="📱 Téléphone mobile"
}

await sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:`📲 *APPAREIL*

${device}

BY DEV HACKER`
},{quoted:msg})

}