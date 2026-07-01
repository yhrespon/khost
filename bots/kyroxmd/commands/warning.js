import fs from "fs"

const warnFile="./warn.json"
const wordsFile="./warnWords.json"

if(!fs.existsSync(warnFile)) fs.writeFileSync(warnFile,"{}")
if(!fs.existsSync(wordsFile)) fs.writeFileSync(wordsFile,"{}")

let warns=JSON.parse(fs.readFileSync(warnFile))
let words=JSON.parse(fs.readFileSync(wordsFile))

const saveWarns=()=>fs.writeFileSync(warnFile,JSON.stringify(warns,null,2))
const saveWords=()=>fs.writeFileSync(wordsFile,JSON.stringify(words,null,2))

export const name="warning"

const OWNER_PP="https://files.catbox.moe/xeg87b.jpg"

/* GET PP */

async function getPP(sock,user){

try{
return await sock.profilePictureUrl(user,"image")
}catch{
return OWNER_PP
}

}

/* MESSAGE WARNING */

async function sendWarn(sock,group,user,count,word){

const pp=await getPP(sock,user)

const mention=`@${user.split("@")[0]}`

await sock.sendMessage(group,{
image:{url:pp},
caption:`
⚠️ *AVERTISSEMENT*

👤 ${mention}

🚫 Mot interdit : ${word}

📊 Avertissement : ${count}/3

Respectez les règles du groupe.
`,
mentions:[user]
})

}

/* DETECTION AUTOMATIQUE */

export async function checkForbiddenWord(sock,msg){

const from=msg.key.remoteJid

if(!from.endsWith("@g.us")) return

const sender=msg.key.participant||msg.key.remoteJid

const text=
msg.message?.conversation||
msg.message?.extendedTextMessage?.text||
msg.message?.imageMessage?.caption||
msg.message?.videoMessage?.caption

if(!text) return

const groupWords=words[from]

if(!groupWords) return

const detected=groupWords.find(w=>
text.toLowerCase().includes(w.toLowerCase())
)

if(!detected) return

/* supprimer message */

try{
await sock.sendMessage(from,{delete:msg.key})
}catch{}

/* warn */

if(!warns[sender]) warns[sender]=0

warns[sender]++

saveWarns()

const count=warns[sender]

/* kick */

if(count>=3){

delete warns[sender]
saveWarns()

await sock.groupParticipantsUpdate(from,[sender],"remove")

await sock.sendMessage(from,{
text:`🚫 @${sender.split("@")[0]} expulsé après 3 avertissements.`,
mentions:[sender]
})

return
}

/* envoyer avertissement */

await sendWarn(sock,from,sender,count,detected)

}

/* COMMANDE */

export async function execute(sock,msg,args){

const from=msg.key.remoteJid

if(!from.endsWith("@g.us")){
return sock.sendMessage(from,{text:"❌ Groupe uniquement"})
}

/* MENU */

if(args.length===0){

return sock.sendMessage(from,{
image:{url:OWNER_PP},
caption:`
⚠️ *WARNING SYSTEM*

.warning mot
.warning list
.warning remove mot

BY DEV HACKER / XMD-KYRO V1
`
})

}

/* LIST */

if(args[0]==="list"){

const list=words[from]||[]

return sock.sendMessage(from,{
text:`📌 Mots interdits :

${list.length?list.map(x=>"• "+x).join("\n"):"Aucun"}`
})

}

/* REMOVE */

if(args[0]==="remove" && args[1]){

if(!words[from]) words[from]=[]

const index=words[from].findIndex(
w=>w.toLowerCase()===args[1].toLowerCase()
)

if(index!==-1){

words[from].splice(index,1)

saveWords()

return sock.sendMessage(from,{
text:`✅ Mot supprimé : ${args[1]}`
})

}else{

return sock.sendMessage(from,{
text:"❌ Mot introuvable"
})

}

}

/* ADD */

const word=args.join(" ")

if(!words[from]) words[from]=[]

if(!words[from].includes(word)){

words[from].push(word)

saveWords()

return sock.sendMessage(from,{
text:`✅ Mot interdit ajouté : ${word}`
})

}else{

return sock.sendMessage(from,{
text:"⚠️ Mot déjà enregistré"
})

}

}

export default {execute,checkForbiddenWord}