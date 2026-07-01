import fetch from "node-fetch"

export const name = "openai"

export async function execute(sock,msg,args){

const from = msg.key.remoteJid

if(!args.length){
return sock.sendMessage(from,{text:"❌ Pose une question"})
}

const q = args.join(" ")

try{

const res = await fetch(`https://api.popcat.xyz/chatbot?msg=${q}&owner=Kyro&botname=XMD`)
const data = await res.json()

await sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:`🤖 IA KYRO

${data.response}

BY DEV HACKER`
},{quoted:msg})

}catch{

sock.sendMessage(from,{text:"❌ erreur IA"})
}

}