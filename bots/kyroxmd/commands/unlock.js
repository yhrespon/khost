import fetch from "node-fetch";
export const name = "unlock";

export async function execute(sock, msg) {
  const from = msg.key.remoteJid;
  await sock.groupSettingUpdate(from, "not_announcement"); // déverrouille le groupe

  const pp = await fetch("https://files.catbox.moe/u1c1j5.jpg").then(r => r.buffer());

  await sock.sendMessage(from, {
    image: pp,
    caption:
`🔓 GROUPE DÉVERROUILLÉ

Tous les membres peuvent envoyer des messages.

— DEV HAKERS
Bot : XMD V1-KYRO`
  });
}