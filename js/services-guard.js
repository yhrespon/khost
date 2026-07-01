/**
 * ╔══════════════════════════════════════════════════════╗
 * ║   KRINYX — Garde des services (front)                ║
 * ║   À inclure sur toutes les pages publiques.          ║
 * ║   Marquer un élément avec data-service="panel_buy"   ║
 * ║   pour qu'il soit automatiquement géré ici.          ║
 * ╚══════════════════════════════════════════════════════╝
 */
(function () {
  'use strict';

  function toast(msg) {
    var el = document.getElementById('__svc_toast__');
    if (!el) {
      el = document.createElement('div');
      el.id = '__svc_toast__';
      el.style.cssText = [
        'position:fixed', 'left:50%', 'bottom:28px', 'transform:translateX(-50%) translateY(20px)',
        'background:#161b29', 'color:#fff', 'padding:13px 20px', 'border-radius:12px',
        'font-size:.85rem', 'font-family:inherit', 'box-shadow:0 8px 24px rgba(0,0,0,.35)',
        'border:1px solid rgba(77,132,255,.35)', 'z-index:99999', 'max-width:90vw',
        'text-align:center', 'opacity:0', 'transition:opacity .25s, transform .25s',
        'pointer-events:none'
      ].join(';');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3600);
  }

  function applyDisabledState(el, status) {
    el.classList.add('svc-disabled');
    el.setAttribute('aria-disabled', 'true');
    if (!el.dataset.svcOriginalTitle) {
      el.dataset.svcOriginalTitle = el.getAttribute('title') || '';
    }
    el.title = status.message || 'Ce service sera bientôt disponible.';

    if (!el.dataset.svcGuarded) {
      el.dataset.svcGuarded = '1';
      el.addEventListener('click', function (e) {
        if (el.classList.contains('svc-disabled')) {
          e.preventDefault();
          e.stopImmediatePropagation();
          toast(status.message || 'Ce service sera bientôt disponible. Merci de votre patience 🙏');
        }
      }, true);
    }
  }

  function applyEnabledState(el) {
    el.classList.remove('svc-disabled');
    el.removeAttribute('aria-disabled');
    el.title = el.dataset.svcOriginalTitle || '';
  }

  function injectStyle() {
    if (document.getElementById('__svc_style__')) return;
    var style = document.createElement('style');
    style.id = '__svc_style__';
    style.textContent =
      '.svc-disabled{opacity:.45 !important;filter:grayscale(.4);cursor:not-allowed !important;}' +
      '.svc-disabled *{pointer-events:none;}' +
      '.svc-badge-soon{display:inline-block;margin-left:6px;font-size:.62rem;font-weight:700;' +
      'padding:1px 7px;border-radius:9999px;background:rgba(239,68,68,.15);color:#ef4444;vertical-align:middle;}';
    document.head.appendChild(style);
  }

  function addSoonBadge(el) {
    if (el.querySelector('.svc-badge-soon')) return;
    var nameEl = el.querySelector('.svc-name');
    var badge = document.createElement('span');
    badge.className = 'svc-badge-soon';
    badge.textContent = 'bientôt';
    if (nameEl) nameEl.appendChild(badge);
    else el.appendChild(badge);
  }

  function removeSoonBadge(el) {
    var b = el.querySelector('.svc-badge-soon');
    if (b) b.remove();
  }

  function applyAll(statusMap) {
    var nodes = document.querySelectorAll('[data-service]');
    nodes.forEach(function (el) {
      var id = el.getAttribute('data-service');
      var status = statusMap[id];
      if (!status) return; // service inconnu : on ne touche à rien
      if (status.available) {
        applyEnabledState(el);
        removeSoonBadge(el);
      } else {
        applyDisabledState(el, status);
        addSoonBadge(el);
      }
    });
  }

  function fetchStatus() {
    return fetch('/api/services/status', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.success) {
          window.__krinyxServices = data.services;
          injectStyle();
          applyAll(data.services);
        }
        return data;
      })
      .catch(function () { /* silencieux : en cas d'erreur on n'altère pas l'UI */ });
  }

  /** Permet de vérifier un service avant une action JS (ex: avant un fetch d'achat). */
  window.krinyxServiceGuard = function (serviceId) {
    var statusMap = window.__krinyxServices || {};
    var status = statusMap[serviceId];
    if (status && !status.available) {
      toast(status.message || 'Ce service sera bientôt disponible. Merci de votre patience 🙏');
      return false;
    }
    return true;
  };

  document.addEventListener('DOMContentLoaded', fetchStatus);
  // Si le DOM est déjà prêt (script chargé en fin de page)
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    fetchStatus();
  }
})();
