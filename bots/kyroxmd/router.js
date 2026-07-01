/**
 * ╔══════════════════════════════════════════════════════╗
 * ║         KYRO XMD V1 — Module Router (ESM)           ║
 * ║              Krinyx — Dev Raizel & Dev Knut          ║
 * ╚══════════════════════════════════════════════════════╝
 *
 *  Routes :
 *    /kyroxmd/pair   → codes de pairing Baileys
 *    /kyroxmd/status → statut bot
 */

import express    from 'express';
import pairRouter from './pair.js';

const router = express.Router();

router.use('/pair', pairRouter);

router.get('/status', (req, res) => {
  res.json({ ok: true, bot: 'KYRO XMD V1', message: 'Utilisez /api/bot/status depuis server.js' });
});

export default router;
