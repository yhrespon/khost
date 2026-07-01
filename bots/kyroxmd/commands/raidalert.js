export const name = "raidalert";

export async function execute(sock,msg,args){

const from = msg.key.remoteJid;

if(!from.endsWith("@g.us")){
return sock.sendMessage(from,{text:"❌ Groupe uniquement\n\nBY DEV HACKER"},{quoted:msg});
}

const text = `🚨 RAID ALERT ACTIVÉ

Le bot surveillera les entrées massives dans le groupe.

Si beaucoup de personnes rejoignent :
⚠ alerte admin
⚠ surveillance activée

🖤 XMD V1 - KYRO

BY DEV HACKER`;

await sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:text
},{quoted:msg});

}