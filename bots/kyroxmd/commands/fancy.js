export const name = "fancy";

export async function execute(sock,msg,args){

const from = msg.key.remoteJid;

if(!args.length){
return sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:`❌ Donne un texte

Exemple :
!fancy kyro bot

BY DEV HACKER`
},{quoted:msg});
}

const text = args.join(" ");

const styles = [

t => t,
t => t.toUpperCase(),
t => t.toLowerCase(),
t => t.split("").join(" "),
t => t.split("").reverse().join(""),
t => "★ " + t + " ★",
t => "✦ " + t + " ✦",
t => "✧ " + t + " ✧",
t => "➤ " + t,
t => "☠ " + t,
t => "☯ " + t,
t => "⚡ " + t,
t => "♛ " + t,
t => "☾ " + t,
t => "☣ " + t,
t => "♤ " + t,
t => "♡ " + t,
t => "♢ " + t,
t => "♧ " + t,
t => "✪ " + t,
t => "✵ " + t,
t => "✺ " + t,
t => "❖ " + t,
t => "❂ " + t,
t => "✿ " + t,
t => "❀ " + t,
t => "⚔ " + t,
t => "🜏 " + t,
t => "☬ " + t,
t => "⛧ " + t,
t => "༒ " + t,
t => "♚ " + t,
t => "♔ " + t,
t => "♕ " + t,
t => "♖ " + t,
t => "♗ " + t,
t => "♘ " + t,
t => "♙ " + t,
t => "⚜ " + t,
t => "☢ " + t

];

let result = `🖤 𝐅𝐀𝐍𝐂𝐘 𝐓𝐄𝐗𝐓 - 𝐊𝐘𝐑𝐎

`;

styles.forEach((fn,i)=>{
result += `${i+1}. ${fn(text)}\n`;
});

result += `

BY DEV HACKER`;

await sock.sendMessage(from,{
image:{url:"https://files.catbox.moe/u1c1j5.jpg"},
caption:result
},{quoted:msg});

}