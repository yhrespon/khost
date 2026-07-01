import express     from 'express';
import session     from 'express-session';
import bodyParser  from 'body-parser';
import path        from 'path';
import bcrypt      from 'bcryptjs';
import compression from 'compression';
import fs          from 'fs-extra';
import dotenv      from 'dotenv';
import { fileURLToPath } from 'url';
import nodemailer  from 'nodemailer';
import crypto      from 'crypto';
import rokxdRouter  from './bots/rokxd/router.js';
import knutRouter   from './bots/knutxmd/router.js';
import hadesRouter  from './bots/hadesxmd/router.js';
import raizelRouter from './bots/raizelxmd/router.js';
import kratosRouter from './bots/kratosxmd/router.js';
import kyroRouter   from './bots/kyroxmd/router.js';
import sadeusRouter from './bots/sadeusxmd/router.js';
import {
  initServicesFile, publicServicesStatus, adminServicesView,
  setServiceAvailability, requireServiceEnabled, isServiceAvailable, SERVICE_CATALOG,
} from './services.js';
dotenv.config();

// ══════════════════════════════════════════════════════
//  📧  EMAIL — Nodemailer (config via .env)
// ══════════════════════════════════════════════════════
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const EMAIL_NAME = process.env.EMAIL_NAME || 'Krinyx';
const EMAIL_FROM = `"${EMAIL_NAME}" <${EMAIL_USER}>`;
const EMAIL_ENABLED = !!(EMAIL_USER && EMAIL_PASS);

const mailer = EMAIL_ENABLED
  ? nodemailer.createTransport({ service: 'gmail', auth: { user: EMAIL_USER, pass: EMAIL_PASS } })
  : null;

if (EMAIL_ENABLED) {
  mailer.verify((err) => {
    if (err) console.warn('⚠️ [EMAIL] Connexion Gmail échouée:', err.message);
    else     console.log('✅ [EMAIL] Gmail connecté :', EMAIL_USER);
  });
} else {
  console.warn('⚠️ [EMAIL] EMAIL_USER / EMAIL_PASS absents du .env — envoi d\'emails désactivé.');
}

async function sendMail(to, subject, html) {
  if (!EMAIL_ENABLED) {
    console.warn('[EMAIL] Envoi ignoré (non configuré) →', to, '|', subject);
    return false;
  }
  try {
    await mailer.sendMail({ from: EMAIL_FROM, to, subject, html });
    console.log('[EMAIL] Envoyé à', to);
    return true;
  } catch (e) {
    console.error('[EMAIL] Erreur:', e.message);
    return false;
  }
}

function emailTemplate(title, body, btnText, btnUrl) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 20px;
      background: #000000;
      font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
    }

    .email-container {
      max-width: 420px;
      margin: 0 auto;
      background: #050505;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      overflow: hidden;
    }

    .email-header {
      padding: 24px 24px 8px 24px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .logo-img {
      width: 48px;
      height: 48px;
      margin: 0 auto 12px;
      display: block;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .logo-text {
      color: #ffffff;
      margin: 0;
      font-size: 16px;
      letter-spacing: 3px;
      font-weight: 700;
    }

    .logo-sub {
      color: rgba(255, 255, 255, 0.4);
      font-size: 9px;
      letter-spacing: 1.5px;
      margin-top: 4px;
    }

    .email-body {
      padding: 24px;
    }

    .email-title {
      color: #ffffff;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .email-message {
      color: #c0c0c0;
      font-size: 13px;
      line-height: 1.5;
      margin-bottom: 24px;
    }

    .email-btn {
      display: inline-block;
      background: #ffffff;
      color: #000000;
      text-decoration: none;
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 12px;
      border: none;
    }

    .email-footer {
      padding: 14px 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      text-align: center;
      color: rgba(255, 255, 255, 0.25);
      font-size: 9px;
    }

    /* Mode clair - noir et blanc uniquement */
    @media (prefers-color-scheme: light) {
      body {
        background: #f5f5f5;
      }
      .email-container {
        background: #ffffff;
        border-color: rgba(0, 0, 0, 0.1);
      }
      .email-header {
        border-bottom-color: rgba(0, 0, 0, 0.06);
      }
      .logo-img {
        border-color: rgba(0, 0, 0, 0.1);
      }
      .logo-text {
        color: #111111;
      }
      .logo-sub {
        color: rgba(0, 0, 0, 0.4);
      }
      .email-title {
        color: #111111;
      }
      .email-message {
        color: #666666;
      }
      .email-btn {
        background: #111111;
        color: #ffffff;
      }
      .email-footer {
        border-top-color: rgba(0, 0, 0, 0.06);
        color: rgba(0, 0, 0, 0.3);
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="./logo.jpg" alt="Krinyx" class="logo-img" onerror="this.style.display='none'">
      <div class="logo-text">KRINYX</div>
      <div class="logo-sub">BOT MANAGEMENT</div>
    </div>
    <div class="email-body">
      <div class="email-title">${title}</div>
      <div class="email-message">${body}</div>
      ${btnText && btnUrl ? `<a href="${btnUrl}" class="email-btn">${btnText}</a>` : ''}
    </div>
    <div class="email-footer">
      Krinyx — Email automatique
    </div>
  </div>
</body>
</html>`;
}

function getBaseUrl(req) {
  return process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
}

// Tokens en mémoire (token → {email, username, code, expires, type})
const emailTokens = new Map();
function makeToken() { return crypto.randomBytes(32).toString('hex'); }
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of emailTokens) if (v.expires < now) emailTokens.delete(k);
}, 60000);

// ══════════════════════════════════════════════════════
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const app  = express();
const PORT = process.env.PORT || 20395;
const INITIAL_CREDITS = 50;
const PANEL_PRICE     = parseInt(process.env.PANEL_PRICE_CREDITS || '20');
const PANEL_DURATION  = parseInt(process.env.PANEL_DURATION_DAYS || '3');
const USERS_FILE      = path.join(__dirname, 'users.json');
const PANELS_FILE     = path.join(__dirname, 'panels.json');
// Comptes admin bootstrap : définissables via .env (recommandé en prod),
// sinon valeurs par défaut ci-dessous (à changer après le premier démarrage).
const ADMIN_CREDENTIALS = (() => {
  if (process.env.ADMIN_ACCOUNTS) {
    try {
      const parsed = JSON.parse(process.env.ADMIN_ACCOUNTS);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch {
      console.warn('⚠️ [ADMIN] ADMIN_ACCOUNTS mal formé (JSON attendu), utilisation des valeurs par défaut.');
    }
  }
  console.warn('⚠️ [ADMIN] Utilisation des identifiants admin par défaut — définis ADMIN_ACCOUNTS dans .env en production.');
  return [
    { username: 'Raizel', email: 'devraizel@gmail.com',    password: 'Devraizel77' },
    { username: 'Knut',   email: 'knutsteve400@gmail.com', password: 'Knut1204'    }
  ];
})();
const ADMIN_EMAILS = ADMIN_CREDENTIALS.map(a => a.email);

// ══════════════════════════════════════════════════════
// 💰 MONEY FUSION — Config via .env
// ══════════════════════════════════════════════════════
const FUSION_MERCHANT_ID    = process.env.FUSION_MERCHANT_ID || '';
const FUSION_PAY_SLUG       = process.env.FUSION_PAY_SLUG    || '';
const FUSION_SHOP_NAME      = process.env.FUSION_SHOP_NAME   || 'Krinyx';
const FUSION_BASE_PAY_URL   = process.env.FUSION_API_URL
  || `https://pay.moneyfusion.net/${FUSION_SHOP_NAME}/${FUSION_PAY_SLUG}/pay/`;
const FUSION_WEBHOOK_SECRET = process.env.FUSION_WEBHOOK_SECRET || '';
const FUSION_ALLOWED_IP     = process.env.FUSION_ALLOWED_IP || '';         // IP publique du serveur Money Fusion
const APP_URL               = process.env.APP_URL || `http://localhost:${process.env.PORT || 20395}`;
const CREDIT_RATE           = parseInt(process.env.CREDIT_RATE     || '15');   // 1 CR = 15 FCFA
const FUSION_MIN_FCFA       = parseInt(process.env.FUSION_MIN_FCFA || '250');

if (!FUSION_MERCHANT_ID || !FUSION_PAY_SLUG) {
  console.warn('⚠️ [FUSION] FUSION_MERCHANT_ID / FUSION_PAY_SLUG absents du .env — paiements désactivés.');
}
if (!FUSION_ALLOWED_IP) {
  console.warn('⚠️ [FUSION] FUSION_ALLOWED_IP non défini — le webhook refusera toutes les requêtes tant que cette IP n\'est pas configurée.');
}

/* ════════════════════════════════════════
   PTERODACTYL — CONFIG (via .env uniquement)
════════════════════════════════════════ */
const PTERO = {
  url:    process.env.PTERO_URL     || '',
  apiKey: process.env.PTERO_API_KEY || '',
  ram:    parseInt(process.env.PANEL_RAM_MB  || '512'),
  cpu:    parseInt(process.env.PANEL_CPU_PCT || '100'),
  disk:   parseInt(process.env.PANEL_DISK_MB || '1024'),
  _nodeId:      null,
  _nestId:      null,
  _eggId:       null,
  _allocationId: null,
};
const pteroOk = () => !!(PTERO.url && PTERO.apiKey);

async function pteroFetch(endpoint, opts = {}) {
  const { default: fetch } = await import('node-fetch');
  const res = await fetch(`${PTERO.url}/api/application${endpoint}`, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${PTERO.apiKey}`,
      'Content-Type':  'application/json',
      'Accept':        'application/json',
      ...(opts.headers || {})
    }
  });
  if (!res.ok) { const e = await res.text(); throw new Error(`Pterodactyl ${res.status}: ${e}`); }
  return res.json();
}

async function pteroDiscover() {
  if (!pteroOk()) return;
  try {
    console.log('  [PTERO] Découverte automatique des ressources…');
    const nodes = await pteroFetch('/nodes');
    if (!nodes.data?.length) throw new Error('Aucun node trouvé');
    const node = nodes.data[0].attributes;
    PTERO._nodeId = node.id;
    console.log(`  [PTERO] Node     : #${node.id} — ${node.name}`);
    const allocs = await pteroFetch(`/nodes/${node.id}/allocations`);
    const freeAlloc = allocs.data?.find(a => !a.attributes.assigned);
    if (!freeAlloc) throw new Error('Aucune allocation libre sur ce node');
    PTERO._allocationId = freeAlloc.attributes.id;
    console.log(`  [PTERO] Alloc    : #${freeAlloc.attributes.id} — ${freeAlloc.attributes.ip}:${freeAlloc.attributes.port}`);
    const nests = await pteroFetch('/nests');
    if (!nests.data?.length) throw new Error('Aucun nest trouvé');
    const priority = ['bot', 'nodejs', 'node', 'generic'];
    let chosenNest = nests.data.find(n =>
      priority.some(k => n.attributes.name.toLowerCase().includes(k))
    ) || nests.data[0];
    PTERO._nestId = chosenNest.attributes.id;
    console.log(`  [PTERO] Nest     : #${chosenNest.attributes.id} — ${chosenNest.attributes.name}`);
    const eggs = await pteroFetch(`/nests/${PTERO._nestId}/eggs`);
    if (!eggs.data?.length) throw new Error('Aucun egg dans ce nest');
    const eggPriority = ['node.js generic', 'nodejs', 'node', 'generic', 'bot'];
    let chosenEgg = eggs.data.find(e =>
      eggPriority.some(k => e.attributes.name.toLowerCase().includes(k))
    ) || eggs.data[0];
    PTERO._eggId = chosenEgg.attributes.id;
    console.log(`  [PTERO] Egg      : #${chosenEgg.attributes.id} — ${chosenEgg.attributes.name}`);
    console.log('  [PTERO] ✓ Prêt');
  } catch (err) {
    console.error(`  [PTERO] ✗ Découverte échouée : ${err.message}`);
    console.error('  [PTERO] Les panels seront créés sans Pterodactyl (mode local).');
  }
}

async function pteroGetFreeAlloc() {
  if (PTERO._nodeId === null) return null;
  const allocs = await pteroFetch(`/nodes/${PTERO._nodeId}/allocations`);
  const free = allocs.data?.find(a => !a.attributes.assigned);
  if (!free) throw new Error('Plus aucune allocation libre sur le node');
  return free.attributes.id;
}

async function pteroFindUser(cleanUser) {
  try {
    const search = await pteroFetch(`/users?filter[username]=${encodeURIComponent(cleanUser)}`);
    return search.data?.find(u => u.attributes.username === cleanUser)?.attributes || null;
  } catch { return null; }
}

async function pteroFindUserByEmail(email) {
  try {
    const search = await pteroFetch(`/users?filter[email]=${encodeURIComponent(email)}`);
    return search.data?.find(u => u.attributes.email === email)?.attributes || null;
  } catch { return null; }
}

async function pteroUpdateUserPassword(pteroUserId, username, email, password) {
  try {
    await pteroFetch(`/users/${pteroUserId}`, {
      method: 'PATCH',
      body: JSON.stringify({ username, email, first_name: username, last_name: 'Krinyx', password })
    });
    console.log(`  [PTERO] Mot de passe synchronisé pour #${pteroUserId}`);
  } catch (err) {
    console.warn(`  [PTERO] Impossible de sync le mot de passe : ${err.message}`);
  }
}

async function pteroCreateUser(u, email, pw) {
  const cleanUser = u;
  const existing = await pteroFindUser(cleanUser);
  if (existing) {
    console.log(`  [PTERO] Existant #${existing.id} (${existing.username}) — panel supplémentaire`);
    return existing;
  }
  const existingByEmail = await pteroFindUserByEmail(email);
  if (existingByEmail) {
    console.log(`  [PTERO] Existant via email #${existingByEmail.id} (${existingByEmail.username}) — panel supplémentaire`);
    return existingByEmail;
  }
  try {
    const d = await pteroFetch('/users', {
      method: 'POST',
      body: JSON.stringify({ username: cleanUser, email, first_name: u, last_name: 'Krinyx', password: pw })
    });
    console.log(`  [PTERO] Créé #${d.attributes.id} → username: ${d.attributes.username}`);
    return d.attributes;
  } catch (err) {
    if (err.message.includes('422')) {
      const retryByUser  = await pteroFindUser(cleanUser);
      if (retryByUser)  return retryByUser;
      const retryByEmail = await pteroFindUserByEmail(email);
      if (retryByEmail) return retryByEmail;
    }
    throw err;
  }
}

async function pteroCreateServer(name, userId, planLimits = {}) {
  if (PTERO._nestId === null || PTERO._eggId === null)
    throw new Error('Pterodactyl non initialisé — relance pteroDiscover()');
  const egg = await pteroFetch(`/nests/${PTERO._nestId}/eggs/${PTERO._eggId}?include=variables`);
  const env = {};
  (egg.attributes.relationships?.variables?.data || []).forEach(v => {
    env[v.attributes.env_variable] = v.attributes.default_value;
  });
  const allocId = await pteroGetFreeAlloc();
  const limits = {
    memory: planLimits.memory !== undefined ? planLimits.memory : PTERO.ram,
    swap:   0,
    disk:   planLimits.disk   !== undefined ? planLimits.disk   : PTERO.disk,
    io:     planLimits.io     !== undefined ? planLimits.io     : 500,
    cpu:    planLimits.cpu    !== undefined ? planLimits.cpu    : PTERO.cpu,
  };
  const feat = {
    databases:   planLimits.databases   !== undefined ? planLimits.databases   : 1,
    backups:     planLimits.backups     !== undefined ? planLimits.backups     : 1,
    allocations: planLimits.allocations !== undefined ? planLimits.allocations : 1,
  };
  const d = await pteroFetch('/servers', {
    method: 'POST',
    body: JSON.stringify({
      name, user: userId, egg: PTERO._eggId,
      docker_image: egg.attributes.docker_image,
      startup: egg.attributes.startup,
      environment: env, limits, feature_limits: feat,
      allocation: { default: allocId }
    })
  });
  return d.attributes;
}

async function pteroDeleteServer(id) { await pteroFetch(`/servers/${id}`, { method: 'DELETE' }); }
async function pteroDeleteUser(id)   { await pteroFetch(`/users/${id}`,   { method: 'DELETE' }); }

/* ════════════════════════════════════════
   BASE DE DONNÉES — users.json
════════════════════════════════════════ */
function readUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); }
  catch { return { users: [], nextId: 1 }; }
}
function writeUsers(db) { fs.writeFileSync(USERS_FILE, JSON.stringify(db, null, 2)); }
function findUser(predicate) { return readUsers().users.find(predicate) || null; }
function updateUser(id, updates) {
  const db  = readUsers();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  db.users[idx] = { ...db.users[idx], ...updates };
  writeUsers(db);
  return db.users[idx];
}
function deleteUser(id) {
  const db  = readUsers();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) return false;
  db.users.splice(idx, 1);
  writeUsers(db);
  return true;
}

async function initDB() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [], nextId: 1 }, null, 2));
    console.log('  [DB]  users.json créé');
  }
  if (!fs.existsSync(PANELS_FILE))
    fs.writeFileSync(PANELS_FILE, JSON.stringify({ panels: [] }, null, 2));
  initServicesFile();
  for (const a of ADMIN_CREDENTIALS) {
    const exists = findUser(u => u.email === a.email || u.username === a.username);
    if (!exists) {
      const db   = readUsers();
      const hash = await bcrypt.hash(a.password, 10);
      db.users.push({
        id: db.nextId++, username: a.username, email: a.email,
        password: hash, coins: 9999, isadmin: true, status: 'active',
        wa_number: null, referrals: [], createdAt: new Date().toISOString()
      });
      writeUsers(db);
      console.log(`  [DB]  Admin créé : ${a.username}`);
    }
  }
  console.log('  [DB]  users.json initialisé ✓');
}

/* ════════════════════════════════════════
   HELPERS
════════════════════════════════════════ */
const readPanels  = ()   => JSON.parse(fs.readFileSync(PANELS_FILE, 'utf8'));
const writePanels = (db) => fs.writeFileSync(PANELS_FILE, JSON.stringify(db, null, 2));
const genPanelId  = ()   => 'pnl_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
const genPassword = ()   => Math.random().toString(36).slice(2,10) + Math.random().toString(36).slice(2,5).toUpperCase() + Math.floor(Math.random()*900+100);
const addDays     = (n)  => { const d = new Date(); d.setDate(d.getDate()+n); return d.toISOString(); };
const validateEmail = e  => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validatePw  = pw   => {
  if (!pw || pw.length < 8) return 'Minimum 8 caractères.';
  if (!/[A-Z]/.test(pw))   return 'Au moins une majuscule.';
  if (!/[0-9]/.test(pw))   return 'Au moins un chiffre.';
  return null;
};
const safeUser = u => {
  if (!u) return null;
  const { password: _, ...rest } = u;
  return rest;
};

/* ════════════════════════════════════════
   MIDDLEWARE
════════════════════════════════════════ */
const NODE_ENV = process.env.NODE_ENV || 'production';
if (!process.env.SESSION_SECRET) {
  console.warn('⚠️ [SESSION] SESSION_SECRET absent du .env — utilisation d\'une valeur par défaut non sécurisée.');
}

app.disable('x-powered-by');
app.set('trust proxy', 1); // nécessaire derrière un reverse proxy (nginx) sur le VPS
app.use(compression());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(session({
  secret:            process.env.SESSION_SECRET || 'krinyx_rokxd_2025',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge:   1000 * 60 * 60 * 6,
    secure:   process.env.COOKIE_SECURE === 'true', // true si HTTPS géré en amont (nginx + certbot)
    sameSite: 'lax'
  }
}));

app.get('/api/config', (req, res) => {
  res.json({ fusionMerchantId: FUSION_MERCHANT_ID });
});

app.get('/js/services-guard.js', (req, res) => res.sendFile(path.join(__dirname, 'js/services-guard.js')));

/* ════════════════════════════════════════
   SERVICES — Disponibilité pilotée par l'admin
════════════════════════════════════════ */
app.get('/api/services/status', (req, res) => {
  res.json({ success: true, services: publicServicesStatus() });
});

app.get('/rokxd/rok.jpg',        (req, res) => res.sendFile(path.join(__dirname, 'bots/rokxd/rok.jpg')));
app.get('/knutxmd/knut.jpg',     (req, res) => res.sendFile(path.join(__dirname, 'bots/knutxmd/knut.jpg')));
app.get('/hadesxmd/hades.jpg',   (req, res) => res.sendFile(path.join(__dirname, 'bots/hadesxmd/hades.jpg')));
app.get('/raizelxmd/cover.jpg',  (req, res) => res.sendFile(path.join(__dirname, 'bots/raizelxmd/cover.jpg')));
app.get('/kratosxmd/kratos.jpg', (req, res) => res.sendFile(path.join(__dirname, 'bots/kratosxmd/kratos.jpg')));
app.get('/kyroxmd/kyro.jpg',     (req, res) => res.sendFile(path.join(__dirname, 'bots/kyroxmd/kyro.jpg')));
app.get('/sadeusxmd/sadeus.jpg', (req, res) => res.sendFile(path.join(__dirname, 'bots/sadeusxmd/sadeus.jpg')));

/* ════════════════════════════════════════
   AUTH GUARDS
════════════════════════════════════════ */
const requireSession = (req, res, next) => {
  if (!req.session.user) {
    const isApi = req.path.startsWith('/api/') || req.path.startsWith('/rokxd/') || req.xhr;
    return isApi
      ? res.status(401).json({ error: 'Session expirée', redirect: '/pages/login.html' })
      : res.redirect('/pages/login.html');
  }
  next();
};
const requireAdmin = (req, res, next) => {
  if (!req.session.user) return res.redirect('/pages/loginadmin.html');
  const user = findUser(u => u.id === req.session.user.id);
  if (!user?.isadmin) return res.status(403).json({ success: false, message: 'Accès refusé' });
  next();
};

/* ════════════════════════════════════════
   BOTS
════════════════════════════════════════ */
app.use('/rokxd',     rokxdRouter);
app.use('/knutxmd',   knutRouter);
app.use('/hadesxmd',  hadesRouter);
app.use('/raizelxmd', raizelRouter);
app.use('/kratosxmd', kratosRouter);
app.use('/kyroxmd',   kyroRouter);
app.use('/sadeusxmd', sadeusRouter);

/* ════════════════════════════════════════
   SERVICES — Administration (protégé)
════════════════════════════════════════ */
app.get('/api/admin/services', requireSession, requireAdmin, (req, res) => {
  const view = adminServicesView();
  res.json({ success: true, services: view.services, history: view.history });
});

app.put('/api/admin/services/:id', requireSession, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { available, message } = req.body || {};
  const known = SERVICE_CATALOG.some(s => s.id === id);
  if (!known) return res.status(404).json({ success: false, message: 'Service inconnu.' });
  if (typeof available !== 'boolean')
    return res.status(400).json({ success: false, message: '"available" (booléen) requis.' });
  const admin  = findUser(u => u.id === req.session.user.id);
  const result = setServiceAvailability(id, available, { id: admin?.id, username: admin?.username }, message);
  res.json({ success: true, service: { id, ...result } });
});


/* ════════════════════════════════════════
   PAGES HTML
════════════════════════════════════════ */
app.get('/',              (req, res) => req.session.user ? res.sendFile(path.join(__dirname, 'pages/dashboard.html')) : res.redirect('/login'));
app.get('/dashboard',     requireSession, (req, res) => res.sendFile(path.join(__dirname, 'pages/dashboard.html')));
app.get('/buy', requireSession, (req, res) => {
  const html = fs.readFileSync(path.join(__dirname, 'pages/buy.html'), 'utf8');
  const injected = html.replace('</head>', `<script>window.__MID__="${FUSION_MERCHANT_ID}";window.__APP_URL__="${APP_URL}";</script></head>`);
  res.send(injected);
});
app.get('/js/buy.js',     (req, res) => res.sendFile(path.join(__dirname, './js/buy.js')));
app.get('/bot',           (req, res) => {
  if (!isServiceAvailable('bot_deploy')) {
    return res.redirect('/dashboard?service=bot_deploy');
  }
  res.sendFile(path.join(__dirname, 'pages/bot.html'));
});
app.get('/bots',          (req, res) => res.sendFile(path.join(__dirname, 'pages/bots.html')));
app.get('/downloads',     (req, res) => res.sendFile(path.join(__dirname, 'pages/downloads.html')));
app.get('/pair',          (req, res) => res.sendFile(path.join(__dirname, 'pages/pair.html')));
app.get('/knut',          (req, res) => res.sendFile(path.join(__dirname, 'pages/knut.html')));
app.get('/hades',         (req, res) => res.sendFile(path.join(__dirname, 'pages/hades.html')));
app.get('/raizel',        (req, res) => res.sendFile(path.join(__dirname, 'pages/raizel.html')));
app.get('/kratos',        (req, res) => res.sendFile(path.join(__dirname, 'pages/kratos.html')));
app.get('/kyro',          (req, res) => res.sendFile(path.join(__dirname, 'pages/kyro.html')));
app.get('/sadeus',        (req, res) => res.sendFile(path.join(__dirname, 'pages/sadeus.html')));
app.get('/panel',         requireSession, (req, res) => {
  if (!isServiceAvailable('panel_buy')) return res.redirect('/dashboard?service=panel_buy');
  res.sendFile(path.join(__dirname, 'pages/panel.html'));
});
app.get('/profil',        requireSession, (req, res) => res.sendFile(path.join(__dirname, 'pages/profil.html')));
app.get('/admindashboard',requireSession, requireAdmin, (req, res) => res.sendFile(path.join(__dirname, 'pages/admindashboard.html')));
app.get('/login',         (req, res) => res.sendFile(path.join(__dirname, 'pages/login.html')));
app.get('/register',      (req, res) => res.sendFile(path.join(__dirname, 'pages/register.html')));
app.get('/forgot',        (req, res) => res.sendFile(path.join(__dirname, 'pages/forgot.html')));
app.get('/admin-login',   (req, res) => res.sendFile(path.join(__dirname, 'pages/loginadmin.html')));
app.get('/logout',        (req, res) => req.session.destroy(() => res.redirect('/login')));

/* ════════════════════════════════════════
   API — AUTH
════════════════════════════════════════ */
app.post('/api/email/send-code', async (req, res) => {
  try {
    let { username, email, password } = req.body || {};
    username = String(username || '').trim();
    email    = String(email    || '').toLowerCase().trim();
    password = String(password || '');

    if (!username || !email || !password)
      return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
    if (username.length < 3)
      return res.status(400).json({ success: false, message: 'Pseudo trop court (3 min).' });
    if (!validateEmail(email))
      return res.status(400).json({ success: false, message: 'Email invalide.' });
    const pwErr = validatePw(password);
    if (pwErr) return res.status(400).json({ success: false, message: pwErr });

    const exists = findUser(u => u.email === email || u.username === username);
    if (exists) return res.status(409).json({ success: false, message: 'Email ou nom déjà utilisé.' });

    const code6 = String(Math.floor(100000 + Math.random() * 900000));
    const token = makeToken();
    const hash  = await bcrypt.hash(password, 10);

    emailTokens.set(token, {
      code: code6, username, email,
      passHash: hash,
      expires: Date.now() + 600000,
      type: 'register_code'
    });

    const sent = await sendMail(
      email,
      '🔐 Votre code Krinyx : ' + code6,
      emailTemplate(
        'Votre code de vérification',
        `Bonjour <strong style="color:#e8e8f0">${username}</strong>,<br><br>
        Voici votre code pour créer votre compte Krinyx :<br><br>
        <div style="background:#0d0d18;border:2px solid #6366f1;border-radius:12px;padding:18px;text-align:center;margin:16px 0;">
          <span style="font-size:36px;font-weight:900;color:#818cf8;letter-spacing:12px;font-family:monospace;">${code6}</span>
        </div>
        Ce code est valable <strong style="color:#f59e0b;">10 minutes</strong>.<br><br>
        Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
        null, null
      )
    );

    if (!sent) return res.status(500).json({ success: false, message: "Impossible d'envoyer l'email. Vérifiez votre adresse." });
    res.json({ success: true, token, message: 'Code envoyé à ' + email });

  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

app.post('/api/register', requireServiceEnabled('register'), async (req, res) => {
  try {
    let { username, email, token, code, ref } = req.body || {};
    username = String(username || '').trim();
    email    = String(email    || '').toLowerCase().trim();

    if (!username || !email || !token || !code)
      return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });

    const data = emailTokens.get(token);
    if (!data || data.type !== 'register_code')
      return res.status(400).json({ success: false, message: 'Session expirée. Recommencez.' });
    if (data.expires < Date.now()) {
      emailTokens.delete(token);
      return res.status(400).json({ success: false, message: 'Code expiré (10 min). Renvoyez un nouveau code.' });
    }
    if (data.code !== String(code).trim())
      return res.status(400).json({ success: false, message: 'Code incorrect. Vérifiez votre email.' });

    const exists = findUser(u => u.email === data.email || u.username === data.username);
    if (exists) return res.status(409).json({ success: false, message: 'Email ou nom déjà utilisé.' });

    const isAdmin = ADMIN_EMAILS.includes(data.email);
    const refCode = ref || req.session.tempRef || null;
    const db = readUsers();
    const newUser = {
      id:             db.nextId++,
      username:       data.username,
      email:          data.email,
      password:       data.passHash,
      coins:          INITIAL_CREDITS,
      isadmin:        isAdmin,
      status:         'active',
      email_verified: true,
      wa_number:      null,
      referrals:      [],
      createdAt:      new Date().toISOString()
    };
    db.users.push(newUser);
    writeUsers(db);
    emailTokens.delete(token);

    if (refCode && refCode !== data.username) {
      const parrain = findUser(u => u.username === refCode);
      if (parrain && !parrain.referrals.includes(data.username)) {
        updateUser(parrain.id, { coins: parrain.coins + 5, referrals: [...parrain.referrals, data.username] });
      }
    }
    req.session.tempRef = null;

    sendMail(
      data.email,
      '🎉 Bienvenue sur Krinyx !',
      emailTemplate(
        'Compte créé avec succès !',
        `Bonjour <strong style="color:#e8e8f0">${data.username}</strong>,<br><br>
        Votre compte Krinyx est actif. Vous avez reçu <strong style="color:#818cf8;">${INITIAL_CREDITS} crédits</strong> de bienvenue.<br><br>
        Vous pouvez maintenant déployer vos bots WhatsApp.`,
        '🚀 Accéder à Krinyx', APP_URL
      )
    );

    console.log(`  [OK]  Inscription: ${data.username} (id=${newUser.id})`);
    return res.status(201).json({ success: true, message: `Compte créé ! ${INITIAL_CREDITS} crédits offerts.` });

  } catch(err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
    const user = findUser(u => u.email === email.toLowerCase().trim());
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
    if (user.status !== 'active')
      return res.status(403).json({ success: false, message: 'Compte désactivé.' });
    req.session.user = { id: user.id, username: user.username, email: user.email, isAdmin: !!user.isadmin };
    console.log(`  [AUTH] Login: ${user.username}`);
    return res.json({ success: true, message: 'Connecté avec succès !', user: safeUser(user) });
  } catch(err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

app.post('/api/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const norm = (email || '').toLowerCase().trim();
    const user = findUser(u => u.email === norm && u.isadmin === true);
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, message: 'Identifiants admin incorrects.' });
    req.session.user = { id: user.id, username: user.username, email: user.email, isAdmin: true };
    console.log(`  [ADMIN] Login: ${user.username}`);
    return res.json({ success: true, user: safeUser(user) });
  } catch(err) {
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    if (!validateEmail(email))
      return res.status(400).json({ success: false, message: 'Email invalide.' });
    const user = findUser(u => u.email === email);
    if (!user) return res.json({ success: true, message: 'Si cet email est enregistré, vous recevrez un lien.' });

    const token = makeToken();
    emailTokens.set(token, { username: user.username, email, expires: Date.now() + 1800000, type: 'reset' });

    const link = `${APP_URL}/reset-password?token=${token}`;
    await sendMail(
      email,
      '🔑 Réinitialisation de votre mot de passe Krinyx',
      emailTemplate(
        'Réinitialiser votre mot de passe',
        `Bonjour <strong style="color:#e8e8f0">${user.username}</strong>,<br><br>
        Une demande de réinitialisation de mot de passe a été effectuée pour votre compte Krinyx.<br><br>
        Si ce n'est pas vous, ignorez cet email.<br><br>
        <span style="color:#f59e0b;">Ce lien expire dans 30 minutes.</span>`,
        '🔑 Réinitialiser mon mot de passe', link
      )
    );
    res.json({ success: true, message: 'Si cet email est enregistré, vous recevrez un lien.' });

  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

app.get('/api/email/reset/check/:token', (req, res) => {
  const data = emailTokens.get(req.params.token);
  if (!data || data.expires < Date.now() || data.type !== 'reset')
    return res.status(400).json({ success: false, message: 'Lien invalide ou expiré.' });
  res.json({ success: true, username: data.username });
});

app.post('/api/email/reset', async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ success: false, message: 'Données manquantes.' });
    const data = emailTokens.get(token);
    if (!data || data.expires < Date.now() || data.type !== 'reset')
      return res.status(400).json({ success: false, message: 'Lien invalide ou expiré.' });

    const hash = await bcrypt.hash(password, 10);
    updateUser(findUser(u => u.username === data.username)?.id, { password: hash });
    emailTokens.delete(token);

    sendMail(
      data.email,
      '✅ Mot de passe Krinyx modifié',
      emailTemplate(
        'Mot de passe modifié',
        `Bonjour <strong style="color:#e8e8f0">${data.username}</strong>,<br><br>
        Votre mot de passe Krinyx a bien été modifié.<br><br>
        Si vous n'êtes pas à l'origine de cette action, contactez-nous immédiatement.`,
        'Ouvrir Krinyx', APP_URL
      )
    );
    res.json({ success: true, message: 'Mot de passe réinitialisé avec succès.' });

  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

app.get('/reset-password', (req, res) => {
  const token = req.query.token || '';
  res.send(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Krinyx — Nouveau mot de passe</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{min-height:100vh;background:#0a0a0f;display:flex;align-items:center;justify-content:center;font-family:'Segoe UI',sans-serif;padding:20px;}
.card{width:100%;max-width:380px;background:#111118;border:1px solid rgba(99,102,241,0.3);border-radius:18px;padding:32px;text-align:center;position:relative;overflow:hidden;}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#6366f1,#8b5cf6);}
h1{font-size:20px;font-weight:800;color:#e8e8f0;margin-bottom:6px;letter-spacing:2px;}p{font-size:12px;color:#6b7280;margin-bottom:24px;}
label{display:block;font-size:10px;font-weight:700;color:#6b7280;text-align:left;margin-bottom:5px;letter-spacing:1px;text-transform:uppercase;}
input{width:100%;background:#0d0d18;border:1.5px solid rgba(255,255,255,0.06);border-radius:9px;padding:11px 13px;color:#e8e8f0;font-size:14px;outline:none;margin-bottom:14px;}
input:focus{border-color:#6366f1;}button{width:100%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:9px;padding:13px;font-size:14px;font-weight:700;cursor:pointer;}
.msg{margin-top:14px;font-size:13px;min-height:20px;}</style></head><body><div class="card"><h1>KRINYX</h1><p>Entrez votre nouveau mot de passe</p>
  <label>Nouveau mot de passe</label><input type="password" id="p1" placeholder="••••••••" minlength="6"/>
  <label>Confirmer</label><input type="password" id="p2" placeholder="••••••••" minlength="6"/>
  <button onclick="doReset()">Enregistrer</button>
  <div class="msg" id="msg"></div>
</div>
<script>
var TOKEN='${token.replace(/'/g,"\\'")}';
function doReset(){
  var p1=document.getElementById('p1').value,p2=document.getElementById('p2').value,m=document.getElementById('msg');
  if(p1.length<6){m.style.color='#ef4444';m.textContent='Minimum 6 caractères';return;}
  if(p1!==p2){m.style.color='#ef4444';m.textContent='Les mots de passe ne correspondent pas';return;}
  fetch('/api/email/reset/check/'+TOKEN).then(r=>r.json()).then(d=>{
    if(!d.success){m.style.color='#ef4444';m.textContent='Lien invalide ou expiré';return;}
    fetch('/api/email/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:TOKEN,password:p1})})
    .then(r=>r.json()).then(d=>{
      if(d.success){m.style.color='#22c55e';m.textContent='✅ Mot de passe modifié ! Redirection...';setTimeout(()=>window.location.href='/login',2000);}
      else{m.style.color='#ef4444';m.textContent=d.message||'Erreur';}
    });
  }).catch(()=>{m.style.color='#ef4444';m.textContent='Erreur réseau';});
}
</script></body></html>`);
});

/* ════════════════════════════════════════
   API — SESSION / USER
════════════════════════════════════════ */
app.get('/api/me', requireSession, (req, res) => {
  const user = findUser(u => u.id === req.session.user.id);
  if (!user) return res.status(404).json({ success: false });
  return res.json({ success: true, user: safeUser(user) });
});

app.post('/api/me/update', requireSession, (req, res) => {
  const allowed = ['panelPassword'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  if (!Object.keys(updates).length)
    return res.status(400).json({ success: false, message: 'Aucun champ valide.' });
  updateUser(req.session.user.id, updates);
  return res.json({ success: true });
});

app.get('/api/bot/status', requireSession, (req, res) => {
  const user = findUser(u => u.id === req.session.user.id);
  if (!user) return res.json({ success: false });
  return res.json({ success: true, credits: user.coins, botReady: true, username: user.username, wa_number: user.wa_number || null });
});

app.post('/api/bot/link', (req, res) => {
  const { number, userId } = req.body || {};
  if (!number) return res.status(400).json({ success: false, message: 'number requis.' });
  const id = parseInt(userId) || req.session?.user?.id;
  if (!id) return res.status(400).json({ success: false, message: 'userId requis.' });
  updateUser(id, { wa_number: number });
  console.log(`  [BOT] Numéro ${number} lié à user #${id}`);
  return res.json({ success: true });
});

app.post('/api/bot/unlink', requireSession, (req, res) => {
  updateUser(req.session.user.id, { wa_number: null });
  return res.json({ success: true });
});

/* ════════════════════════════════════════
   API — BOT ACCESS / VALIDITY
════════════════════════════════════════ */
function isBotAccessValid(user, botKey) {
  if (!user.botAccess) return false;
  if (user.botAccess.premium && new Date(user.botAccess.premium.expiresAt) > new Date()) return true;
  const entry = user.botAccess[botKey];
  if (!entry) return false;
  return new Date(entry.expiresAt) > new Date();
}

app.get('/api/bot/validity', requireSession, (req, res) => {
  const user = findUser(u => u.id === req.session.user.id);
  if (!user) return res.status(404).json({ success: false });
  const accesses = user.botAccess || {};
  const now = new Date();
  const active = {};
  for (const [key, val] of Object.entries(accesses)) {
    if (val && val.expiresAt && new Date(val.expiresAt) > now) active[key] = val;
  }
  const premiumActive = active.premium
    ? { active: true, expiresAt: active.premium.expiresAt }
    : { active: false };
  return res.json({ success: true, botAccess: active, premium: premiumActive, coins: user.coins || 0 });
});

app.post('/api/bot/activate', requireSession, async (req, res) => {
  const { botKey, durationHours, cost } = req.body || {};
  const user = findUser(u => u.id === req.session.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
  if (!botKey) return res.status(400).json({ success: false, message: 'botKey requis.' });

  if (botKey !== 'all') {
    const flagId = 'bot_' + botKey;
    const status = publicServicesStatus()[flagId];
    if (status && !status.available) {
      return res.status(503).json({
        success: false, serviceDisabled: true, serviceId: flagId,
        message: status.message || 'Ce bot sera bientôt disponible.',
      });
    }
  }
  if (isBotAccessValid(user, botKey)) {
    const accesses = user.botAccess || {};
    const isPrem = accesses.premium && new Date(accesses.premium.expiresAt) > new Date();
    const entry  = isPrem ? accesses.premium : accesses[botKey];
    console.log(`  [BOT] ${user.username} → redéploie ${botKey} GRATUIT (expire ${entry.expiresAt})`);
    return res.json({ success: true, free: true, botKey, expiresAt: entry.expiresAt, coins: user.coins || 0, message: 'Accès actif — déploiement gratuit !' });
  }
  const creditCost = parseInt(cost) || 0;
  if (creditCost > 0 && (user.coins || 0) < creditCost) {
    return res.status(402).json({ success: false, message: `Crédits insuffisants — ${creditCost} CR requis (solde : ${user.coins || 0} CR).` });
  }
  const hours     = parseInt(durationHours) || 24;
  const expiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
  const newCoins  = Math.max(0, (user.coins || 0) - creditCost);
  const botAccess = user.botAccess || {};
  if (botKey === 'all') {
    botAccess.premium = { expiresAt, purchasedAt: new Date().toISOString(), cost: creditCost };
  } else {
    botAccess[botKey] = { expiresAt, purchasedAt: new Date().toISOString(), cost: creditCost, hours };
  }
  updateUser(user.id, { coins: newCoins, botAccess });
  console.log(`  [BOT] ${user.username} → accès ${botKey} acheté (${creditCost} CR) | expire ${expiresAt}`);
  return res.json({ success: true, free: false, botKey, expiresAt, coins: newCoins, message: `Accès ${botKey} activé jusqu'au ${new Date(expiresAt).toLocaleString('fr-FR')} !` });
});

app.post('/api/bot/check', requireSession, (req, res) => {
  const { botKey } = req.body || {};
  const user = findUser(u => u.id === req.session.user.id);
  if (!user) return res.status(404).json({ success: false });
  const valid    = isBotAccessValid(user, botKey);
  const accesses = user.botAccess || {};
  const isPrem   = accesses.premium && new Date(accesses.premium.expiresAt) > new Date();
  const entry    = isPrem ? accesses.premium : accesses[botKey];
  return res.json({ success: true, hasAccess: valid, expiresAt: valid && entry ? entry.expiresAt : null, coins: user.coins || 0 });
});

app.post('/api/service/activate', requireSession, (req, res) => {
  const { userId, service, cost } = req.body || {};
  const id   = parseInt(userId) || req.session.user.id;
  const user = findUser(u => u.id === id);
  if (!user) return res.status(404).json({ success: false });
  const newCoins = Math.max(0, (user.coins || 0) - (parseInt(cost) || 0));
  updateUser(user.id, { coins: newCoins });
  return res.json({ success: true, coins: newCoins });
});

/* ════════════════════════════════════════
   API — PANELS
════════════════════════════════════════ */
app.get('/api/panels/price', (req, res) =>
  res.json({ success: true, price: PANEL_PRICE, duration: PANEL_DURATION, pteroConfigured: pteroOk() })
);
app.get('/api/panels/user/:userId', requireSession, (req, res) => {
  const db = readPanels();
  return res.json({ success: true, panels: db.panels.filter(p => String(p.userId) === String(req.params.userId)) });
});
app.get('/api/panels', requireSession, requireAdmin, (req, res) =>
  res.json({ success: true, panels: readPanels().panels })
);

const PANEL_PLANS = {
  rokxd_24h:    { bot: 'rokxd',     credits: 7,   duration: 1,  memory: 512,  cpu: 50,  disk: 1024, io: 500, databases: 1, backups: 1, allocations: 0 },
  rokxd_48h:    { bot: 'rokxd',     credits: 10,  duration: 2,  memory: 512,  cpu: 50,  disk: 1024, io: 500, databases: 1, backups: 1, allocations: 0 },
  rokxd_week:   { bot: 'rokxd',     credits: 33,  duration: 7,  memory: 512,  cpu: 50,  disk: 1024, io: 500, databases: 1, backups: 1, allocations: 0 },
  rokxd_month:  { bot: 'rokxd',     credits: 100, duration: 30, memory: 512,  cpu: 50,  disk: 1024, io: 500, databases: 1, backups: 1, allocations: 0 },
  knut_24h:     { bot: 'knutxmd',   credits: 10,  duration: 1,  memory: 1024, cpu: 100, disk: 2048, io: 500, databases: 2, backups: 2, allocations: 0 },
  knut_48h:     { bot: 'knutxmd',   credits: 17,  duration: 2,  memory: 1024, cpu: 100, disk: 2048, io: 500, databases: 2, backups: 2, allocations: 0 },
  knut_week:    { bot: 'knutxmd',   credits: 53,  duration: 7,  memory: 1024, cpu: 100, disk: 2048, io: 500, databases: 2, backups: 2, allocations: 0 },
  knut_month:   { bot: 'knutxmd',   credits: 167, duration: 30, memory: 1024, cpu: 100, disk: 2048, io: 500, databases: 2, backups: 2, allocations: 0 },
  raizel_24h:   { bot: 'raizelxmd', credits: 10,  duration: 1,  memory: 1024, cpu: 100, disk: 2048, io: 500, databases: 2, backups: 2, allocations: 0 },
  raizel_48h:   { bot: 'raizelxmd', credits: 17,  duration: 2,  memory: 1024, cpu: 100, disk: 2048, io: 500, databases: 2, backups: 2, allocations: 0 },
  raizel_week:  { bot: 'raizelxmd', credits: 53,  duration: 7,  memory: 1024, cpu: 100, disk: 2048, io: 500, databases: 2, backups: 2, allocations: 0 },
  raizel_month: { bot: 'raizelxmd', credits: 167, duration: 30, memory: 1024, cpu: 100, disk: 2048, io: 500, databases: 2, backups: 2, allocations: 0 },
  hades_24h:    { bot: 'hadesxmd',  credits: 10,  duration: 1,  memory: 1024, cpu: 100, disk: 2048, io: 500, databases: 2, backups: 2, allocations: 0 },
  hades_48h:    { bot: 'hadesxmd',  credits: 17,  duration: 2,  memory: 1024, cpu: 100, disk: 2048, io: 500, databases: 2, backups: 2, allocations: 0 },
  hades_week:   { bot: 'hadesxmd',  credits: 53,  duration: 7,  memory: 1024, cpu: 100, disk: 2048, io: 500, databases: 2, backups: 2, allocations: 0 },
  hades_month:  { bot: 'hadesxmd',  credits: 167, duration: 30, memory: 1024, cpu: 100, disk: 2048, io: 500, databases: 2, backups: 2, allocations: 0 },
  kyro_24h:     { bot: 'kyroxmd',   credits: 5,   duration: 1,  memory: 512,  cpu: 50,  disk: 1024, io: 500, databases: 1, backups: 1, allocations: 0 },
  kyro_48h:     { bot: 'kyroxmd',   credits: 8,   duration: 2,  memory: 512,  cpu: 50,  disk: 1024, io: 500, databases: 1, backups: 1, allocations: 0 },
  kyro_week:    { bot: 'kyroxmd',   credits: 20,  duration: 7,  memory: 512,  cpu: 50,  disk: 1024, io: 500, databases: 1, backups: 1, allocations: 0 },
  kyro_month:   { bot: 'kyroxmd',   credits: 67,  duration: 30, memory: 512,  cpu: 50,  disk: 1024, io: 500, databases: 1, backups: 1, allocations: 0 },
  kratos_24h:   { bot: 'kratosxmd', credits: 5,   duration: 1,  memory: 512,  cpu: 50,  disk: 1024, io: 500, databases: 1, backups: 1, allocations: 0 },
  kratos_48h:   { bot: 'kratosxmd', credits: 8,   duration: 2,  memory: 512,  cpu: 50,  disk: 1024, io: 500, databases: 1, backups: 1, allocations: 0 },
  kratos_week:  { bot: 'kratosxmd', credits: 20,  duration: 7,  memory: 512,  cpu: 50,  disk: 1024, io: 500, databases: 1, backups: 1, allocations: 0 },
  kratos_month: { bot: 'kratosxmd', credits: 107, duration: 30, memory: 512,  cpu: 50,  disk: 1024, io: 500, databases: 1, backups: 1, allocations: 0 },
  sadeus_24h:   { bot: 'sadeusxmd', credits: 10,  duration: 1,  memory: 1024, cpu: 100, disk: 2048, io: 500, databases: 2, backups: 2, allocations: 0 },
  sadeus_48h:   { bot: 'sadeusxmd', credits: 17,  duration: 2,  memory: 1024, cpu: 100, disk: 2048, io: 500, databases: 2, backups: 2, allocations: 0 },
  sadeus_week:  { bot: 'sadeusxmd', credits: 53,  duration: 7,  memory: 1024, cpu: 100, disk: 2048, io: 500, databases: 2, backups: 2, allocations: 0 },
  sadeus_month: { bot: 'sadeusxmd', credits: 167, duration: 30, memory: 1024, cpu: 100, disk: 2048, io: 500, databases: 2, backups: 2, allocations: 0 },
  premium:      { bot: 'all',       credits: 267, duration: 32, memory: 2048, cpu: 200, disk: 5120, io: 500, databases: 5, backups: 5, allocations: 0 },
};

app.post('/api/panels/buy', requireSession, requireServiceEnabled('panel_buy'), async (req, res) => {
  const { userId, panelName, paymentMethod, plan: planKey,
          ram, cpu, disk, io, databases, backups, duration,
          panelUsername, panelPassword: clientPassword, panelEmail } = req.body || {};
  if (!userId || !panelName)
    return res.status(400).json({ success: false, message: 'userId et panelName requis.' });
  const user = findUser(u => u.id === parseInt(userId));
  if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
  const planCfg  = PANEL_PLANS[planKey] || null;
  const planCost = planCfg ? planCfg.credits : PANEL_PRICE;
  const planDays = planCfg ? planCfg.duration : PANEL_DURATION;
  if (paymentMethod === 'credits' || !paymentMethod) {
    if ((user.coins || 0) < planCost)
      return res.status(402).json({ success: false, message: `Crédits insuffisants. ${planCost} CR requis.` });
    updateUser(user.id, { coins: user.coins - planCost });
  }
  const realEmail = user.username.toLowerCase().replace(/[^a-z0-9_.]/g, '') + '@gmail.com';
  const panelPass = 'Krinyx' + String(Math.floor(Math.random() * 9000) + 1000);
  const planLimits = {
    memory:      ram       !== undefined ? parseInt(ram)       : (planCfg ? planCfg.memory    : PTERO.ram),
    cpu:         cpu       !== undefined ? parseInt(cpu)       : (planCfg ? planCfg.cpu        : PTERO.cpu),
    disk:        disk      !== undefined ? parseInt(disk)      : (planCfg ? planCfg.disk       : PTERO.disk),
    io:          io        !== undefined ? parseInt(io)        : 500,
    databases:   databases !== undefined ? parseInt(databases) : (planCfg ? planCfg.databases  : 1),
    backups:     backups   !== undefined ? parseInt(backups)   : (planCfg ? planCfg.backups    : 1),
    allocations: 0,
  };
  let panelUrl = process.env.PTERO_URL || 'https://panel.krinyx.io';
  let pteroServerId = null, pteroUserId = null;
  if (pteroOk()) {
    try {
      const base             = user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14);
      const suffix           = String(user.id % 100).padStart(2, '0');
      const proposedUsername = 'dh' + base + suffix;
      const ptUser   = await pteroCreateUser(proposedUsername, realEmail, panelPass);
      pteroUserId    = ptUser.id;
      const realPteroUser = ptUser.username;
      if (!user.panelUser) updateUser(user.id, { panelUser: realPteroUser, panelPassword: panelPass });
      const savedUser = findUser(u => u.id === user.id);
      const finalUser = savedUser && savedUser.panelUser ? savedUser.panelUser : realPteroUser;
      const finalPass = savedUser && savedUser.panelPassword ? savedUser.panelPassword : panelPass;
      const ptServer = await pteroCreateServer(panelName, pteroUserId, planLimits);
      pteroServerId  = ptServer.id;
      panelUrl       = PTERO.url;
      const expDays  = duration ? parseInt(duration) : planDays;
      const newPanel = {
        id: genPanelId(), userId: String(user.id), username: user.username,
        name: panelName, plan: planKey || 'basic',
        panelUser: finalUser, panelPassword: finalPass, panelEmail: realEmail, panelUrl,
        status: 'active', paymentMethod: paymentMethod || 'credits',
        price: planCost, pteroServerId, pteroUserId,
        ram: planLimits.memory, cpu: planLimits.cpu, disk: planLimits.disk,
        createdAt: new Date().toISOString(),
        expiresAt: (() => { const d = new Date(); d.setDate(d.getDate() + expDays); return d.toISOString(); })()
      };
      const panelDb = readPanels(); panelDb.panels.push(newPanel); writePanels(panelDb);
      console.log(`  [PANEL] ${user.username} → ${planKey || 'basic'} (${planCost} CR) | ${finalUser}`);
      return res.status(201).json({ success: true, message: 'Panel créé !', panel: newPanel });
    } catch(err) {
      if (paymentMethod === 'credits' || !paymentMethod) updateUser(user.id, { coins: user.coins });
      console.error('[PTERO ERROR]', err.message);
      return res.status(500).json({ success: false, message: 'Erreur Pterodactyl. Crédits remboursés.' });
    }
  }
  const expDays  = duration ? parseInt(duration) : planDays;
  const fbBase   = user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14);
  const fbSuffix = String(user.id % 100).padStart(2, '0');
  const fallbackUser = ('dh' + fbBase + fbSuffix).toLowerCase();
  updateUser(user.id, { panelUser: fallbackUser, panelPassword: panelPass });
  const newPanel = {
    id: genPanelId(), userId: String(user.id), username: user.username,
    name: panelName, plan: planKey || 'basic',
    panelUser: fallbackUser, panelPassword: panelPass, panelEmail: realEmail, panelUrl,
    status: 'active', paymentMethod: paymentMethod || 'credits',
    price: planCost, pteroServerId, pteroUserId,
    ram: planLimits.memory, cpu: planLimits.cpu, disk: planLimits.disk,
    createdAt: new Date().toISOString(),
    expiresAt: (() => { const d = new Date(); d.setDate(d.getDate() + expDays); return d.toISOString(); })()
  };
  const panelDb = readPanels(); panelDb.panels.push(newPanel); writePanels(panelDb);
  console.log(`  [PANEL] ${user.username} → ${planKey || 'basic'} (${planCost} CR) | ${fallbackUser}`);
  return res.status(201).json({ success: true, message: 'Panel créé !', panel: newPanel });
});

app.post('/api/panels/create-admin', requireSession, requireAdmin, (req, res) => {
  const { userId, panelName, panelUrl, panelUser, panelPassword, expiresAt } = req.body || {};
  if (!userId || !panelName) return res.status(400).json({ success: false });
  const u = findUser(u => u.id === parseInt(userId));
  if (!u) return res.status(404).json({ success: false });
  const newPanel = {
    id: genPanelId(), userId: String(userId), username: u.username,
    name: panelName, panelUser: panelUser || 'dh_' + u.username.toLowerCase() + '_admin',
    panelPassword: panelPassword || genPassword(),
    panelUrl: panelUrl || 'https://panel.krinyx.io',
    status: 'active', paymentMethod: 'admin', price: 0,
    pteroServerId: null, pteroUserId: null,
    createdAt: new Date().toISOString(), expiresAt: expiresAt || addDays(PANEL_DURATION)
  };
  const db = readPanels(); db.panels.push(newPanel); writePanels(db);
  return res.status(201).json({ success: true, panel: newPanel });
});

app.put('/api/panels/:id', requireSession, requireAdmin, (req, res) => {
  const db  = readPanels();
  const idx = db.panels.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false });
  ['name','panelUrl','panelUser','panelPassword','status','expiresAt'].forEach(k => {
    if (req.body[k] !== undefined) db.panels[idx][k] = req.body[k];
  });
  db.panels[idx].updatedAt = new Date().toISOString();
  writePanels(db);
  return res.json({ success: true, panel: db.panels[idx] });
});

app.delete('/api/panels/:id', requireSession, requireAdmin, async (req, res) => {
  const db  = readPanels();
  const idx = db.panels.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false });
  const panel = db.panels[idx];
  if (pteroOk() && panel.pteroServerId) {
    try { await pteroDeleteServer(panel.pteroServerId); if (panel.pteroUserId) await pteroDeleteUser(panel.pteroUserId); } catch {}
  }
  db.panels.splice(idx, 1); writePanels(db);
  return res.json({ success: true, message: 'Panel supprimé.' });
});

/* ════════════════════════════════════════
   API — ADMIN
════════════════════════════════════════ */
app.get('/api/stats', requireSession, requireAdmin, (req, res) => {
  const users  = readUsers().users;
  const panels = readPanels();
  return res.json({ success: true, stats: {
    total:        users.length,
    active:       users.filter(u => u.status === 'active').length,
    banned:       users.filter(u => u.status === 'banned').length,
    admins:       users.filter(u => u.isadmin).length,
    totalCredits: users.reduce((s, u) => s + (u.coins || 0), 0),
    totalPanels:  panels.panels.length
  }});
});

app.get('/api/users', requireSession, requireAdmin, (req, res) => {
  const users = readUsers().users.map(safeUser).reverse();
  return res.json({ success: true, count: users.length, users });
});

app.get('/api/user/:id', requireSession, requireAdmin, (req, res) => {
  const user = findUser(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ success: false });
  return res.json({ success: true, user: safeUser(user) });
});

app.put('/api/user/:id/credits', requireSession, requireAdmin, (req, res) => {
  const { amount, operation = 'add' } = req.body || {};
  const n = parseInt(amount);
  if (isNaN(n)) return res.status(400).json({ success: false });
  const user = findUser(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ success: false });
  let newCoins = user.coins || 0;
  if      (operation === 'set') newCoins = Math.max(0, n);
  else if (operation === 'sub') newCoins = Math.max(0, newCoins - n);
  else                           newCoins = Math.max(0, newCoins + n);
  const updated = updateUser(user.id, { coins: newCoins });
  return res.json({ success: true, user: safeUser(updated) });
});

app.put('/api/user/:id/status', requireSession, requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!['active','banned'].includes(status)) return res.status(400).json({ success: false });
  const updated = updateUser(parseInt(req.params.id), { status });
  if (!updated) return res.status(404).json({ success: false });
  return res.json({ success: true });
});

app.put('/api/user/:id/password', requireSession, requireAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 4)
      return res.json({ success: false, message: 'Mot de passe trop court (min 4 caractères)' });
    const hashed  = await bcrypt.hash(password, 10);
    const updated = updateUser(parseInt(req.params.id), { password: hashed });
    if (!updated) return res.status(404).json({ success: false });
    return res.json({ success: true, message: 'Mot de passe mis à jour' });
  } catch(e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/api/user/:id', requireSession, requireAdmin, (req, res) => {
  const user = findUser(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ success: false });
  if (ADMIN_EMAILS.includes(user.email))
    return res.status(403).json({ success: false, message: 'Impossible de supprimer un admin principal.' });
  deleteUser(user.id);
  return res.json({ success: true });
});

app.post('/admin/clean-sessions', requireSession, requireAdmin, async (req, res) => {
  try {
    const dir = path.join(__dirname, 'bots/rokxd', 'sessions');
    if (!fs.existsSync(dir)) return res.json({ success: 'Aucune session à nettoyer' });
    const items = await fs.readdir(dir);
    let n = 0;
    for (const item of items) {
      if (!fs.existsSync(path.join(dir, item, 'creds.json'))) {
        await fs.remove(path.join(dir, item)); n++;
      }
    }
    res.json({ success: `${n} session(s) nettoyée(s)` });
  } catch(err) { res.json({ error: err.message }); }
});

/* ════════════════════════════════════════
   RESTAURATION DES SESSIONS BOT
════════════════════════════════════════ */
async function restoreSessions() {
  const sessionsDir = path.join(__dirname, 'bots/rokxd', 'sessions');
  if (!fs.existsSync(sessionsDir)) return;
  const dirs = fs.readdirSync(sessionsDir);
  let restored = 0;
  for (const number of dirs) {
    const credsPath = path.join(sessionsDir, number, 'creds.json');
    if (!fs.existsSync(credsPath)) continue;
    try {
      const { default: fetch } = await import('node-fetch');
      await new Promise(r => setTimeout(r, 500 * restored));
      fetch(`http://localhost:${PORT}/rokxd/pair-api/code?number=${number}`)
        .then(r => r.json())
        .then(() => console.log(`  [BOT] Session restaurée: ${number}`))
        .catch(() => {});
      restored++;
    } catch {}
  }
  if (restored > 0) console.log(`  [BOT] ${restored} session(s) à restaurer...`);
}

/* ════════════════════════════════════════
   PAGES SUPPORT & AIDE
════════════════════════════════════════ */
app.get('/help',         (req, res) => res.sendFile(path.join(__dirname, 'pages/help.html')));
app.get('/chatbot',      requireSession, (req, res) => res.sendFile(path.join(__dirname, 'pages/chatbot.html')));
app.get('/support',      requireSession, (req, res) => res.sendFile(path.join(__dirname, 'pages/support.html')));
app.get('/adminsupport', requireSession, requireAdmin, (req, res) => res.sendFile(path.join(__dirname, 'pages/adminsupport.html')));

/* ════════════════════════════════════════
   API — SUPPORT TICKETS
════════════════════════════════════════ */
const TICKETS_FILE = path.join(__dirname, 'tickets.json');
const readTickets  = () => { try { return JSON.parse(fs.readFileSync(TICKETS_FILE,'utf8')); } catch { return { tickets:[], nextId:1 }; }};
const writeTickets = db => fs.writeFileSync(TICKETS_FILE, JSON.stringify(db, null, 2));
if (!fs.existsSync(TICKETS_FILE)) fs.writeFileSync(TICKETS_FILE, JSON.stringify({ tickets:[], nextId:1 }, null, 2));

app.post('/api/support/ticket', requireSession, requireServiceEnabled('support'), (req, res) => {
  const { subject, message } = req.body || {};
  if (!subject || !message) return res.status(400).json({ success: false, message: 'Sujet et message requis.' });
  const user = findUser(u => u.id === req.session.user.id);
  if (!user) return res.status(404).json({ success: false });
  const db = readTickets();
  const ticket = {
    id:        db.nextId++,
    userId:    user.id,
    username:  user.username,
    email:     user.email,
    subject:   String(subject).slice(0, 150),
    message:   String(message).slice(0, 2000),
    status:    'pending',
    adminReply: null,
    repliedBy:  null,
    createdAt:  new Date().toISOString(),
    updatedAt:  new Date().toISOString()
  };
  db.tickets.push(ticket);
  writeTickets(db);
  console.log(`  [SUPPORT] Ticket #${ticket.id} de ${user.username}`);
  return res.status(201).json({ success: true, ticket });
});

app.get('/api/support/my-tickets', requireSession, (req, res) => {
  const db   = readTickets();
  const mine = db.tickets.filter(t => t.userId === req.session.user.id).reverse();
  return res.json({ success: true, tickets: mine });
});

app.get('/api/support/tickets', requireSession, requireAdmin, (req, res) => {
  const db = readTickets();
  return res.json({ success: true, tickets: db.tickets.slice().reverse() });
});

app.put('/api/support/ticket/:id/reply', requireSession, requireAdmin, (req, res) => {
  const { status, reply } = req.body || {};
  if (!['resolved','pending','rejected','waiting'].includes(status))
    return res.status(400).json({ success: false, message: 'Statut invalide.' });
  const db  = readTickets();
  const idx = db.tickets.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false });
  db.tickets[idx].status     = status;
  db.tickets[idx].adminReply = reply || null;
  db.tickets[idx].repliedBy  = req.session.user.username;
  db.tickets[idx].updatedAt  = new Date().toISOString();
  writeTickets(db);
  return res.json({ success: true, ticket: db.tickets[idx] });
});

/* ════════════════════════════════════════
   MONEY FUSION — PAIEMENT DE CRÉDITS
   IP autorisée : 192.168.1.1 (à remplacer par ton IP publique réelle)
════════════════════════════════════════ */

// Middleware : vérification IP Money Fusion sur le webhook uniquement
function checkFusionIP(req, res, next) {
  const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress
    || '';
  const allowed = FUSION_ALLOWED_IP; // 192.168.1.1 → remplace par ton IP publique
  if (clientIP !== allowed && clientIP !== '::ffff:' + allowed) {
    console.warn(`[FUSION WEBHOOK] IP rejetée: ${clientIP} (attendu: ${allowed})`);
    return res.status(403).send('FORBIDDEN');
  }
  next();
}

// ── Init paiement : génère l'URL Money Fusion côté serveur ──
app.post('/api/payment/fusion/init', requireSession, requireServiceEnabled('credit_buy'), (req, res) => {
  const { amountFcfa, nomclient, email } = req.body;
  const user = findUser(u => u.id === req.session.user.id);
  if (!user) return res.status(401).json({ success: false, message: 'Session invalide.' });

  const montant = Math.round(parseFloat(amountFcfa));
  if (!montant || montant < FUSION_MIN_FCFA)
    return res.status(400).json({ success: false, message: `Montant minimum : ${FUSION_MIN_FCFA} FCFA.` });

  const credits   = Math.floor(montant / CREDIT_RATE);
  const paymentId = 'mf_' + Date.now() + '_' + user.id;

  // Sauvegarde du paiement en attente
  const db = readUsers();
  const u  = db.users.find(x => x.id === user.id);
  if (!u) return res.status(404).json({ success: false });
  if (!u.pendingPayments) u.pendingPayments = [];
  u.pendingPayments.push({
    paymentId,
    amountFcfa: montant,
    credits,
    nomclient: nomclient || user.username,
    email: email || user.email,
    createdAt: new Date().toISOString()
  });
  writeUsers(db);

  // Construction URL Money Fusion
  const returnUrl = `${APP_URL}/buy?payment=success`;
  const payUrl = `${FUSION_BASE_PAY_URL}`
    + `?montant=${montant}`
    + `&nomclient=${encodeURIComponent(nomclient || user.username)}`
    + `&email=${encodeURIComponent(email || user.email)}`
    + `&custom_id=${paymentId}`
    + `&return_url=${encodeURIComponent(returnUrl)}`;

  console.log(`[FUSION] Init — user:${user.username} montant:${montant} FCFA credits:${credits} id:${paymentId}`);
  return res.json({ success: true, paymentId, credits, amountFcfa: montant, payUrl });
});

// ── Webhook Money Fusion (appel automatique depuis leurs serveurs) ──
app.post('/api/payment/fusion/webhook', checkFusionIP, async (req, res) => {
  // Vérification secret optionnel
  const secret = req.headers['x-mf-secret'] || req.body?.secret || '';
  if (FUSION_WEBHOOK_SECRET && secret !== FUSION_WEBHOOK_SECRET) {
    console.warn('[FUSION WEBHOOK] Secret invalide, rejeté.');
    return res.status(403).send('FORBIDDEN');
  }

  // Money Fusion peut envoyer payment_id, custom_id ou reference
  const status     = req.body?.status || req.body?.statut || '';
  const payment_id = req.body?.payment_id || req.body?.custom_id || req.body?.reference || '';

  console.log(`[FUSION WEBHOOK] status=${status} payment_id=${payment_id}`);
  res.status(200).send('OK'); // Répondre immédiatement

  if (status !== 'success' && status !== 'paid') return;

  try {
    const db = readUsers();
    const u  = db.users.find(x => (x.pendingPayments || []).some(p => p.paymentId === payment_id));
    if (!u) {
      console.warn(`[FUSION WEBHOOK] payment_id ${payment_id} introuvable.`);
      return;
    }
    if (!u.fusionTokens) u.fusionTokens = [];
    if (u.fusionTokens.includes(payment_id)) {
      console.log(`[FUSION WEBHOOK] ${payment_id} déjà traité, ignoré.`);
      return;
    }
    const pending  = u.pendingPayments.find(p => p.paymentId === payment_id);
    const montant  = pending?.amountFcfa || 0;
    const credits  = Math.floor(montant / CREDIT_RATE);
    if (credits <= 0) return;

    const coinsAvant = u.coins || 0;
    u.coins          = coinsAvant + credits;
    u.fusionTokens.push(payment_id);
    u.pendingPayments = (u.pendingPayments || []).filter(p => p.paymentId !== payment_id);
    if (!u.rechargeHistory) u.rechargeHistory = [];
    u.rechargeHistory.unshift({
      token:          payment_id,
      amountFcfa:     montant,
      credits,
      coinsAvant,
      coinsApres:     u.coins,
      tauxConversion: CREDIT_RATE,
      nomclient:      pending?.nomclient || null,
      status:         'paid',
      method:         'moneyfusion',
      date:           new Date().toISOString(),
    });
    writeUsers(db);
    console.log(`[FUSION WEBHOOK] ✅ ${u.username} +${credits} CR (${montant} FCFA) solde: ${coinsAvant} → ${u.coins}`);
  } catch (err) {
    console.error('[FUSION WEBHOOK] Erreur:', err.message);
  }
});

// ── Historique des recharges ──
app.get('/api/payment/fusion/history', requireSession, (req, res) => {
  const user = findUser(u => u.id === req.session.user.id);
  if (!user) return res.status(401).json({ success: false });
  const history = (user.rechargeHistory || []).slice(0, 50).map(r => ({
    token:      r.token,
    amountFcfa: r.amountFcfa,
    credits:    r.credits,
    coinsAvant: r.coinsAvant ?? null,
    coinsApres: r.coinsApres ?? null,
    nomclient:  r.nomclient || null,
    moyen:      r.moyen || null,
    status:     r.status || 'paid',
    method:     r.method || 'moneyfusion',
    date:       r.date,
  }));
  return res.json({ success: true, history });
});

/* ════════════════════════════════════════
   STATIC & FALLBACK
════════════════════════════════════════ */
app.use(express.static(__dirname));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages/dashboard.html'));
});

/* ════════════════════════════════════════
   HEALTHCHECK (utile pour nginx / monitoring VPS)
════════════════════════════════════════ */
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', uptime: process.uptime() }));

/* ════════════════════════════════════════
   ROBUSTESSE PROCESS — VPS / PM2
════════════════════════════════════════ */
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ [UNHANDLED REJECTION]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('⚠️ [UNCAUGHT EXCEPTION]', err);
  // On ne process.exit() pas volontairement pour éviter de couper le service sur une erreur non fatale.
  // PM2 redémarre automatiquement si le process meurt réellement.
});

/* ════════════════════════════════════════
   DÉMARRAGE
════════════════════════════════════════ */
const HOST = process.env.HOST || '0.0.0.0';

(async () => {
  await initDB();
  await pteroDiscover();
  const server = app.listen(PORT, HOST, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════════╗');
    console.log('  ║   Krinyx v2.0 — Raizel & Knut               ║');
    console.log('  ║   Base de données : users.json               ║');
    console.log('  ╚══════════════════════════════════════════════╝');
    console.log(`  ► Écoute sur ${HOST}:${PORT} (env: ${NODE_ENV})`);
    console.log('  ► ROK XD     → /rokxd');
    console.log('  ► KNUT XMD   → /knutxmd');
    console.log('  ► HADES XMD  → /hadesxmd');
    console.log('  ► RAIZEL XMD → /raizelxmd');
    console.log('  ► KRATOS XMD → /kratosxmd');
    console.log('  ► KYRO XMD   → /kyroxmd');
    console.log('  ► SADEUS XMD → /sadeusxmd');
    console.log('  ► DB         → users.json');
    console.log(`  ► Pterodactyl : ${pteroOk() ? '[OK]' : '[OFF — PTERO_URL/PTERO_API_KEY manquants]'}`);
    console.log(`  ► Email       : ${EMAIL_ENABLED ? EMAIL_USER : '[OFF — EMAIL_USER/EMAIL_PASS manquants]'}`);
    console.log(`  ► Money Fusion: IP autorisée = ${FUSION_ALLOWED_IP || '[NON DÉFINIE]'}`);
    console.log(`  ► APP_URL     : ${APP_URL}`);
    console.log('');
    setTimeout(restoreSessions, 3000);
  });

  const shutdown = (signal) => {
    console.log(`\n  [SHUTDOWN] Signal ${signal} reçu — arrêt propre du serveur...`);
    server.close(() => {
      console.log('  [SHUTDOWN] Serveur arrêté.');
      process.exit(0);
    });
    // Sécurité : force l'arrêt si close() ne répond pas sous 10s
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
})();