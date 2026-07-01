/**
 * ╔══════════════════════════════════════════════════════╗
 * ║         HADES XMD — Module Router (ESM)             ║
 * ║   Importé par le server.js principal de Krinyx      ║
 * ╚══════════════════════════════════════════════════════╝
 */

import express    from 'express';
import pairRouter from './pair.js';

const router = express.Router();

router.use('/pair', pairRouter);

router.get('/status', (req, res) => {
  res.json({ ok: true, bot: 'HADES XMD', message: 'Utilisez /api/bot/status depuis server.js' });
});

export default router;
