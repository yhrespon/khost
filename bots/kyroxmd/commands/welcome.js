export const name = "welcome";

import fs from "fs";

const welcomeFile = "./welcome.json"

export async function execute(sock,msg,args){

const from = msg.key.remoteJid

if(!from.endsWith("@g.us")){
return sock.sendMessage(from,{text:"❌ Commande utilisable seulement dans un groupe"})
}

let welcome = JSON.parse(fs.readFileSync(welcomeFile))

if(args[0] === "on"){

welcome[from] = true
fs.writeFileSync(welcomeFile,JSON.stringify(welcome,null,2))

await sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:`✅ *WELCOME ACTIVÉ*

Les nouveaux membres recevront un message de bienvenue.

BY DEV HACKER`
},{quoted:msg})

}

else if(args[0] === "off"){

delete welcome[from]
fs.writeFileSync(welcomeFile,JSON.stringify(welcome,null,2))

await sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:`❌ *WELCOME DÉSACTIVÉ*

Le message de bienvenue est désactivé.

BY DEV HACKER`
},{quoted:msg})

}

else{

await sock.sendMessage(from,{
text:`Utilisation :

!welcome on
!welcome off`
},{quoted:msg})

}

}