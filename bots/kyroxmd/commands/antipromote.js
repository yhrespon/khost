import fs from "fs"
import fetch from "node-fetch"

export const name = "antipromote"

export async function execute(sock,msg,args){

const from = msg.key.remoteJid
if(!from.endsWith("@g.us")) return

const file = "./groupSettings.json"
let settings = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {}

if(!settings[from]) settings[from] = {}

const option = args[0]

const img = await fetch("https://files.catbox.moe/b3yv0e.jpg").then(res=>res.buffer())

if(option === "on"){

settings[from].antipromote = true
fs.writeFileSync(file,JSON.stringify(settings,null,2))

await sock.sendMessage(from,{
image:img,
caption:`🛡️ ANTIPROMOTE ACTIVÉ

Toute tentative de promotion sera automatiquement annulée.

Seul le système de gestion du bot peut attribuer les droits administrateur.

━━━━━━━━━━━━━━
XMD V1-KYRO
BY 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑`
})

}

if(option === "off"){

settings[from].antipromote = false
fs.writeFileSync(file,JSON.stringify(settings,null,2))

await sock.sendMessage(from,{
image:img,
caption:`✅ ANTIPROMOTE DÉSACTIVÉ

Les administrateurs peuvent à nouveau promouvoir des membres.

━━━━━━━━━━━━━━
XMD V1-KYRO
BY 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑`
})

}

}