import fs from "fs";
import path from "path";

// Dossier de stockage des fichiers JSON
const DATA_DIR = path.join(process.cwd(), "hadesxmd/data");

// S'assurer que le dossier existe
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Nettoie/sanitise un jid pour être un nom de fichier sûr
function sanitizeJid(jid = "") {
  return String(jid).replace(/[^a-zA-Z0-9]/g, "_");
}

// Retourne le chemin absolu d'un fichier JSON dans /data
// Si jid est fourni, on crée un fichier spécifique par jid
function filePath(name, jid = "") {
  ensureDataDir();
  const baseName = jid ? `${name}_${sanitizeJid(jid)}.json` : `${name}.json`;
  return path.join(DATA_DIR, baseName);
}

// Lire un fichier JSON
function readJSON(name, jid = "") {
  const fp = filePath(name, jid);
  if (!fs.existsSync(fp)) {
    try { fs.writeFileSync(fp, "{}"); } catch {}
    return {};
  }
  try {
    const raw = fs.readFileSync(fp, "utf8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    console.error(`[dataManager] Erreur lecture ${fp}:`, e.message);
    return {};
  }
}

// Écrire un fichier JSON
function writeJSON(name, data, jid = "") {
  const fp = filePath(name, jid);
  try {
    fs.writeFileSync(fp, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error(`[dataManager] Erreur écriture ${fp}:`, e.message);
    return false;
  }
}

export default { readJSON, writeJSON, filePath, sanitizeJid };