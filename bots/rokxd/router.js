/**
 * ╔══════════════════════════════════════════════════════╗
 * ║         ROK XD — Module Router (ESM)                ║
 * ║   Importé par le server.js principal de Krinyx      ║
 * ╚══════════════════════════════════════════════════════╝
 *
 *  Ce fichier exporte un router Express qui monte :
 *    /rokxd/pair-api  → codes de pairing Baileys
 *    /rokxd/qr        → QR codes Baileys
 *    /rokxd/status    → statut bot d'un user
 *    /rokxd/config    → config préfixe
 *    /rokxd/sessions  → infos sessions actives (admin)
 */

import express   from 'express';
import pairRouter from './pair.js';
import qrRouter   from './qr.js';

const router = express.Router();

/* ── Monter les sous-routers Baileys ── */
router.use('/pair-api', pairRouter);
router.use('/qr',       qrRouter);

/* ── GET /rokxd/status — statut bot d'un utilisateur ── */
router.get('/status', (req, res) => {
  // La logique de statut est gérée côté server.js (MySQL)
  // Ce endpoint est un alias simple retourné depuis le router
  res.json({ ok: true, message: 'Utilisez /api/bot/status depuis server.js' });
});

export default router;
