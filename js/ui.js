/**
 * Krinyx — ui.js
 * Shared UI helpers: theme, language, scroll nav, back button
 */

//  THEME 
const ThemeManager = (() => {
  const KEY = 'krinyx_theme';
  // Défaut: 'light' au lieu de 'dark'
  let current = localStorage.getItem(KEY) || 'light';

  function updateThemeButtons(theme) {
    document.querySelectorAll('#theme-toggle, .theme-toggle, #btn-theme').forEach(btn => {
      btn.innerHTML = theme === 'dark'
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
      
      // Accessibilité
      btn.setAttribute('aria-label', theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre');
    });
  }

  function updateMetaThemeColor(theme) {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = theme === 'dark' ? '#0a0a0a' : '#fafafa';
  }

  function apply(theme) {
    current = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);

    // PLUS BESOIN de forcer les backgrounds en inline
    // Le CSS gère tout avec les variables
    
    updateThemeButtons(theme);
    updateMetaThemeColor(theme);

    // Broadcast to other tabs
    try { localStorage.setItem('krinyx_theme_update', Date.now()); } catch(e) {}
  }

  function toggle() {
    const actual = localStorage.getItem(KEY) || 'light';
    apply(actual === 'dark' ? 'light' : 'dark');
  }
  
  function init() {
    current = localStorage.getItem(KEY) || 'light';
    apply(current);
  }

  return { init, toggle, current: () => current };
})();

//  LANGUAGE 
const i18n = (() => {
  const KEY = 'krinyx_lang';
  let lang = localStorage.getItem(KEY) || 'fr';

  const translations = {
    fr: {
      'nav.logout': 'Déconnexion',
      'nav.credits': 'Crédits',
      'login.title': 'Connexion',
      'login.sub': 'Accédez à votre espace',
      'login.email': 'Adresse email',
      'login.password': 'Mot de passe',
      'login.forgot': 'Mot de passe oublié ?',
      'login.btn': 'Se connecter',
      'login.loading': 'Connexion…',
      'login.no-account': "Pas encore de compte ?",
      'login.register': 'Créer un compte',
      'login.status': 'Système en ligne',
      'login.err.email': 'Adresse email invalide.',
      'login.err.pw': 'Veuillez entrer votre mot de passe.',
      'login.err.invalid': 'Email ou mot de passe incorrect.',
      'login.success': 'Connexion réussie ! Redirection…',
      'register.title': 'Créer un compte',
      'register.sub': 'Rejoignez Krinyx',
      'register.username': "Nom d'utilisateur",
      'register.email': 'Adresse email',
      'register.password': 'Mot de passe',
      'register.confirm': 'Confirmer le mot de passe',
      'register.btn': 'Créer mon compte',
      'register.loading': 'Création…',
      'register.have-account': 'Déjà un compte ?',
      'register.login': 'Se connecter',
      'register.bonus': 'Bonus inscription',
      'register.bonus-val': '+50 crédits offerts',
      'register.err.username': "Nom d'utilisateur requis.",
      'register.err.email': 'Email invalide.',
      'register.err.pw-weak': 'Mot de passe trop faible.',
      'register.err.pw-match': 'Les mots de passe ne correspondent pas.',
      'register.success': 'Compte créé ! Redirection…',
      'pw.rule.len': '8 caractères min',
      'pw.rule.upper': '1 majuscule',
      'pw.rule.num': '1 chiffre',
      'forgot.title': 'Mot de passe oublié',
      'forgot.sub': 'Réinitialisation par email',
      'forgot.email': 'Adresse email',
      'forgot.btn': 'Envoyer le lien',
      'forgot.loading': 'Envoi…',
      'forgot.back': 'Retour à la connexion',
      'forgot.desc': 'Entrez votre email pour recevoir un lien de réinitialisation.',
      'forgot.success-title': 'Email envoyé !',
      'forgot.success-desc': 'Vérifiez votre boîte mail. Le lien expirera dans 24h.',
      'admin.title': 'Accès Administrateur',
      'admin.sub': 'Panneau de contrôle restreint',
      'admin.warning': 'Accès restreint au personnel autorisé.',
      'admin.email': 'Email administrateur',
      'admin.password': 'Mot de passe',
      'admin.btn': 'Accéder au panneau',
      'admin.loading': 'Vérification…',
      'admin.status': 'Zone sécurisée',
      'dashboard.welcome': 'Bienvenue',
      'dashboard.credits': 'Crédits',
      'dashboard.services': 'Services',
      'dashboard.panels': 'Panels',
      'dashboard.profile': 'Profil',
      'dashboard.admin': 'Admin',
      'dashboard.logout': 'Déconnexion',
      'dashboard.my-panels': 'Mes Panels',
      'dashboard.shop': 'Boutique',
      'panel.title': 'Boutique Panels',
      'panel.sub': 'Choisissez votre formule',
      'panel.credits-available': 'crédits disponibles',
      'panel.buy': 'Acquérir',
      'panel.basic': 'Basic',
      'panel.pro': 'Pro',
      'panel.premium': 'Premium',
      'common.loading': 'Chargement…',
      'common.save': 'Enregistrer',
      'common.cancel': 'Annuler',
      'common.confirm': 'Confirmer',
      'common.delete': 'Supprimer',
      'common.search': 'Rechercher…',
      'common.no-results': 'Aucun résultat',
      'common.actions': 'Actions',
      'admin.panel.title': 'Panneau Admin',
      'admin.stats': 'Statistiques',
      'admin.users': 'Utilisateurs',
      'admin.activity': 'Activité',
      'admin.total-users': 'Utilisateurs',
      'admin.active-users': 'Actifs',
      'admin.banned-users': 'Bannis',
      'admin.total-credits': 'Crédits distribués',
      'admin.ban': 'Bannir',
      'admin.unban': 'Débannir',
      'admin.edit-credits': 'Crédits',
      'admin.delete': 'Supprimer',
      'admin.edit-credits-title': 'Modifier les crédits',
      'admin.delete-title': 'Supprimer le compte',
      'admin.delete-confirm': 'Cette action est irréversible.',
      // Bots
      'bots.deploy': 'Déployer',
      'bots.cost.rok': 'dès 7 CR',
      'bots.cost.knut': 'dès 10 CR',
      'bots.cost.hades': 'dès 10 CR',
      'bots.cost.raizel': 'dès 10 CR',
      'bots.cost.kratos': 'dès 5 CR',
      // Help
      'help.title': 'Centre d\'aide',
      'help.contact': 'Contacter le support',
      'help.tips': 'Astuces & conseils',
      'help.back': 'Retour',
      'support.title': 'Contacter le support',
      'support.problem': 'Décrivez votre problème',
      'support.send': 'Envoyer au support',
      'support.sending': 'Envoi…',
      'support.sent': 'Message envoyé !',
      'support.inbox': 'Mes demandes',
      // Common
      'back': 'Retour',
    },
    en: {
      'nav.logout': 'Logout',
      'nav.credits': 'Credits',
      'login.title': 'Sign In',
      'login.sub': 'Access your account',
      'login.email': 'Email address',
      'login.password': 'Password',
      'login.forgot': 'Forgot password?',
      'login.btn': 'Sign in',
      'login.loading': 'Signing in…',
      'login.no-account': 'No account yet?',
      'login.register': 'Create account',
      'login.status': 'System online',
      'login.err.email': 'Invalid email address.',
      'login.err.pw': 'Please enter your password.',
      'login.err.invalid': 'Invalid email or password.',
      'login.success': 'Signed in! Redirecting…',
      'register.title': 'Create account',
      'register.sub': 'Join Krinyx',
      'register.username': 'Username',
      'register.email': 'Email address',
      'register.password': 'Password',
      'register.confirm': 'Confirm password',
      'register.btn': 'Create account',
      'register.loading': 'Creating…',
      'register.have-account': 'Already have an account?',
      'register.login': 'Sign in',
      'register.bonus': 'Sign-up bonus',
      'register.bonus-val': '+50 credits free',
      'register.err.username': 'Username required.',
      'register.err.email': 'Invalid email.',
      'register.err.pw-weak': 'Password too weak.',
      'register.err.pw-match': 'Passwords do not match.',
      'register.success': 'Account created! Redirecting…',
      'pw.rule.len': '8 chars min',
      'pw.rule.upper': '1 uppercase',
      'pw.rule.num': '1 number',
      'forgot.title': 'Forgot password',
      'forgot.sub': 'Password reset by email',
      'forgot.email': 'Email address',
      'forgot.btn': 'Send link',
      'forgot.loading': 'Sending…',
      'forgot.back': 'Back to login',
      'forgot.desc': 'Enter your email to receive a reset link.',
      'forgot.success-title': 'Email sent!',
      'forgot.success-desc': 'Check your inbox. Link expires in 24h.',
      'admin.title': 'Administrator Access',
      'admin.sub': 'Restricted control panel',
      'admin.warning': 'Access restricted to authorized staff.',
      'admin.email': 'Admin email',
      'admin.password': 'Password',
      'admin.btn': 'Access panel',
      'admin.loading': 'Verifying…',
      'admin.status': 'Secured zone',
      'dashboard.welcome': 'Welcome',
      'dashboard.credits': 'Credits',
      'dashboard.services': 'Services',
      'dashboard.panels': 'Panels',
      'dashboard.profile': 'Profile',
      'dashboard.admin': 'Admin',
      'dashboard.logout': 'Logout',
      'dashboard.my-panels': 'My Panels',
      'dashboard.shop': 'Shop',
      'panel.title': 'Panel Shop',
      'panel.sub': 'Choose your plan',
      'panel.credits-available': 'credits available',
      'panel.buy': 'Get plan',
      'panel.basic': 'Basic',
      'panel.pro': 'Pro',
      'panel.premium': 'Premium',
      'common.loading': 'Loading…',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.confirm': 'Confirm',
      'common.delete': 'Delete',
      'common.search': 'Search…',
      'common.no-results': 'No results',
      'common.actions': 'Actions',
      'admin.panel.title': 'Admin Panel',
      'admin.stats': 'Statistics',
      'admin.users': 'Users',
      'admin.activity': 'Activity',
      'admin.total-users': 'Users',
      'admin.active-users': 'Active',
      'admin.banned-users': 'Banned',
      'admin.total-credits': 'Credits issued',
      'admin.ban': 'Ban',
      'admin.unban': 'Unban',
      'admin.edit-credits': 'Credits',
      'admin.delete': 'Delete',
      'admin.edit-credits-title': 'Edit credits',
      'admin.delete-title': 'Delete account',
      'admin.delete-confirm': 'This action cannot be undone.',
      'bots.deploy': 'Deploy',
      'bots.cost.rok': 'from 7 CR',
      'bots.cost.knut': 'from 10 CR',
      'bots.cost.hades': 'from 10 CR',
      'bots.cost.raizel': 'from 10 CR',
      'bots.cost.kratos': 'from 5 CR',
      'help.title': 'Help Center',
      'help.contact': 'Contact support',
      'help.tips': 'Tips & tricks',
      'help.back': 'Back',
      'support.title': 'Contact support',
      'support.problem': 'Describe your issue',
      'support.send': 'Send to support',
      'support.sending': 'Sending…',
      'support.sent': 'Message sent!',
      'support.inbox': 'My requests',
      'back': 'Back',
    }
  };

  function t(key) { return (translations[lang] || translations['fr'])[key] || key; }

  function setLang(l) {
    lang = l;
    localStorage.setItem(KEY, l);
    // Update html lang attribute
    document.documentElement.setAttribute('lang', l);
    document.querySelectorAll('.lang-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === l);
    });
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      const attr = el.getAttribute('data-i18n-attr');
      if (attr) el.setAttribute(attr, t(k));
      else el.textContent = t(k);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = t(el.getAttribute('data-i18n-ph'));
    });
    // Broadcast to all tabs
    try { localStorage.setItem('krinyx_lang_update', Date.now()); } catch(e) {}
  }

  function init() { setLang(lang); }
  function current() { return lang; }

  return { t, setLang, init, current };
})();

//  SCROLL HIDE BOTTOM NAV 
function initScrollNav() {
  const scrollable = document.querySelector('[data-scrollable="main"]') ||
    document.getElementById('main') || document.querySelector('.main-content') ||
    document.querySelector('.body') || window;
  const bottomNav = document.querySelector('.bottom-nav');
  if (!bottomNav) return;

  let lastY = 0;
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentY = scrollable === window ? window.scrollY : scrollable.scrollTop;
        const delta = currentY - lastY;
        if (delta > 10) {
          // Scrolling down → hide
          bottomNav.style.transform = 'translateY(100%)';
        } else if (delta < -5) {
          // Scrolling up → show
          bottomNav.style.transform = 'translateY(0)';
        }
        lastY = currentY;
        ticking = false;
      });
      ticking = true;
    }
  }

  if (scrollable === window) {
    window.addEventListener('scroll', onScroll, { passive: true });
  } else {
    scrollable.addEventListener('scroll', onScroll, { passive: true });
  }
}

//  BACK BUTTON 
function injectBackButton(container) {
  if (document.getElementById('dh-back-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'dh-back-btn';
  btn.className = 'dh-back-btn';
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg> <span data-i18n="back">Retour</span>`;
  btn.onclick = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/dashboard';
    }
  };
  const el = container || document.querySelector('.main-content') || document.querySelector('.body') || document.body;
  el.insertBefore(btn, el.firstChild);
  i18n.init();
}

//  TOPBAR INJECTION 
function injectTopbar(logoHref = '#') {
  const tb = document.createElement('div');
  tb.className = 'topbar';
  tb.innerHTML = `
    <a href="${logoHref}" class="dh-logo topbar-left">
      <div class="dh-logo-mark"><img src="/logo.jpg" alt="Krinyx" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'"/></div>
      <span style="font-family:'Syne',sans-serif;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;">Krinyx</span>
    </a>
    <button id="topbar-back-btn" class="topbar-back-btn" title="Retour" style="display:none;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <div class="credits-pill" id="topbar-credits" style="display:flex;align-items:center;gap:4px;font-size:.75rem;font-weight:700;color:var(--text-2);opacity:0;transition:opacity .2s;">
      <span id="topbar-credits-val">0</span><span style="color:var(--text-3);font-weight:600;">CR</span>
    </div>
    <div class="lang-toggle">
      <button class="lang-btn" data-lang="fr" onclick="i18n.setLang('fr')">FR</button>
      <button class="lang-btn" data-lang="en" onclick="i18n.setLang('en')">EN</button>
    </div>
    <button class="theme-toggle" id="theme-toggle" onclick="ThemeManager.toggle()" title="Toggle theme"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg></button>
  `;
  document.body.insertBefore(tb, document.body.firstChild);

  // Bouton retour : caché sur le dashboard, visible ailleurs
  const backBtn = document.getElementById('topbar-back-btn');
  if (backBtn) {
    const isDashboard = window.location.pathname === '/' || window.location.pathname === '/dashboard';
    if (!isDashboard) {
      backBtn.style.display = 'inline-flex';
      backBtn.addEventListener('click', () => {
        if (window.history.length > 1) window.history.back();
        else window.location.href = '/dashboard';
      });
    }
  }

  // Charger le solde réel depuis /api/me
  fetch('/api/me', { credentials: 'include' })
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      const el  = document.getElementById('topbar-credits-val');
      const pill = document.getElementById('topbar-credits');
      if (!el || !pill) return;
      if (data && data.success && data.user) {
        const coins = data.user.coins !== undefined ? data.user.coins : (data.user.credits || 0);
        el.textContent = coins.toLocaleString('fr-FR');
        pill.classList.add('loaded');
        // Rendre disponible globalement pour les autres scripts de la page
        window._dhCredits = coins;
        window._dhUser    = data.user;
      } else {
        // Non connecté — masquer le badge
        pill.style.display = 'none';
      }
    })
    .catch(() => {
      const pill = document.getElementById('topbar-credits');
      if (pill) pill.style.display = 'none';
    });
}

// Permet aux autres scripts de mettre à jour le solde affiché dans la topbar
function updateTopbarCredits(newCoins) {
  const el   = document.getElementById('topbar-credits-val');
  const pill = document.getElementById('topbar-credits');
  if (!el) return;
  el.textContent = Number(newCoins).toLocaleString('fr-FR');
  if (pill && !pill.classList.contains('loaded')) pill.classList.add('loaded');
  window._dhCredits = newCoins;
}

//  CROSS-TAB SYNC 
window.addEventListener('storage', (e) => {
  if (e.key === 'krinyx_theme_update') {
    ThemeManager.init();
  }
  if (e.key === 'krinyx_lang_update') {
    i18n.init();
  }
});

//  AUTO INIT 
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  i18n.init();

  // Injecte la topbar partout, sauf sur les pages qui ont déjà leur propre
  // en-tête (auth-page : login/register/forgot, ou .hdr : admin).
  const hasOwnHeader = document.querySelector('.auth-page') || document.querySelector('.hdr');
  if (!hasOwnHeader && !document.querySelector('.topbar')) {
    injectTopbar('/dashboard');
  }

  initScrollNav();
});