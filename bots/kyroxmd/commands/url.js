import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

export const name = "url";
export const description = "Convertit une image, vidéo ou audio en lien de téléchargement.";
export const usage = "!url (en répondant à un média)";

export async function execute(sock, msg, args) {

const from = msg.key.remoteJid;

// Récupère le message cité
const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

if (!quoted) {
await sock.sendMessage(from, {
image: { url: "https://files.catbox.moe/u1c1j5.jpg" },
caption: `❌ Réponds à une image, vidéo ou audio pour générer un lien.\n\nBY DEV HACKER`
}, { quoted: msg });
return;
}

let mediaType = null;
let mediaMessage = null;

if (quoted.imageMessage) {
mediaType = 'image';
mediaMessage = quoted.imageMessage;
} else if (quoted.videoMessage) {
mediaType = 'video';
mediaMessage = quoted.videoMessage;
} else if (quoted.audioMessage) {
mediaType = 'audio';
mediaMessage = quoted.audioMessage;
} else {
await sock.sendMessage(from, {
image: { url: "https://files.catbox.moe/u1c1j5.jpg" },
caption: `❌ Type de média non supporté.\n\nBY DEV HACKER`
}, { quoted: msg });
return;
}

await sock.sendMessage(from, {
image: { url: "https://files.catbox.moe/u1c1j5.jpg" },
caption: `⚙️⏳ Transformation du média en cours... Patiente.\n\nBY DEV HACKER`
}, { quoted: msg });

let filePath = null;

try {
// Téléchargement du média
const stream = await downloadContentFromMessage(mediaMessage, mediaType);
let buffer = Buffer.from([]);
for await (const chunk of stream) {
buffer = Buffer.concat([buffer, chunk]);
}

// Vérification de la taille (max 200 Mo pour Catbox)
const maxSize = 200 * 1024 * 1024;
if (buffer.length > maxSize) throw new Error('Fichier trop volumineux (max 200 Mo)');

const tmpDir = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

let ext = 'jpg';
if (mediaType === 'video') ext = 'mp4';
else if (mediaType === 'audio') ext = 'mp3';

filePath = path.join(tmpDir, `media_${Date.now()}.${ext}`);
fs.writeFileSync(filePath, buffer);

// Upload vers catbox.moe
const form = new FormData();
form.append('reqtype', 'fileupload');
form.append('fileToUpload', fs.createReadStream(filePath));

const uploadRes = await axios.post('https://catbox.moe/user/api.php', form, {
headers: form.getHeaders(),
timeout: 30000
});

const url = uploadRes.data;
fs.unlinkSync(filePath);

await sock.sendMessage(from, {
image: { url: "https://files.catbox.moe/u1c1j5.jpg" },
caption: `✅ URL générée :\n${url}\n\nBY DEV HACKER`
}, { quoted: msg });

} catch (err) {
console.error('Erreur dans url.js :', err);
if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);

await sock.sendMessage(from, {
image: { url: "https://files.catbox.moe/u1c1j5.jpg" },
caption: `❌ Erreur lors de la conversion : ${err.message}\n\nBY DEV HACKER`
}, { quoted: msg });
}

}