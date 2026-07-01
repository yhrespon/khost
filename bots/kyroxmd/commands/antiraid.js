import fs from "fs"
import fetch from "node-fetch"

export const name = "antiraid"

export async function execute(sock,msg,args){

const from = msg.key.remoteJid
if(!from.endsWith("@g.us")) return

const file="./groupSettings.json"

let settings = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {}

if(!settings[from]) settings[from]={}

const option=args[0]

const img = await fetch("https://files.catbox.moe/b3yv0e.jpg").then(res=>res.buffer())

if(option==="on"){

settings[from].antiraid=true
fs.writeFileSync(file,JSON.stringify(settings,null,2))

await sock.sendMessage(from,{
image:img,
caption:`🚨 ANTIRAID ACTIVÉ

Protection contre les ajouts massifs activée.

Tout ajout suspect sera automatiquement sanctionné.

━━━━━━━━━━━━━━
XMD V1-KYRO
BY DEV HACKERS`
})

}

if(option==="off"){

settings[from].antiraid=false
fs.writeFileSync(file,JSON.stringify(settings,null,2))

await sock.sendMessage(from,{
image:img,
caption:`✅ ANTIRAID DÉSACTIVÉ

La protection contre les raids est maintenant inactive.

━━━━━━━━━━━━━━
XMD V1-KYRO
BY 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑`
})

}

}