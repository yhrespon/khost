import fs from "fs";
import fetch from "node-fetch";

export const name = "antilink";

const settingsFile = "./groupSettings.json";
const warnFile = "./warn.json";

export async function execute(sock, msg, args) {

const from = msg.key.remoteJid;

if (!from.endsWith("@g.us")) return;

let settings = fs.existsSync(settingsFile)
? JSON.parse(fs.readFileSync(settingsFile))
: {};

if (!settings[from]) settings[from] = {};

const imageBuffer = await fetch("https://files.catbox.moe/u1c1j5.jpg")
.then(res => res.buffer());

if (args[0] === "on") {

settings[from].antilink = true;

fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));

await sock.sendMessage(from,{
image:imageBuffer,
caption:`🔗 *ANTI-LIEN ACTIVÉ*

J'ai été activé pour sanctionner toute personne qui enverra des liens.

⚠️ Vous avez droit à *2 avertissements*.

Au 3ème lien → *expulsion automatique*

Veuillez respecter les règles.
Pas de lien dans ce groupe.

━━━━━━━━━━━━━━
BY DEV HAKERS`
});

}

else if (args[0] === "off"){

settings[from].antilink = false;

fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));

await sock.sendMessage(from,{
text:"❌ Anti-lien désactivé.\n\nBY DEV HAKERS"
});

}

}