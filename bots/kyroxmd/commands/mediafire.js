import fetch from "node-fetch"

export const name = "mediafire"

export async function execute(sock,msg,args){

const from = msg.key.remoteJid

if(!args[0]){
return sock.sendMessage(from,{text:"❌ Donne un lien Mediafire"})
}

try{

const res = await fetch(`https://api.giftedtech.co.ke/api/download/mediafire?apikey=gifted&url=${args[0]}`)
const data = await res.json()

await sock.sendMessage(from,{
document:{url:data.result.download_url},
fileName:data.result.filename
},{quoted:msg})

}catch{

sock.sendMessage(from,{text:"❌ téléchargement impossible"})
}

}