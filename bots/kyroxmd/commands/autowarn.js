import fs from "fs";

export const name = "autowarn";

const file="./autowarn.json";

if(!fs.existsSync(file)){
fs.writeFileSync(file,JSON.stringify({},null,2));
}

export async function execute(sock,msg,args){

const from=msg.key.remoteJid;

if(!from.endsWith("@g.us")){
return sock.sendMessage(from,{text:"❌ Commande seulement pour les groupes."},{quoted:msg});
}

let settings=JSON.parse(fs.readFileSync(file));

let option=args[0];

if(option==="on"){

settings[from]=true;

fs.writeFileSync(file,JSON.stringify(settings,null,2));

return sock.sendMessage(from,{
text:`✅ AUTOWARN ACTIVÉ

Les membres recevront des avertissements automatiques.

3 warnings = expulsion.

BY DEV HACKER`
},{quoted:msg});

}

if(option==="off"){

settings[from]=false;

fs.writeFileSync(file,JSON.stringify(settings,null,2));

return sock.sendMessage(from,{
text:`❌ AUTOWARN DÉSACTIVÉ

Le système automatique est arrêté.

BY DEV HACKER`
},{quoted:msg});

}

sock.sendMessage(from,{
text:"Usage : !autowarn on / off"
},{quoted:msg});

}