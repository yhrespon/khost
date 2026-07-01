// protections.js
import chalk from "chalk";

// =================== CONFIG ===================
export const statusProtections = {
  antiLink: false,
  antiPromote: false,
  antiDemote: false,
  antiBot: false,
  antiTag: false,
  antiSpam: false
};

// =================== SPAM TRACKER ===================
const spamTracker = {}; // { groupId: { sender: [timestamps] } }

// =================== HELPERS ===================

// Normalise un JID ou numéro WhatsApp en simple numéro
export function getBareNumber(input) {
  if (!input) return "";
  const s = String(input);
  const beforeAt = s.split("@")[0];
  const beforeColon = beforeAt.split(":")[0];
  return beforeColon.replace(/[^0-9]/g, "");
}

// Vérifie si un utilisateur est protégé (bot, owner, sudo)
export function isProtected(sender, sock) {
  const bareSender = getBareNumber(sender);

  // Bot principal + LID
  const botJid = sock.user?.id?.split(":")[0] || "";
  const botLid = sock.user?.lid?.split(":")[0] || "";

  // Owners et sudo
  const ownersList = global.owners || [];
  const sudoList = global.bot?.config?.sudoList?.map(n => getBareNumber(n)) || [];

  if (bareSender === botJid) return true;
  if (botLid && bareSender === botLid) return true;
  if (ownersList.includes(bareSender)) return true;
  if (sudoList.includes(bareSender)) return true;

  return false;
}

// Récupère le texte d'un message
export function getMessageText(msg) {
  return (
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    msg.message.imageMessage?.caption ||
    msg.message.videoMessage?.caption
  ) || "";
}

// =================== ANTI FONCTIONS ===================

export function antiLink(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    if (!statusProtections.antiLink) return;
    for (const msg of messages) {
      if (!msg.message) continue;
      const from = msg.key.remoteJid;
      if (!from.endsWith("@g.us")) continue;

      const sender = msg.key.participant || from;
      if (isProtected(sender, sock)) continue;

      const text = getMessageText(msg);
      if (!text) continue;

      const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-z0-9.-]+\.[a-z]{2,}\b)/gi;
      if (linkRegex.test(text)) {
        try {
          await sock.sendMessage(from, { delete: msg.key });
          console.log(chalk.yellow(`[ANTI-LINK] Lien supprimé de ${sender} dans ${from}`));
        } catch (e) { console.error(e); }
      }
    }
  });
}

export function antiPromote(sock) {
  sock.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.antiPromote) return;
    if (update.action !== "promote") return;

    try {
      for (const participant of update.participants) {
        if (isProtected(participant, sock)) continue;
        await sock.groupParticipantsUpdate(update.id, [participant], "demote");
        console.log(chalk.yellow(`[ANTI-PROMOTE] ${participant} rétrogradé dans ${update.id}`));
      }
    } catch (e) { console.error(e); }
  });
}

export function antiDemote(sock) {
  sock.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.antiDemote) return;
    if (update.action !== "demote") return;

    try {
      for (const participant of update.participants) {
        if (isProtected(participant, sock)) continue;
        await sock.groupParticipantsUpdate(update.id, [participant], "promote");
        console.log(chalk.yellow(`[ANTI-DEMOTE] ${participant} re-promu dans ${update.id}`));
      }
    } catch (e) { console.error(e); }
  });
}

export function antiBot(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    if (!statusProtections.antiBot) return;
    for (const msg of messages) {
      if (!msg.message) continue;
      const from = msg.key.remoteJid;
      if (!from.endsWith("@g.us")) continue;

      const sender = msg.key.participant || from;
      if (isProtected(sender, sock) || msg.key.fromMe) continue;

      const text = getMessageText(msg);
      if (!text) continue;

      try {
        if (/^[!?#.$%&*+\-\/:;=?@^_`~]/.test(text)) {
          await sock.sendMessage(from, { delete: msg.key });
          await sock.groupParticipantsUpdate(from, [sender], "remove");
          console.log(chalk.red(`[ANTI-BOT] ${sender} kické pour message suspect dans ${from}`));
        }
      } catch (err) { console.error("[ANTI-BOT]", err.message); }
    }
  });
}

export function antiTag(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    if (!statusProtections.antiTag) return;
    for (const msg of messages) {
      if (!msg.message) continue;
      const from = msg.key.remoteJid;
      if (!from.endsWith("@g.us")) continue;

      const sender = msg.key.participant || from;
      if (isProtected(sender, sock) || msg.key.fromMe) continue;

      const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (mentions.some(m => isProtected(m, sock))) {
        try {
          await sock.sendMessage(from, { delete: msg.key });
          await sock.groupParticipantsUpdate(from, [sender], "remove");
          console.log(chalk.red(`[ANTI-TAG] ${sender} kické pour mention protégée dans ${from}`));
        } catch (err) { console.error("[ANTI-TAG]", err.message); }
      }
    }
  });
}

export function antiSpam(sock) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    if (!statusProtections.antiSpam) return;
    for (const msg of messages) {
      if (!msg.message) continue;
      const from = msg.key.remoteJid;
      if (!from.endsWith("@g.us")) continue;

      const sender = msg.key.participant || from;
      if (isProtected(sender, sock) || msg.key.fromMe) continue;

      const now = Date.now();
      if (!spamTracker[from]) spamTracker[from] = {};
      if (!spamTracker[from][sender]) spamTracker[from][sender] = [];
      spamTracker[from][sender].push(now);
      spamTracker[from][sender] = spamTracker[from][sender].filter(ts => now - ts <= 3000); // 3s

      if (spamTracker[from][sender].length >= 5) {
        try {
          await sock.sendMessage(from, { delete: msg.key });
          await sock.groupParticipantsUpdate(from, [sender], "remove");
          spamTracker[from][sender] = [];
          console.log(chalk.red(`[ANTI-SPAM] ${sender} kické pour spam dans ${from}`));
        } catch {}
      }
    }
  });
}

// =================== INIT ===================
export function initProtections(sock) {
  antiLink(sock);
  antiPromote(sock);
  antiDemote(sock);
  antiBot(sock);
  antiTag(sock);
  antiSpam(sock);
}