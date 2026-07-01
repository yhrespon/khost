import { getDevice } from "@whiskeysockets/baileys";

export default {
  name: "device",
  description: "Révèle l’appareil utilisé par un utilisateur",

  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;

      // Vérifie si on a répondu à un message
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      if (!ctx?.stanzaId || !ctx?.participant) {
        return await sock.sendMessage(
          from,
          {
            text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ *Invocation incomplète !*
⚔️ Réponds à un message pour que je sonde
l’appareil de cette âme.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`
          },
          { quoted: msg }
        );
      }

      // Construire une "fake key/id" pour getDevice
      const stanzaId = ctx.stanzaId;
      const participant = ctx.participant;

      // getDevice attend généralement un id / message key - on tente d'appeler proprement
      let device = "Inconnu";
      try {
        const result = getDevice(stanzaId);
        if (result) device = result;
      } catch (e) {
        // fallback : on laisse device = "Inconnu"
      }

      const targetNumber = participant?.split?.("@")?.[0] || "inconnu";

      const reply = `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
📱 *Révélation d’Hadès*
L’âme visée : (${targetNumber})
manipule un appareil *${device}*.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`;

      await sock.sendMessage(from, { text: reply }, { quoted: msg });
    } catch (err) {
      console.error("❌ Erreur device :", err);
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗
❌ *Échec de la divination !*
Impossible de sonder l’appareil ciblé.
╚════ஜ۩۞۩ஜ═════╝

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`
        },
        { quoted: msg }
      );
    }
  },
};