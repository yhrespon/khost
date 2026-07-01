const CREDIT_RATE = 15;

/* Forfaits fixes */
const PACKS = [
  { fcfa: 250,   cr: Math.floor(250   / 15) },
  { fcfa: 500,   cr: Math.floor(500   / 15) },
  { fcfa: 1000,  cr: Math.floor(1000  / 15) },
  { fcfa: 2000,  cr: Math.floor(2000  / 15) },
  { fcfa: 5000,  cr: Math.floor(5000  / 15) },
  { fcfa: 10000, cr: Math.floor(10000 / 15), best: true },
];

/* ── État ── */
let selectedPack = null;
const $ = id => document.getElementById(id);

function toast(msg, dur) {
  dur = dur || 3200;
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast show';
  clearTimeout(t._t);
  t._t = setTimeout(function () { t.className = 'toast'; }, dur);
}

function fmt(n) {
  return n.toLocaleString('fr-FR');
}

/* ── Rendu des forfaits ── */
function renderPacks() {
  $('packs-grid').innerHTML = PACKS.map(function (p) {
    var badge = p.best ? '<span class="pack-badge">MEILLEUR</span>' : '';
    return '<div class="pack" data-fcfa="' + p.fcfa + '" onclick="selectPack(' + p.fcfa + ',' + p.cr + ')">'
      + badge
      + '<div class="pack-fcfa">' + fmt(p.fcfa) + ' XAF</div>'
      + '<div class="pack-cr">= ' + p.cr + ' CR</div>'
      + '</div>';
  }).join('');
}

function selectPack(fcfa, cr) {
  selectedPack = { fcfa: fcfa, cr: cr };
  document.querySelectorAll('.pack').forEach(function (el) {
    el.classList.toggle('selected', parseInt(el.dataset.fcfa) === fcfa);
  });
  /* Recap */
  $('recap-fcfa').textContent = fmt(fcfa) + ' XAF';
  $('recap-cr').textContent   = cr;
  $('recap').classList.add('show');
  validate();
}

/* ── Validation ── */
function validate() {
  var nom   = $('f-nom').value.trim();
  var email = $('f-email').value.trim();
  var ok    = selectedPack !== null
    && nom.length >= 2
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  $('btn-pay').disabled = !ok;
}

/* ── Soumission — URL générée côté serveur ── */
async function submitPayment() {
  if (window.krinyxServiceGuard && !window.krinyxServiceGuard('credit_buy')) return;
  var nom   = $('f-nom').value.trim();
  var email = $('f-email').value.trim();

  if (!selectedPack)       { toast('Choisis un forfait'); return; }
  if (!nom)                { toast('Entre ton nom'); return; }
  if (!email)              { toast('Entre ton email'); return; }

  var btn = $('btn-pay');
  btn.disabled    = true;
  btn.textContent = 'Chargement…';

  try {
    /* 1. Appel serveur pour init + recevoir l'URL sécurisée */
    var data = await fetch('/api/payment/fusion/init', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        amountFcfa: selectedPack.fcfa,
        nomclient:  nom,
        email:      email
      })
    }).then(function (r) { return r.json(); });

    if (!data.success) {
      toast(data.message || 'Erreur lors de l\'initialisation');
      btn.disabled    = false;
      btn.textContent = 'Payer maintenant';
      return;
    }

    /* 2. Ouverture immédiate dans un nouvel onglet */
    window.open(data.payUrl, '_blank');
    toast('Redirection vers Money Fusion…', 4000);

  } catch (e) {
    console.error('[BUY]', e);
    toast('Erreur réseau. Réessaie.');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Payer maintenant';
  }
}

/* ── Historique ── */
async function loadHistory() {
  var el = $('history-list');
  try {
    var data = await fetch('/api/payment/fusion/history').then(function (r) { return r.json(); });
    if (!data.success || !data.history || !data.history.length) {
      el.innerHTML = '<div class="hist-empty">Aucune recharge pour l\'instant.</div>';
      return;
    }
    var S = {
      paid:    ['d-paid',    'hb-paid',    'Confirmée'],
      pending: ['d-pending', 'hb-pending', 'En attente'],
      failed:  ['d-failed',  'hb-failed',  'Échouée'],
    };
    el.innerHTML = data.history.map(function (r) {
      var s    = S[r.status] || S.pending;
      var date = new Date(r.date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      return '<div class="hist-item">'
        + '<div class="hist-dot ' + s[0] + '"></div>'
        + '<div class="hist-body">'
        +   '<div class="hist-title">' + (r.amountFcfa || 0).toLocaleString('fr-FR') + ' FCFA</div>'
        +   '<div class="hist-sub">' + date + (r.moyen ? ' · ' + r.moyen : '') + '</div>'
        + '</div>'
        + '<div class="hist-right">'
        +   '<div class="hist-cr">+' + r.credits + ' CR</div>'
        +   '<span class="hist-badge ' + s[1] + '">' + s[2] + '</span>'
        + '</div>'
        + '</div>';
    }).join('');
  } catch (e) {
    el.innerHTML = '<div class="hist-empty">Impossible de charger l\'historique.</div>';
  }
}

/* ── Rafraîchir le solde ── */
async function refreshBalance() {
  try {
    var d = await fetch('/api/me').then(function (r) { return r.json(); });
    if (d.success && d.user && $('balance-cr')) {
      $('balance-cr').textContent = d.user.coins != null ? d.user.coins : 0;
    }
  } catch (e) { /* silencieux */ }
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof injectTopbar  === 'function') injectTopbar('/dashboard');
  if (typeof ThemeManager  !== 'undefined') ThemeManager.init();
  if (typeof initScrollNav === 'function') initScrollNav();

  renderPacks();
  refreshBalance();

  /* Écoute input pour activer/désactiver bouton payer */
  ['f-nom', 'f-email'].forEach(function (id) {
    var el = $(id);
    if (el) el.addEventListener('input', validate);
  });

  /* Retour après paiement Money Fusion */
  if (new URLSearchParams(window.location.search).get('payment') === 'success') {
    toast('Paiement reçu — tes crédits seront ajoutés sous peu.', 5000);
    window.history.replaceState({}, '', '/buy');
    /* Rafraîchir solde + historique après 3s */
    setTimeout(function () {
      refreshBalance();
      loadHistory();
    }, 3000);
    /* Rafraîchir à nouveau après 8s au cas où le webhook est lent */
    setTimeout(function () {
      refreshBalance();
      loadHistory();
    }, 8000);
  }

  loadHistory();
});