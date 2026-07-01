/**
 * ╔══════════════════════════════════════════════════════╗
 * ║   KRINYX — Gestion des services (feature flags)     ║
 * ║   Permet à l'admin d'activer/désactiver n'importe    ║
 * ║   quel service du site, avec historique des actions. ║
 * ╚══════════════════════════════════════════════════════╝
 */

import fs   from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const SERVICES_FILE = path.join(__dirname, 'services.json');

/* ════════════════════════════════════════
   DÉFINITION DES SERVICES DISPONIBLES
   (clé = id technique utilisé partout : data-service="...")
════════════════════════════════════════ */
export const SERVICE_CATALOG = [
  { id: 'panel_buy',     label: 'Vente de panel',         group: 'Boutique', redirect: '/panel' },
  { id: 'credit_buy',    label: 'Achat de crédits',       group: 'Boutique', redirect: '/buy' },
  { id: 'bot_deploy',    label: 'Déploiement de bot',     group: 'Boutique', redirect: '/bot' },
  { id: 'register',      label: 'Inscription',            group: 'Compte',   redirect: '/register' },
  { id: 'support',       label: 'Support / Tickets',      group: 'Compte',   redirect: '/support' },
  { id: 'bot_kratosxmd', label: 'Bot KRATOS XMD',         group: 'Bots',     redirect: '/kratos' },
  { id: 'bot_sadeusxmd', label: 'Bot SADEUS XMD',         group: 'Bots',     redirect: '/sadeus' },
  { id: 'bot_hadesxmd',  label: 'Bot HADES XMD',          group: 'Bots',     redirect: '/hades' },
  { id: 'bot_raizelxmd', label: 'Bot RAIZEL XMD',         group: 'Bots',     redirect: '/raizel' },
  { id: 'bot_knutxmd',   label: 'Bot KNUT XMD',           group: 'Bots',     redirect: '/knut' },
  { id: 'bot_rokxd',     label: 'Bot ROK XD',             group: 'Bots',     redirect: '/rokxd' },
  { id: 'bot_kyroxmd',   label: 'Bot KYRO XMD',           group: 'Bots',     redirect: '/kyro' },
];

const DEFAULT_MESSAGE = 'Ce service sera bientôt disponible. Merci de votre patience 🙏';

function defaultState() {
  const services = {};
  for (const s of SERVICE_CATALOG) {
    services[s.id] = { available: true, message: DEFAULT_MESSAGE };
  }
  return { services, history: [] };
}

export function initServicesFile() {
  if (!fs.existsSync(SERVICES_FILE)) {
    fs.writeFileSync(SERVICES_FILE, JSON.stringify(defaultState(), null, 2));
    console.log('  [DB]  services.json créé');
    return;
  }
  // Si de nouveaux services ont été ajoutés au catalogue depuis la dernière exécution,
  // on les insère sans toucher aux réglages existants.
  const data = readServices();
  let changed = false;
  for (const s of SERVICE_CATALOG) {
    if (!data.services[s.id]) {
      data.services[s.id] = { available: true, message: DEFAULT_MESSAGE };
      changed = true;
    }
  }
  if (changed) writeServices(data);
}

export function readServices() {
  try {
    const raw = JSON.parse(fs.readFileSync(SERVICES_FILE, 'utf8'));
    if (!raw.history) raw.history = [];
    if (!raw.services) raw.services = {};
    return raw;
  } catch {
    return defaultState();
  }
}

export function writeServices(data) {
  fs.writeFileSync(SERVICES_FILE, JSON.stringify(data, null, 2));
}

/** Retourne true si le service est disponible (par défaut true si inconnu, pour ne jamais bloquer par erreur). */
export function isServiceAvailable(serviceId) {
  const data = readServices();
  const svc  = data.services[serviceId];
  return svc ? !!svc.available : true;
}

export function getServiceMessage(serviceId) {
  const data = readServices();
  const svc  = data.services[serviceId];
  return (svc && svc.message) || DEFAULT_MESSAGE;
}

/**
 * Met à jour l'état d'un service et journalise le changement dans l'historique.
 * @param {string} serviceId
 * @param {boolean} available
 * @param {object} admin - { id, username }
 * @param {string} [message] - message personnalisé optionnel affiché aux utilisateurs
 */
export function setServiceAvailability(serviceId, available, admin, message) {
  const data = readServices();
  const before = data.services[serviceId] || { available: true, message: DEFAULT_MESSAGE };
  const after  = {
    available: !!available,
    message: message !== undefined && message !== null && message !== ''
      ? message
      : (before.message || DEFAULT_MESSAGE),
  };
  data.services[serviceId] = after;

  data.history.unshift({
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    serviceId,
    serviceLabel: (SERVICE_CATALOG.find(s => s.id === serviceId) || {}).label || serviceId,
    before: before.available,
    after: after.available,
    adminId: admin?.id ?? null,
    adminUsername: admin?.username || 'Admin',
    date: new Date().toISOString(),
  });
  // On garde un historique borné pour éviter une croissance infinie du fichier.
  if (data.history.length > 500) data.history = data.history.slice(0, 500);

  writeServices(data);
  return after;
}

/** Vue publique : juste id -> {available, message}, sans l'historique. */
export function publicServicesStatus() {
  const data = readServices();
  const out = {};
  for (const s of SERVICE_CATALOG) {
    const svc = data.services[s.id] || { available: true, message: DEFAULT_MESSAGE };
    out[s.id] = { available: svc.available, message: svc.message, redirect: s.redirect };
  }
  return out;
}

/** Vue admin complète : catalogue + état + historique. */
export function adminServicesView() {
  const data = readServices();
  const services = SERVICE_CATALOG.map(s => ({
    ...s,
    available: data.services[s.id] ? !!data.services[s.id].available : true,
    message:   data.services[s.id]?.message || DEFAULT_MESSAGE,
  }));
  return { services, history: data.history };
}

/**
 * Middleware Express à poser sur une route protégée.
 * Bloque la requête avec 503 si le service est désactivé.
 */
export function requireServiceEnabled(serviceId) {
  return (req, res, next) => {
    if (isServiceAvailable(serviceId)) return next();
    return res.status(503).json({
      success: false,
      serviceDisabled: true,
      serviceId,
      message: getServiceMessage(serviceId),
    });
  };
}
