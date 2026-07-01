/**
 * Krinyx — auth.js
 * Gestion centralisée : session, API, helpers partagés
 * Dev Raizel & Dev Knut
 */

const Auth = (() => {
  const SESSION_KEY = 'krinyx_session';
  const USERS_KEY   = 'krinyx_users';   // fallback local si pas de serveur
  const API_BASE    = '';               // '' = même origine que server.js

  /*  SESSION  */
  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch { return null; }
  }

  function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function isLoggedIn() {
    return getSession() !== null;
  }

  /** Redirige vers login si pas connecté */
  function requireAuth() {
    if (!isLoggedIn()) {
      window.location.href = '/pages/login.html';
    }
  }

  /** Redirige vers dashboard si déjà connecté */
  function requireGuest() {
    if (isLoggedIn()) {
      window.location.href = '/pages/dashboard.html';
    }
  }

  /*  API HELPERS  */
  async function apiPost(endpoint, body) {
    const res = await fetch(API_BASE + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return { status: res.status, ok: res.ok, ...data };
  }

  async function apiGet(endpoint) {
    const res = await fetch(API_BASE + endpoint);
    const data = await res.json();
    return { status: res.status, ok: res.ok, ...data };
  }

  async function apiPut(endpoint, body) {
    const res = await fetch(API_BASE + endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return { status: res.status, ok: res.ok, ...data };
  }

  /*  LOCAL FALLBACK (démo sans serveur)  */
  function localHash(pw) {
    // Simple btoa pour démo — server.js utilise SHA-256
    return btoa(pw + '_krinyx');
  }

  function localGetUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
    catch { return []; }
  }

  function localSaveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  async function localRegister({ username, email, password }) {
    const users = localGetUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, message: 'Un compte existe déjà avec cet email.' };
    }
    const newUser = {
      id: 'usr_' + Date.now(),
      username, email: email.toLowerCase(),
      password: localHash(password),
      credits: 50, role: 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localSaveUsers(users);
    const { password: _, ...safe } = newUser;
    return { ok: true, success: true, user: safe, message: 'Compte créé avec 50 crédits !' };
  }

  async function localLogin({ email, password }) {
    const users = localGetUsers();
    const user = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === localHash(password)
    );
    if (!user) return { ok: false, message: 'Email ou mot de passe incorrect.' };
    const { password: _, ...safe } = user;
    return { ok: true, success: true, user: safe };
  }

  /*  ACTIONS PUBLIQUES  */

  /** Inscription : tente l'API, fallback local */
  async function register(payload) {
    try {
      const res = await apiPost('/api/register', payload);
      return res;
    } catch {
      return localRegister(payload);
    }
  }

  /** Connexion : tente l'API, fallback local */
  async function login(payload) {
    try {
      const res = await apiPost('/api/login', payload);
      return res;
    } catch {
      return localLogin(payload);
    }
  }

  /** Déconnexion */
  function logout() {
    clearSession();
    window.location.href = '/pages/login.html';
  }

  /** Mise à jour crédits locaux (après consommation) */
  function updateCredits(delta) {
    const user = getSession();
    if (!user) return;
    user.credits = Math.max(0, (user.credits || 0) + delta);
    setSession(user);
    return user.credits;
  }

  /*  VALIDATION  */
  function validatePassword(pw) {
    const errors = [];
    if (pw.length < 8)        errors.push('8 caractères minimum');
    if (!/[A-Z]/.test(pw))    errors.push('1 lettre majuscule');
    if (!/[0-9]/.test(pw))    errors.push('1 chiffre');
    return { ok: errors.length === 0, errors };
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /*  PARTICULES CANVAS (fond partagé)  */
  function initParticles(canvasId, count = 55) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const pts = Array.from({ length: count }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - .5) * .28,
      vy: (Math.random() - .5) * .28,
      r:  Math.random() * 1.3 + .3,
      a:  Math.random() * .5 + .08
    }));

    (function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 115) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0,229,255,${.13 * (1 - d / 115)})`;
            ctx.lineWidth = .5;
            ctx.stroke();
          }
        }
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,255,${p.a})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    })();
  }

  /*  TOAST  */
  function showToast(msg, type = 'info') {
    let toast = document.getElementById('dh-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'dh-toast';
      toast.style.cssText = `
        position:fixed;bottom:2rem;right:2rem;z-index:9999;
        background:rgba(5,8,16,.96);border-radius:4px;
        padding:.8rem 1.5rem;
        font-family:'Orbitron',sans-serif;font-size:.6rem;letter-spacing:2px;
        transform:translateX(200%);transition:transform .4s cubic-bezier(.175,.885,.32,1.275);
        pointer-events:none;
      `;
      document.body.appendChild(toast);
    }
    const colors = { info:'rgba(0,229,255,.35)', success:'rgba(0,230,118,.35)', error:'rgba(255,23,68,.35)' };
    const textC  = { info:'#00e5ff', success:'#00e676', error:'#ff6090' };
    toast.style.border  = `1px solid ${colors[type] || colors.info}`;
    toast.style.color   = textC[type] || textC.info;
    toast.style.boxShadow = `0 0 20px ${colors[type]}`;
    toast.textContent   = msg;
    toast.style.transform = 'none';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.transform = 'translateX(200%)'; }, 3200);
  }

  return {
    getSession, setSession, clearSession,
    isLoggedIn, requireAuth, requireGuest,
    register, login, logout,
    updateCredits,
    validatePassword, validateEmail,
    initParticles, showToast,
    apiPost, apiGet, apiPut
  };
})();
