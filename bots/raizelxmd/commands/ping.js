export default {
  name: "ping",
  aliases: ["p"],
  description: "Test de latence du bot",
  execute: async (sock, ctx, args) => {
    const from = ctx.from || "";
    if (!from) return;

    try {
      const start = Date.now();

      // Message temporaire
      await ctx.reply("Pong!");

      const latency = Date.now() - start;
      const latencyText = `Latency : ${latency} ms`;

      await ctx.reply(latencyText);

      // Réaction emoji 🕷️ au message original si disponible
      if (ctx.msgKey) {
        await sock.sendMessage(from, { react: { text: "🕷️", key: ctx.msgKey } });
      }

    } catch (err) {
      console.error("[ping.execute]", err);
      ctx.reply("⚠️ Impossible de calculer la vitesse du bot.");
    }
  }
};