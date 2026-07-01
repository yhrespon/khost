import fetch from "node-fetch"

export const name = "anticall"

export async function execute(sock,msg,args){

const from = msg.key.remoteJid

const img = await fetch("https://files.catbox.moe/b3yv0e.jpg").then(res=>res.buffer())

await sock.sendMessage(from,{
image:img,
caption:`📵 ANTICALL ACTIVÉ

Toute personne qui tente d'appeler le bot sera automatiquement bloquée.

━━━━━━━━━━━━━━
BY DEV 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑`
})

}