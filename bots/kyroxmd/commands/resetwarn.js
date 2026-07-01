import fetch from "node-fetch";
import fs from "fs";
export const name = "resetwarn";

const warnFile = "./warn.json";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const target = args[0].replace(/@|\s/g,"") + "@s.whatsapp.net";

  let warns = fs.existsSync(warnFile) ? JSON.parse(fs.readFileSync(warnFile)) : {};
  warns[target] = 0;
  fs.writeFileSync(warnFile, JSON.stringify(warns, null, 2));

  const pp = await fetch("https://files.catbox.moe/u1c1j5.jpg").then(r => r.buffer());

  await sock.sendMessage(from, {
    image: pp,
    caption:
`♻️ RÉINITIALISATION EFFECTUÉE

Les avertissements de @${target.split("@")[0]} ont été remis à zéro.

— DEV HAKERS
Bot : XMD V1-KYRO`,
    mentions: [target]
  });
}