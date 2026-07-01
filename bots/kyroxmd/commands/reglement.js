import fetch from "node-fetch";
export const name = "reglement";

export async function execute(sock, msg) {
  const from = msg.key.remoteJid;
  const pp = await fetch("https://files.catbox.moe/u1c1j5.jpg").then(r => r.buffer());

  await sock.sendMessage(from, {
    image: pp,
    caption:
`📜 RÈGLEMENT OFFICIEL DU GROUPE

1️⃣ Respect obligatoire entre les membres
2️⃣ Les liens non autorisés sont interdits
3️⃣ Spam et flood interdits
4️⃣ Bots non autorisés
5️⃣ Respect des décisions des administrateurs

Tout manquement pourra entraîner un avertissement ou une exclusion.

— DEV HAKERS
Bot : XMD V1-KYRO`
  });
}