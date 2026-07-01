import fetch from "node-fetch"

export const name = "weather";

export async function execute(sock,msg,args){

const from = msg.key.remoteJid

if(!args.length){
return sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:`❌ Donne une ville

Exemple :
!weather Paris

BY DEV HACKER`
},{quoted:msg})
}

const city = args.join(" ")

try{

const res = await fetch(`https://wttr.in/${city}?format=j1`)
const data = await res.json()

const weather = data.current_condition[0]

const text = `🌍 MÉTÉO

Ville : ${city}
Température : ${weather.temp_C}°C
Vent : ${weather.windspeedKmph} km/h
Humidité : ${weather.humidity}%

BY DEV HACKER`

await sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:text
},{quoted:msg})

}catch{

sock.sendMessage(from,{text:"❌ erreur météo"})
}

}