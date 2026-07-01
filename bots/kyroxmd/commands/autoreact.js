export const name = "autoreact";

global.autoReact = global.autoReact || false;

export async function execute(sock,msg,args){

const from = msg.key.remoteJid

if(args[0]=="on"){
global.autoReact=true

return sock.sendMessage(from,{
text:"✅ AutoReact activé\n\nBY DEV HACKER"
},{quoted:msg})
}

if(args[0]=="off"){
global.autoReact=false

return sock.sendMessage(from,{
text:"❌ AutoReact désactivé\n\nBY DEV HACKER"
},{quoted:msg})
}

sock.sendMessage(from,{
text:"Utilisation : !autoreact on/off"
},{quoted:msg})

}