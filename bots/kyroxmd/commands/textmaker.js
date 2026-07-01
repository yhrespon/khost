export const name = "textmaker";

export async function execute(sock,msg,args){

const from = msg.key.remoteJid;

if(!args.length){
return sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:`❌ Donne un texte

Exemple :
!textmaker KYRO

BY DEV HACKER`
},{quoted:msg});
}

const text = args.join(" ");

const logos = [

`🔥 ${text} 🔥`,
`⚡ ${text} ⚡`,
`☠ ${text} ☠`,
`♛ ${text} ♛`,
`⚔ ${text} ⚔`,
`☢ ${text} ☢`,
`🜏 ${text} 🜏`,
`✦ ${text} ✦`,
`✧ ${text} ✧`,
`★ ${text} ★`

];

let result = `🖤 𝐓𝐄𝐗𝐓𝐌𝐀𝐊𝐄𝐑 - 𝐊𝐘𝐑𝐎

`;

logos.forEach((l,i)=>{
result += `${i+1}. ${l}\n`;
});

result += `

BY DEV HACKER`;

await sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:result
},{quoted:msg});

}