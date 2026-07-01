"use strict";

import {
makeWASocket,
useMultiFileAuthState,
fetchLatestBaileysVersion,
makeCacheableSignalKeyStore,
DisconnectReason
} from "@whiskeysockets/baileys";

import chalk from "chalk";
import fs from "fs";
import pino from "pino";
import dotenv from "dotenv";
import readline from "readline";
import fetch from "node-fetch";

dotenv.config();

const PREFIX="!"
const AUTH_FOLDER="auth_baileys"

const logger=pino({level:"silent"})

const commands=new Map()
const pluginsPath="./plugins"

const messageStore={}
const warnFile="./warn.json"
const welcomeFile="./welcome.json"
const settingsFile="./groupSettings.json"

if(!fs.existsSync(warnFile)) fs.writeFileSync(warnFile,"{}")
if(!fs.existsSync(welcomeFile)) fs.writeFileSync(welcomeFile,"{}")
if(!fs.existsSync(settingsFile)) fs.writeFileSync(settingsFile,"{}")

let OWNER_NUMBER=null

global.autoReact=false

/* ADMIN CHECK */

async function isAdmin(sock,group,user){

const metadata=await sock.groupMetadata(group)

const admins=metadata.participants
.filter(p=>p.admin!==null)
.map(p=>p.id)

return admins.includes(user)

}

/* LOAD COMMANDS */

async function loadCommands(){

const files=fs.readdirSync(pluginsPath).filter(f=>f.endsWith(".js"))

for(const file of files){

const command=await import(`file://${process.cwd()}/plugins/${file}`)

if(command.name && command.execute){

commands.set(command.name,command)

console.log(chalk.green(`✅ Commande chargée : ${command.name}`))

}

}

}

await loadCommands()

/* ASK NUMBER */

async function askNumber(){

const rl=readline.createInterface({
input:process.stdin,
output:process.stdout
})

return new Promise(resolve=>{

rl.question("📲 Entrez votre numéro WhatsApp : ",number=>{

rl.close()

OWNER_NUMBER=number.trim()

resolve(number.trim())

})

})

}

/* START BOT */

async function startBot(){

const {state,saveCreds}=await useMultiFileAuthState(AUTH_FOLDER)

const {version}=await fetchLatestBaileysVersion()

const sock=makeWASocket({

version,
logger,
auth:{
creds:state.creds,
keys:makeCacheableSignalKeyStore(state.keys,logger)
},
printQRInTerminal:false

})

sock.ev.on("creds.update",saveCreds)

if(!sock.authState?.creds?.registered){

const number=await askNumber()

const code=await sock.requestPairingCode(number)

console.log(chalk.green(`🔐 Pairing Code : ${code}`))

}

/* CONNECTION */

sock.ev.on("connection.update",(update)=>{

const {connection,lastDisconnect}=update

if(connection==="close"){

const shouldReconnect=
lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut

if(shouldReconnect){

console.log("♻️ Reconnexion...")

startBot()

}

}

if(connection==="open"){

console.log(chalk.green("✅ BOT CONNECTÉ"))

}

})

/* ANTICALL */

sock.ev.on("call",async calls=>{

for(const call of calls){

if(call.status==="offer"){

await sock.sendMessage(call.from,{
text:"📵 Les appels sont interdits.\nVous êtes bloqué."
})

await sock.updateBlockStatus(call.from,"block")

}

}

})

/* GROUP PARTICIPANTS UPDATE */

sock.ev.on("group-participants.update",async update=>{

const welcome=JSON.parse(fs.readFileSync(welcomeFile))
const settings=JSON.parse(fs.readFileSync(settingsFile))

if(update.action==="add" && welcome[update.id]){

const metadata=await sock.groupMetadata(update.id)
const groupName=metadata.subject
const memberCount=metadata.participants.length

for(const user of update.participants){

let pp

try{
pp=await sock.profilePictureUrl(user,"image")
}catch{
pp="https://files.catbox.moe/u1c1j5.jpg"
}

await sock.sendMessage(update.id,{
image:{url:pp},
caption:`╔════◇
👋 *BIENVENUE DANS ${groupName}*
╚════◇

Salut @${user.split("@")[0]} !

Nous sommes heureux de t'accueillir dans ce groupe.
Respecte les membres et les règles du groupe.
Participe aux discussions et amuse-toi.

👥 Membres actuels : ${memberCount}

🔥 Profite bien de ton séjour !

BY DEV HACKER`,
mentions:[user]
})

}

}

if(update.action==="promote" && settings[update.id]?.antipromote){

for(const user of update.participants){

await sock.groupParticipantsUpdate(update.id,[user],"demote")

await sock.sendMessage(update.id,{
text:"🚫 Promotion annulée par ANTIPROMOTE"
})

}

}

})

/* ANTIDELETE */

sock.ev.on("messages.update",async updates=>{

for(const update of updates){

if(update.update.message===null){

const key=update.key

const saved=messageStore[key.id]

if(!saved) return

const sender=saved.sender
const from=saved.from

let pp

try{
pp=await sock.profilePictureUrl(sender,"image")
}catch{
pp="https://files.catbox.moe/b3yv0e.jpg"
}

const buffer=await fetch(pp).then(res=>res.buffer())

await sock.sendMessage(from,{
image:buffer,
caption:`🚨 MESSAGE SUPPRIMÉ

👤 @${sender.split("@")[0]}

📝 ${saved.text}`,
mentions:[sender]
})

}

}

})

/* MESSAGES */

sock.ev.on("messages.upsert",async({messages})=>{

const msg=messages[0]

if(!msg.message) return

const from=msg.key.remoteJid
const sender=msg.key.participant||msg.key.remoteJid
const senderNumber=sender.split("@")[0].split(":")[0]

const text=
msg.message.conversation||
msg.message.extendedTextMessage?.text||
msg.message.imageMessage?.caption||
msg.message.videoMessage?.caption

messageStore[msg.key.id]={
sender,
from,
text:text||"message non textuel"
}

if(!text) return

/* AUTOREACT */

if(global.autoReact){

try{
await sock.sendMessage(from,{
react:{
text:"🔥",
key:msg.key
}
})
}catch{}

}

let warns=JSON.parse(fs.readFileSync(warnFile))

/* LOCKCMD */

const groupSettings=JSON.parse(fs.readFileSync(settingsFile))

if(from.endsWith("@g.us") && groupSettings[from]?.lockcmd){

if(senderNumber!==OWNER_NUMBER){

return
}

}

/* ANTILINK */

if(from.endsWith("@g.us") && text.includes("http")){

if(!warns[sender]) warns[sender]=0

warns[sender]++

fs.writeFileSync(warnFile,JSON.stringify(warns,null,2))

if(warns[sender]>=3){

await sock.groupParticipantsUpdate(from,[sender],"remove")

await sock.sendMessage(from,{
text:`🚫 @${senderNumber} expulsé pour lien.`,
mentions:[sender]
})

}else{

await sock.sendMessage(from,{
text:`⚠️ @${senderNumber} avertissement ${warns[sender]}/2`,
mentions:[sender]
})

}

}

/* COMMANDES */

if(!text.startsWith(PREFIX)) return

const args=text.slice(PREFIX.length).trim().split(/ +/)

const commandName=args.shift().toLowerCase()

const command=commands.get(commandName)

if(!command) return

const isOwner=senderNumber===OWNER_NUMBER
let admin=false

if(from.endsWith("@g.us")){
admin=await isAdmin(sock,from,sender)
}

/* COMMANDES DANGEREUSES */

const dangerous=["purge","ban","kick","kickall","promote","demote","lock","unlock"]

if(dangerous.includes(commandName)){

if(!from.endsWith("@g.us")){
return sock.sendMessage(from,{text:"❌ Cette commande fonctionne seulement dans un groupe"})
}

if(!isOwner && !admin){

return sock.sendMessage(from,{
text:"🚫 Seuls le propriétaire du bot ou les admins du groupe peuvent utiliser cette commande."
})

}

}

/* OWNER COMMAND */

if(command.owner && !isOwner){

return sock.sendMessage(from,{
text:"❌ Commande réservée au propriétaire"
})

}

try{

await command.execute(sock,msg,args)

}catch(err){

console.log(err)

}

})

}

startBot()