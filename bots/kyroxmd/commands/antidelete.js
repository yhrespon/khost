import fs from "fs"

export const name = "antidelete"

export async function execute(sock,msg,args){

const from = msg.key.remoteJid

const settingsFile = "./groupSettings.json"

let settings = fs.existsSync(settingsFile)
? JSON.parse(fs.readFileSync(settingsFile))
: {}

if(!settings[from]) settings[from] = {}

if(args[0] === "on"){

settings[from].antidelete = true

fs.writeFileSync(settingsFile, JSON.stringify(settings,null,2))

await sock.sendMessage(from,{
text:`🛡️ Anti Delete activé.

Les messages supprimés seront affichés.

━━━━━━━━━━━━━━
BY 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑`
  
})

}

else if(args[0] === "off"){

settings[from].antidelete = false

fs.writeFileSync(settingsFile, JSON.stringify(settings,null,2))

await sock.sendMessage(from,{
text:`❌ Anti Delete désactivé.

━━━━━━━━━━━━━━
BY 𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑`
})

}

}