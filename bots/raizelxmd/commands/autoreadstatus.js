// commands/autoreadstatus.js
export default {
  name: "autoreadstatus",
  description: "Active ou désactive Auto Read Status",

  init() {
    if (global.bot.autoreadstatus === undefined) {
      global.bot.autoreadstatus = false;
    }
  },

  execute: async (sock, ctx, args) => {
    try {
      const from = ctx.from || "";
      if (!from) return;

      const option = args[0]?.toLowerCase();

      if (!option) {
        return ctx.reply(`Auto Read Status : ${global.bot.autoreadstatus ? "ACTIVÉ ✅" : "DÉSACTIVÉ ❌"}`);
      }

      if (option === "on") {
        global.bot.autoreadstatus = true;
        return ctx.reply("Auto Read Status + Auto React ACTIVÉ ✅");
      }

      if (option === "off") {
        global.bot.autoreadstatus = false;
        return ctx.reply("Auto Read Status + Auto React DÉSACTIVÉ ❌");
      }

      ctx.reply("Usage : .autoreadstatus on / off");
    } catch (err) {
      console.error("[autoreadstatus.execute]", err);
      if (ctx.reply) ctx.reply("Erreur lors de l'exécution de la commande.");
    }
  }
};