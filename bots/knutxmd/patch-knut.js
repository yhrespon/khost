/**
 * patch-knut.js
 * Patche les commandes KNUT pour la structure Krinyx
 * Remplace les chemins globaux par des chemins isolés par session
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DST = path.join(__dirname, 'knutxmd/commands');

const REPLACEMENTS = [
  // Import index.js → knut-bridge.js
  ['from "../index.js"',   'from "../knut-bridge.js"'],
  ["from '../index.js'",   "from '../knut-bridge.js'"],

  // ── group.json ──────────────────────────────────────────
  ['"./bots/knutxmd/group.json"',       '"./bots/knutxmd/group.json"'],   // déjà bon
  ['path.resolve("./bots/knutxmd/group.json")', 'path.resolve("./bots/knutxmd/group.json")'],

  // ── antidelete JSON ─────────────────────────────────────
  ['"./antidelete-groupes.json"',  '"./bots/knutxmd/antidelete-groupes.json"'],
  ["'./antidelete-groupes.json'",  "'./bots/knutxmd/antidelete-groupes.json'"],
  ['path.resolve("./antidelete-groupes.json")', 'path.resolve("./bots/knutxmd/antidelete-groupes.json")'],
  ['"./antidelete-ib.json"',       '"./bots/knutxmd/antidelete-ib.json"'],
  ["'./antidelete-ib.json'",       "'./bots/knutxmd/antidelete-ib.json'"],
  ['path.resolve("./antidelete-ib.json")', 'path.resolve("./bots/knutxmd/antidelete-ib.json")'],

  // ── sudo / config / jid / respons / modeprefix ──────────
  ['"./bots/knutxmd/sudo.json"',        '"./bots/knutxmd/sudo.json"'],    // déjà bon
  ['"./bots/knutxmd/config.json"',      '"./bots/knutxmd/config.json"'],  // déjà bon
  // config.json racine (vv2.js)
  ['path.join(process.cwd(), "config.json")', 'path.join(process.cwd(), "bots/knutxmd/config.json")'],
  ["path.join(process.cwd(), 'config.json')", "path.join(process.cwd(), 'bots/knutxmd/config.json')"],
  ['"./bots/knutxmd/jid.json"',         '"./bots/knutxmd/jid.json"'],     // déjà bon
  ['"./bots/knutxmd/respons.json"',     '"./bots/knutxmd/respons.json"'], // déjà bon
  ['"./bots/knutxmd/modeprefix.json"',  '"./bots/knutxmd/modeprefix.json"'], // déjà bon
  ['"./bots/knutxmd/kofane.json"',      '"./bots/knutxmd/kofane.json"'],  // déjà bon
  ['"./bots/knutxmd/kgame.json"',       '"./bots/knutxmd/kgame.json"'],   // déjà bon

  // ── respon.mp3 (audiorespon.js, setrespons.js) ───────────
  ['"./respon.mp3"',               '"./bots/knutxmd/respon.mp3"'],
  ["'./respon.mp3'",               "'./bots/knutxmd/respon.mp3'"],
  ['path.resolve("./respon.mp3")', 'path.resolve("./bots/knutxmd/respon.mp3")'],
  ['join(process.cwd(), "respon.mp3")', 'join(process.cwd(), "bots/knutxmd/respon.mp3")'],
  ["join(process.cwd(), 'respon.mp3')", "join(process.cwd(), 'bots/knutxmd/respon.mp3')"],

  // ── dossier temp (sticker, tts, url, knutts, facebook) ──
  ['"../temp"',                    '"../bots/knutxmd/temp"'],
  ["'../temp'",                    "'../bots/knutxmd/temp'"],
  ['"./bots/knutxmd/temp"',             '"./bots/knutxmd/temp"'],         // déjà bon
  ["'./bots/knutxmd/temp'",             "'./bots/knutxmd/temp'"],

  // ── sessions ────────────────────────────────────────────
  ['"./bots/knutxmd/sessions"',         '"./bots/knutxmd/sessions"'],     // déjà bon
];

// Patch spéciaux pour les commandes qui gèrent sudo/config globalement
// On remplace les chemins hardcodés "./sudo.json" par une lecture depuis msg._knut
const SUDO_PATCH = `
// ─── KNUT BRIDGE : sudo isolé par session ───────────────────
function _knutLoadSudo(msg) {
  if (msg?._knut?.getSudo) return msg._knut.getSudo();
  const f = "./bots/knutxmd/sudo.json";
  try { return JSON.parse(require("fs").readFileSync(f,"utf8")); } catch { return []; }
}
function _knutSaveSudo(msg, list) {
  if (msg?._knut?.saveSudo) { msg._knut.saveSudo(list); return; }
  require("fs").writeFileSync("./bots/knutxmd/sudo.json", JSON.stringify(list,null,2));
}
// ────────────────────────────────────────────────────────────
`;

let patched = 0;
let errors  = 0;

const files = fs.readdirSync(DST).filter(f => f.endsWith('.js') && !f.startsWith('.'));

for (const fname of files) {
  const fpath = path.join(DST, fname);
  try {
    let content = fs.readFileSync(fpath, 'utf8');
    for (const [from, to] of REPLACEMENTS) {
      content = content.replaceAll(from, to);
    }
    fs.writeFileSync(fpath, content, 'utf8');
    patched++;
  } catch (err) {
    console.error(`❌ ${fname}: ${err.message}`);
    errors++;
  }
}

console.log(`\n✅ Patch terminé — ${patched} fichiers, ${errors} erreurs`);

// Vérification
const remaining = files.filter(f => {
  const c = fs.readFileSync(path.join(DST, f), 'utf8');
  return c.includes('../index.js');
});
if (remaining.length) {
  console.log(`⚠️  Imports ../index.js restants:`);
  remaining.forEach(f => console.log(`   - ${f}`));
} else {
  console.log(`✅ Aucun import ../index.js restant`);
}
