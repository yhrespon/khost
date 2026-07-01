import fetch from "node-fetch";
export const name = "tagmin";

export async function execute(sock, msg) {
  const from = msg.key.remoteJid;
  const metadata = await sock.groupMetadata(from);

  const admins = metadata.participants
    .filter(u => u.admin !== null)
    .map(u => u.id);

  const pp = await fetch("https://files.catbox.moe/u1c1j5.jpg").then(r => r.buffer());

  await sock.sendMessage(from, {
    image: pp,
    caption:
`🚨 Appel aux administrateurs

${admins.map(a => "@" + a.split("@")[0]).join(" ")}

Merci de vérifier rapidement.

— DEV HAKERS
Bot : XMD V1-KYRO`,
    mentions: admins
  });
}