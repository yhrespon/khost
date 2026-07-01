import fetch from "node-fetch"

export const name = "githubstalk";

export async function execute(sock,msg,args){

const from = msg.key.remoteJid

if(!args.length){
return sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:`❌ Donne un username GitHub

Exemple :
!githubstalk torvalds

BY DEV HACKER`
},{quoted:msg})
}

const user = args[0]

try{

const res = await fetch(`https://api.github.com/users/${user}`)
const data = await res.json()

const text = `🐙 GITHUB STALK

Nom : ${data.name}
User : ${data.login}
Repos : ${data.public_repos}
Followers : ${data.followers}
Following : ${data.following}

BY DEV HACKER`

await sock.sendMessage(from,{
image:{url:data.avatar_url},
caption:text
},{quoted:msg})

}catch{

sock.sendMessage(from,{text:"❌ utilisateur introuvable"})
}

}