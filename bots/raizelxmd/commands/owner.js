// ✅ commands/owner.js — version RAIZEL
export default {
  name: "owner",
  description: "Envoie le contact du propriétaire",
  execute: async (sock, ctx, args) => {
    try {
      const to = ctx.from || "";
      const reply = ctx.reply || (() => {});

      if (!to) return;

      const vcard =
        'BEGIN:VCARD\n' +
        'VERSION:3.0\n' +
        'FN: DEVRAIZEL\n' +
        'ORG: RAIZEL XMD;\n' +
        'TEL;type=CELL;type=VOICE;waid=237699777530:+237699777530\n' +
        'END:VCARD';

      await sock.sendMessage(to, {
        contacts: {
          displayName: "_*RAIZEL XMD*_",
          contacts: [{ vcard }]
        }
      });

      await reply("✅ Contact du propriétaire envoyé !");
      console.log(`[OWNER] vCard envoyée à ${to}`);
    } catch (err) {
      console.error("Erreur owner :", err);
      const reply = ctx.reply || (() => {});
      await reply("❌ Impossible d'envoyer le contact du propriétaire.");
    }
  }
};