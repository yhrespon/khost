/**
 * 
 *    Krinyx — panel.js  v3.1                               
 *    Boutique Panels · Pterodactyl · DH credentials        
 *      Clé API gérée UNIQUEMENT par server.js (sécurisé) 
 * 
 */

'use strict';

/* 
   SESSION
 */
let user = null;
try {
  const raw = localStorage.getItem('krinyx_session');
  if (raw) user = JSON.parse(raw);
} catch {}

async function ensureSession() {
  if (user) return true;
  try {
    const res  = await fetch('/api/me');
    const data = await res.json();
    if (data.success && data.user) {
      user = data.user;
      localStorage.setItem('krinyx_session', JSON.stringify(user));
      return true;
    }
  } catch {}
  window.location.replace('/pages/login.html');
  return false;
}

/* ══════════════════════════════════════════
   PLANS HÉBERGEMENT — 1 CR = 15 FCFA
   ══════════════════════════════════════════ */
const PLANS = {
  basic: {
    key: 'basic', name: 'STARTER', credits: 7, duration: 1,
    ram: 512, cpu: 50, disk: 1024, databases: 1, backups: 1,
    ptero: { memory: 512, cpu: 50, disk: 1024, io: 500, swap: 0, databases: 1, backups: 1, allocations: 1 }
  },
  pro: {
    key: 'pro', name: 'PRO', credits: 10, duration: 2,
    ram: 1024, cpu: 100, disk: 2048, databases: 2, backups: 2,
    ptero: { memory: 1024, cpu: 100, disk: 2048, io: 500, swap: 0, databases: 2, backups: 2, allocations: 1 }
  },
  premium: {
    key: 'premium', name: 'SEMAINE', credits: 33, duration: 7,
    ram: 1024, cpu: 100, disk: 2048, databases: 3, backups: 3,
    ptero: { memory: 1024, cpu: 100, disk: 2048, io: 500, swap: 0, databases: 3, backups: 3, allocations: 1 }
  },
  elite: {
    key: 'elite', name: 'MENSUEL', credits: 100, duration: 30,
    ram: 2048, cpu: 200, disk: 5120, databases: 5, backups: 5,
    ptero: { memory: 2048, cpu: 200, disk: 5120, io: 500, swap: 0, databases: 5, backups: 5, allocations: 1 }
  }
};

/* 
   CREDENTIALS DH
   Tout est géré côté serveur (users.json).
   Le client lit les vraies coordonnées depuis /api/me.
   email    : username@gmail.com
   password : Krinyx + 4 chiffres (généré une fois, stocké dans users.json)
   username : username du compte Krinyx (= username sur Pterodactyl)
 */
/* 
   CREDENTIALS DH
   Le serveur génère et stocke tout dans users.json.
   Le client ne calcule rien — il lit uniquement ce que le serveur retourne.
   Flux : serveur génère → sauvegarde dans users.json → retourne dans data.panel → page affiche.
 */
function getPanelEmail(username) {
  const clean = (username || 'user').toLowerCase().replace(/[^a-z0-9_.]/g, '');
  return clean + '@gmail.com';
}

/* Lecture des credentials depuis /api/me — utilisé uniquement pour pré-affichage.
   La source de vérité reste toujours data.panel retourné après création. */
async function getPanelCredentials() {
  try {
    const res  = await fetch('/api/me', { credentials: 'include' });
    const data = await res.json();
    if (data.success && data.user) {
      const u = data.user;
      return {
        panelUsername: u.panelUser  || null,
        panelEmail:    getPanelEmail(u.username),
        panelPassword: u.panelPassword || null
      };
    }
  } catch {}
  return { panelUsername: null, panelEmail: null, panelPassword: null };
}

/* 
   TOAST
 */
function toast(msg, type) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.innerHTML = msg;
  el.className = 'toast ' + (type || 'info') + ' show';
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3500);
}

/* 
   CRÉDITS
 */
function refreshCredits(val) {
  const v = val !== undefined ? val
    : (user ? (user.credits !== undefined ? user.credits : (user.coins || 0)) : 0);
  ['nav-credits', 'hero-credits', 'modal-credits-balance', 'confirm-credits-balance'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  });
}

/* 
   ÉTAT
 */
let activePlan = null;

/* 
   MODAL CONFIRMATION — OUVERTURE
 */
function openBuyModal(planKey) {
  const plan = PLANS[planKey];
  if (!plan) return;
  activePlan = plan;

  setEl('confirm-plan-name',   plan.name);
  setEl('confirm-credits-req', plan.credits + ' CR');
  setEl('confirm-duration',    plan.duration === 30 ? '30 jours (1 mois)' : plan.duration + ' jours');
  setEl('confirm-ram',         plan.ram  === 0 ? 'Illimité' : plan.ram  + ' MB');
  setEl('confirm-cpu',         plan.cpu  === 0 ? 'Illimité' : plan.cpu  + '%');
  setEl('confirm-disk',        plan.disk === 0 ? 'Illimité' : (plan.disk / 1024).toFixed(0) + ' GB');

  refreshCredits();
  clearError('confirm-error');

  const nameInput = document.getElementById('confirm-panel-name');
  if (nameInput) nameInput.value = '';

  openModal('modal-confirm');
}

/* 
   ACHAT — SOUMETTRE
   Appel /api/panels/buy → server.js
   La clé Pterodactyl ne quitte jamais le serveur
 */
async function submitPurchase() {
  if (!activePlan) return;
  if (window.krinyxServiceGuard && !window.krinyxServiceGuard('panel_buy')) return;

  const nameInput = document.getElementById('confirm-panel-name');
  const panelName = nameInput ? nameInput.value.trim() : '';
  if (!panelName) {
    showError('confirm-error', 'Veuillez donner un nom à votre panel.');
    return;
  }

  const credits = user ? (user.credits !== undefined ? user.credits : (user.coins || 0)) : 0;
  if (credits < activePlan.credits) {
    showError('confirm-error',
      'Crédits insuffisants — il vous faut ' + activePlan.credits + ' CR, vous avez ' + credits + ' CR.');
    return;
  }

  const btn = document.getElementById('btn-confirm-buy');
  setBtn(btn, 'CRÉATION EN COURS…', true);
  clearError('confirm-error');
  showLoading();

  try {
    const res = await fetch('/api/panels/buy', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId:        user ? user.id : null,
        panelName,
        paymentMethod: 'credits',
        plan:          activePlan.key,
        ram:           activePlan.ptero.memory,
        cpu:           activePlan.ptero.cpu,
        disk:          activePlan.ptero.disk,
        io:            activePlan.ptero.io,
        databases:     activePlan.ptero.databases,
        backups:       activePlan.ptero.backups,
        duration:      activePlan.duration
        /* panelUsername / panelPassword / panelEmail générés par le serveur */
      })
    });

    const data = await res.json();

    if (data.success) {
      if (user) {
        user.credits = Math.max(0, credits - activePlan.credits);
        if (user.coins !== undefined) user.coins = user.credits;
        /* Synchroniser les vrais credentials depuis la réponse serveur */
        if (data.panel) {
          user.panelUser     = data.panel.panelUser;
          user.panelPassword = data.panel.panelPassword;
        }
        localStorage.setItem('krinyx_session', JSON.stringify(user));
      }
      refreshCredits();
      closeModal('modal-confirm');
      hideLoading();
      showSuccessModal(data.panel);
      loadMyPanels();
    } else {
      hideLoading();
      showError('confirm-error', data.message || 'Erreur lors de la création.');
      setBtn(btn, null, false);
    }

  } catch (err) {
    console.error('Erreur API, fallback local:', err);
    const panel = localFallback(panelName, panelUsername, panelPassword, panelEmail);
    closeModal('modal-confirm');
    hideLoading();
    showSuccessModal(panel);
    loadMyPanels();
  }

  setBtn(btn, null, false);
}

/* 
   FALLBACK LOCAL (serveur inaccessible)
 */
function localFallback(panelName, panelUsername, panelPassword, panelEmail) {
  const plan    = activePlan;
  const credits = user ? (user.credits !== undefined ? user.credits : (user.coins || 0)) : 0;

  const panel = {
    id:            'pnl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    userId:        String(user ? user.id : 'local'),
    name:          panelName,
    plan:          plan.key,
    panelUser:     panelUsername,
    panelPassword: panelPassword,
    panelEmail:    panelEmail,
    panelUrl:      'https://panel.danscot.dev',
    status:        'active',
    createdAt:     new Date().toISOString(),
    expiresAt:     new Date(Date.now() + plan.duration * 86400000).toISOString()
  };

  if (user) {
    user.credits = Math.max(0, credits - plan.credits);
    if (user.coins !== undefined) user.coins = user.credits;
    localStorage.setItem('krinyx_session', JSON.stringify(user));
  }
  refreshCredits();

  const key   = 'krinyx_panels_' + (user ? user.id : 'local');
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  saved.push(panel);
  localStorage.setItem(key, JSON.stringify(saved));

  return panel;
}

/* 
   MODAL SUCCÈS — CREDENTIALS
 */
function showSuccessModal(panel) {
  setEl('result-panel-name', panel.name          || '—');
  setEl('result-plan',       (panel.plan || 'basic').toUpperCase());
  setEl('result-url',        panel.panelUrl      || '—');
  setEl('result-username',   panel.panelUser     || '—');
  setEl('result-password',   panel.panelPassword || '—');

  const exp = panel.expiresAt
    ? new Date(panel.expiresAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';
  setEl('result-expires', exp);

  const linkEl = document.getElementById('result-access-link');
  if (linkEl) linkEl.href = panel.panelUrl || '#';

  const pw = document.getElementById('result-password');
  if (pw) pw.classList.add('masked');

  openModal('modal-success');
}

/* 
   MES PANELS — CHARGEMENT & RENDU
 */
async function loadMyPanels() {
  const container = document.getElementById('my-panels-list');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:var(--s5);color:var(--text-3);font-size:0.82rem;">Chargement…</div>';

  let panels = [];
  try {
    const res  = await fetch('/api/panels/user/' + (user ? user.id : ''));
    const data = await res.json();
    if (data.success) panels = data.panels || [];
    else throw new Error('fallback');
  } catch {
    panels = JSON.parse(localStorage.getItem('krinyx_panels_' + (user ? user.id : 'local')) || '[]');
  }
  renderMyPanels(panels, container);
}

function renderMyPanels(panels, container) {
  if (!panels.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon"></div><div class="empty-text">Aucun panel actif — commandez votre premier panel ci-dessus.</div></div>';
    return;
  }

  const pc = {
    basic:   { color: 'var(--blue)',   label: 'BASIQUE'  },
    pro:     { color: 'var(--purple)', label: 'PRO'      },
    premium: { color: 'var(--orange)', label: 'PREMIUM'  },
    elite:   { color: 'var(--green)',  label: 'ELITE'    }
  };

  container.innerHTML = panels.map(p => {
    const expired = new Date(p.expiresAt) < new Date();
    const expDate = new Date(p.expiresAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    const pKey    = p.plan || 'basic';
    const c       = pc[pKey] || pc.basic;
    const pw      = esc(p.panelPassword || '');
    const usr     = esc(p.panelUser     || '');
    const url     = esc(p.panelUrl      || '#');
    const nm      = esc(p.name          || 'Panel');

    return '<div class="my-panel-card' + (expired ? ' expired' : '') + '">' +
      '<div class="mpc-header">' +
        '<div class="mpc-header-left">' +
          '<span class="mpc-name">' + nm + '</span>' +
          '<span class="mpc-plan-badge" style="color:' + c.color + ';border-color:' + c.color + ';">' + c.label + '</span>' +
        '</div>' +
        '<span class="mpc-status ' + (expired ? 'mpc-status-expired' : 'mpc-status-active') + '">' +
          (expired ? ' EXPIRÉ' : ' ACTIF') +
        '</span>' +
      '</div>' +
      '<div class="mpc-fields">' +
        '<div class="mpc-field mpc-field-full">' +
          '<div class="mpc-field-label">LIEN D\'ACCÈS</div>' +
          '<a class="mpc-field-val mpc-link" href="' + url + '" target="_blank" rel="noopener">' + (p.panelUrl || '—') + '</a>' +
        '</div>' +
        '<div class="mpc-field">' +
          '<div class="mpc-field-label">UTILISATEUR</div>' +
          '<div class="mpc-field-val">' + (p.panelUser || '—') + '</div>' +
        '</div>' +
        '<div class="mpc-field">' +
          '<div class="mpc-field-label">MOT DE PASSE</div>' +
          '<div class="mpc-pw-wrap">' +
            '<span class="mpc-pw-val masked" id="mpw-' + p.id + '">••••••••</span>' +
            '<button class="mpc-pw-btn" onclick="togglePw(\'' + p.id + '\',\'' + pw + '\')" title="Afficher/masquer">' +
              '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="mpc-expire">Expire le ' + expDate + '</div>' +
      '<div class="mpc-actions">' +
        '<a class="btn btn-secondary btn-sm" href="' + url + '" target="_blank" rel="noopener">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>' +
          ' Accéder' +
        '</a>' +
        '<button class="btn btn-ghost btn-sm" onclick="copyAccess(\'' + url + '\',\'' + usr + '\',\'' + pw + '\',\'' + nm + '\')">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>' +
          ' Copier' +
        '</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* 
   HELPERS
 */
function setEl(id, text)       { const el = document.getElementById(id); if (el) el.textContent = text; }
function showError(id, msg)    { const el = document.getElementById(id); if (!el) return; el.textContent = msg; el.classList.add('show'); }
function clearError(id)        { const el = document.getElementById(id); if (!el) return; el.textContent = ''; el.classList.remove('show'); }
function setBtn(btn, lbl, dis) { if (!btn) return; if (lbl !== null) btn.textContent = lbl; btn.disabled = dis; }
function openModal(id)         { const el = document.getElementById(id); if (el) el.classList.add('open'); }
function closeModal(id)        { const el = document.getElementById(id); if (el) el.classList.remove('open'); }
function esc(str)              { return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }

function togglePw(id, pw) {
  const el = document.getElementById('mpw-' + id);
  if (!el) return;
  if (el.classList.contains('masked')) { el.textContent = pw; el.classList.remove('masked'); }
  else { el.textContent = '••••••••'; el.classList.add('masked'); }
}

function toggleResultPw() {
  const el = document.getElementById('result-password');
  if (el) el.classList.toggle('masked');
}

function copyAccess(url, panelUser, pw, name) {
  const txt = 'Panel   : ' + name + '\nLien    : ' + url + '\nUser    : ' + panelUser + '\nPass    : ' + pw;
  navigator.clipboard.writeText(txt)
    .then(() => toast(' Accès "' + name + '" copié !', 'success'))
    .catch(() => toast('Erreur lors de la copie.', 'error'));
}

function copyResultAll() {
  const url = document.getElementById('result-url')?.textContent || '';
  const usr = document.getElementById('result-username')?.textContent || '';
  const pw  = document.getElementById('result-password')?.textContent || '';
  const nm  = document.getElementById('result-panel-name')?.textContent || '';
  copyAccess(url, usr, pw, nm);
}


/* 
   OVERLAY DE CHARGEMENT + ÉTAPES
 */
let _loadingTimer = null;

function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;

  // Reset toutes les étapes
  [1,2,3,4].forEach(i => {
    const el = document.getElementById('lstep-' + i);
    if (el) { el.classList.remove('active', 'done'); }
  });

  overlay.classList.add('active');

  // Animer les étapes avec délais progressifs
  const steps = [
    { id: 'lstep-1', delay: 0,    msg: 'Vérification des crédits…'    },
    { id: 'lstep-2', delay: 1200, msg: 'Création du compte panel…'     },
    { id: 'lstep-3', delay: 2800, msg: 'Déploiement du serveur…'       },
    { id: 'lstep-4', delay: 4500, msg: 'Finalisation en cours…'        },
  ];

  steps.forEach((step, idx) => {
    setTimeout(() => {
      // Marquer la précédente comme done
      if (idx > 0) {
        const prev = document.getElementById(steps[idx-1].id);
        if (prev) { prev.classList.remove('active'); prev.classList.add('done'); }
      }
      const el = document.getElementById(step.id);
      if (el) el.classList.add('active');
      const msg = document.querySelector('.loading-msg');
      if (msg) msg.textContent = step.msg;
    }, step.delay);
  });
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;
  // Marquer la dernière étape comme done avant de fermer
  const last = document.getElementById('lstep-4');
  if (last) { last.classList.remove('active'); last.classList.add('done'); }
  setTimeout(() => {
    overlay.classList.remove('active');
    // Reset
    [1,2,3,4].forEach(i => {
      const el = document.getElementById('lstep-' + i);
      if (el) el.classList.remove('active', 'done');
    });
  }, 400);
}

/* 
   INIT
 */
(async () => {
  const ok = await ensureSession();
  if (!ok) return;

  refreshCredits();

  /* Clics plan cards */
  document.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('click', () => { const pk = card.dataset.plan; if (pk) openBuyModal(pk); });
    const btn = card.querySelector('button');
    if (btn) btn.addEventListener('click', e => { e.stopPropagation(); const pk = card.dataset.plan; if (pk) openBuyModal(pk); });
  });

  /* Modal confirmation */
  document.getElementById('btn-confirm-cancel')?.addEventListener('click', () => closeModal('modal-confirm'));
  document.getElementById('modal-confirm')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeModal('modal-confirm'); });
  document.getElementById('btn-confirm-buy')?.addEventListener('click', submitPurchase);

  /* Modal succès */
  document.getElementById('btn-success-close')?.addEventListener('click', () => closeModal('modal-success'));
  document.getElementById('modal-success')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeModal('modal-success'); });
  document.getElementById('btn-result-copy')?.addEventListener('click', copyResultAll);
  document.getElementById('btn-result-toggle-pw')?.addEventListener('click', toggleResultPw);

  loadMyPanels();
})();
