export default {
  name: "purgeall",
  description: "Expulse tous les membres et admins sauf le bot",
  async execute(sock, msg, args) {
    const from = msg?.key?.remoteJid;
    const botJid = (sock?.user?.id || sock?.user?.jid || "").split?.(":")?.[0] || "";

    if (!from || !from.endsWith("@g.us")) {
      await sock.sendMessage(from || msg.key.remoteJid, {
        text: "『 ⚔️ 𝐇𝐀𝐃È𝐒 𝐌𝐃𝐗 ⚔️ 』\n🚫 Cette invocation est réservée aux *groupes*."
      }, { quoted: msg });
      return;
    }

    try {
      const groupData = await sock.groupMetadata(from);
      const participants = groupData.participants || [];

      const toKick = participants
        .map(p => p.id)
        .filter(id => id !== botJid);

      if (toKick.length === 0) {
        await sock.sendMessage(from, {
          text: "『 ⚔️ 𝐇𝐀𝐃È𝐒 𝐌𝐃𝐗 ⚔️ 』\n😼 Aucun membre à expulser…"
        }, { quoted: msg });
        return;
      }

      const allMembers = participants.map(p => p.id);

      const countdownFrames = [
        "⏳ 5... Les ténèbres s’éveillent…",
        "⏳ 4... Le voile se déchire…",
        "⏳ 3... Les ombres avancent…",
        "⏳ 2... Le jugement approche…",
        "⏳ 1... L’instant fatal 💀"
      ];
      for (const frame of countdownFrames) {
        await sock.sendMessage(from, {
          text: `『 ⚔️ 𝐇𝐀𝐃È𝐒 𝐌𝐃𝐗 ⚔️ 』\n${frame}`,
          mentions: allMembers
        });
        await new Promise(r => setTimeout(r, 1000));
      }

      const purgeText = `╔═══『 𝐏𝐔𝐑𝐆𝐄 𝐓𝐎𝐓𝐀𝐋𝐄 』═══╗
🔥 Le voile de l’illusion se déchire...
💀 Les âmes, qu'elles soient nobles ou corrompues, sont livrées à l’abîme.
⚔️ Aucun serment ne les sauvera.
🌑 L’ombre consume tout.
⚡ Le jugement suprême frappe. ⚡

> Exécuté par Hadès MDX 👁️
╚═════════════════════════╝`;

      await sock.sendMessage(from, {
        image: { url: "https://files.catbox.moe/kz5ukd.jpg" },
        caption: purgeText,
        mentions: allMembers
      });

      await sock.groupParticipantsUpdate(from, toKick, "remove");

      await sock.sendMessage(from, {
        text: `『 ⚔️ 𝐇𝐀𝐃È𝐒 𝐌𝐃𝐗 ⚔️ 』

⚔️ Purge totale accomplie : *${toKick.length}* âmes arrachées.

🔮 Seul le bot a survécu.`
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ Erreur purge-total :", err);
      await sock.sendMessage(from, {
        text: "『 ⚔️ 𝐇𝐀𝐃È𝐒 𝐌𝐃𝐗 ⚔️ 』\n❌ Les ombres ont échoué à frapper.\n⚠️ Vérifie mes permissions ou invoque-moi de nouveau."
      }, { quoted: msg });
    }
  }
};