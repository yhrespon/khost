import fetch from "node-fetch";
export const name = "lock";

export async function execute(sock, msg) {
  const from = msg.key.remoteJid;
  await sock.groupSettingUpdate(from, "announcement"); // verrouille le groupe

  const pp = await fetch("https://files.catbox.moe/u1c1j5.jpg").then(r => r.buffer());

  await sock.sendMessage(from, {
    image: pp,
    caption:
`🔒 GROUPE VERROUILLÉ

Seuls les administrateurs peuvent envoyer des messages.

— DEV HACKERS
Bot : XMD V1-KYRO`
  });
}