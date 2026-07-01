// =================== DEMOTE ALL COMMAND ===================
export default {
  name: "demoteall",
  description: "Démote tous les admins non protégés du groupe",
  execute: async (sock, ctx, args) => {
    const from = ctx.from || "";
    const sender = ctx.sender || from;
    if (!from.endsWith("@g.us")) return ctx.reply("⚠️ Cette commande est uniquement pour les groupes.");

    try {
      const metadata = await sock.groupMetadata(from);
      const participants = metadata.participants || [];

      // =================== HELPERS ===================
      const getBareNumber = (input) => {
        if (!input) return "";
        const s = String(input);
        const beforeAt = s.split("@")[0];
        const beforeColon = beforeAt.split(":")[0];
        return beforeColon.replace(/[^0-9]/g, "");
      };

      const isProtected = (jid) => {
        const ownersList = global.owners || [];
        const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        const botLid = sock.user.lid ? sock.user.lid.split(":")[0] + "@lid" : null;
        const sudoList = (global.bots?.get(botJid)?.config?.sudoList || []).map(n => n.split("@")[0]);
        const idBare = jid.split("@")[0];

        return (
          idBare === botJid.split("@")[0] ||
          (botLid && idBare === botLid.split("@")[0]) ||
          ownersList.includes(idBare) ||
          sudoList.includes(idBare)
        );
      };

      // Filtrer les admins à démoter
      const toDemote = participants
        .filter(p => p.admin && !isProtected(p.id))
        .map(p => p.id);

      if (toDemote.length === 0) {
        return ctx.reply("⚠️ Aucun admin à démoter (protection bot/LID/owner/sudo active).");
      }

      await sock.groupParticipantsUpdate(from, toDemote, "demote");
      if (ctx.msgKey) await sock.sendMessage(from, { react: { text: "⬇️", key: ctx.msgKey } });

      const teks = `⬇️ Démoté ${toDemote.map(t => `@${t.split("@")[0]}`).join(", ")}`;
      await sock.sendMessage(from, { text: teks, mentions: toDemote });

    } catch (err) {
      console.error("❌ Erreur demoteAll :", err);
      ctx.reply("❌ Impossible de démoter les admins.");
    }
  }
};