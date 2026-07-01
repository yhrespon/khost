import express   from 'express';
import pairRouter from './pair.js';
import qrRouter   from './qr.js';

const router = express.Router();

/* ── Monter les sous-routers Baileys ── */
router.use('/pair', pairRouter);
router.use('/qr',   qrRouter);

/* ── GET /sadeusxmd/status — statut bot d'un utilisateur ── */
router.get('/status', (req, res) => {
  // La logique de statut est gérée côté server.js (MySQL)
  // Ce endpoint est un alias simple retourné depuis le router
  res.json({ ok: true, message: 'Utilisez /api/bot/status depuis server.js' });
});

export default router;