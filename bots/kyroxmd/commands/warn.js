import fetch from "node-fetch";
import fs from "fs";
export const name = "warn";

const warnFile = "./warn.json";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant;

  let warns = fs.existsSync(warnFile) ? JSON.parse(fs.readFileSync(warnFile)) : {};

  if (!warns[sender]) warns[sender] = 0;
  warns[sender]++;

  fs.writeFileSync(warnFile, JSON.stringify(warns, null, 2));

  const pp = await fetch("https://files.catbox.moe/u1c1j5.jpg").then(r => r.buffer());

  await sock.sendMessage(from, {
    image: pp,
    caption:
`⚠️ AVERTISSEMENT OFFICIEL

@${sender.split("@")[0]} a reçu un avertissement.

Motif : ${args.join(" ") || "non respect des règles"}.

Après plusieurs avertissements, une exclusion pourra être appliquée.

— DEV HAKERS
Bot : XMD V1-KYRO`,
    mentions: [sender]
  });
}