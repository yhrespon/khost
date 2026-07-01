import fetch from "node-fetch";
import fs from "fs";
export const name = "warnlist";

const warnFile = "./warn.json";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant;
  const target = args[0] ? args[0].replace(/@|\s/g,"") + "@s.whatsapp.net" : sender;

  let warns = fs.existsSync(warnFile) ? JSON.parse(fs.readFileSync(warnFile)) : {};
  const count = warns[target] || 0;

  const pp = await fetch("https://files.catbox.moe/u1c1j5.jpg").then(r => r.buffer());

  await sock.sendMessage(from, {
    image: pp,
    caption:
`📊 HISTORIQUE DES AVERTISSEMENTS

@${target.split("@")[0]} : ${count} avertissement(s)

— DEV HAKERS
Bot : XMD V1-KYRO`,
    mentions: [target]
  });
}