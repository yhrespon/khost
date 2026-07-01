// commands/groupUnified.js
import fs from "fs";
import chalk from "chalk";

// =======================
// HELPERS
const SUDO_FILE = "./sudo.json";

function loadSudo() {
  if (!fs.existsSync(SUDO_FILE)) return [];
  return JSON.parse(fs.readFileSync(SUDO_FILE, "utf-8"));
}

function getBareNumber(input) {
  if (!input) return "";
  return String(input).split("@")[0].replace(/[^0-9]/g, "");
}

// Vérifie si l'expéditeur est owner / sudo / lid
async function isOwner(sock, sender) {
  try {
    const sudoList = global.bot?.config?.sudoList || [];
    const ownerNum = global.owner || "";

    const botNumber = sock.user?.id.split(":")[0] + "@s.whatsapp.net";
    let userLid = "";
    try {
      const data = fs.existsSync(`sessions/${botNumber}/creds.json`)
        ? JSON.parse(fs.readFileSync(`sessions/${botNumber}/creds.json`, "utf8"))
        : {};
      userLid = data?.me?.lid || sock.user?.lid || "";
    } catch {
      userLid = sock.user?.lid || "";
    }

    const lidList = userLid ? [userLid.split(":")[0] + "@lid"] : [];
    const normalizedSender = sender.includes("@") ? sender : sender + "@s.whatsapp.net";
    const bareSender = getBareNumber(sender);

    return (
      sudoList.includes(bareSender) ||                  // sudoList du bot
      ownerNum === bareSender ||                        // global.owner
      lidList.includes(normalizedSender) ||            // LID
      loadSudo().map(getBareNumber).includes(bareSender) // fichier sudo.json
    );
  } catch (err) {
    console.error("Erreur isOwner:", err);
    return false;
  }
}

// Vérifie si un utilisateur est protégé (bot, owner, sudo)
function isProtectedUser(id, sock) {
  const botJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
  const protectedIds = [
    botJid,
    ...(global.owners || []).map(n => n + "@s.whatsapp.net"),
    ...((global.bot?.config?.sudoList) || []).map(n => n + "@s.whatsapp.net"),
    global.owner + "@s.whatsapp.net"
  ];
  return protectedIds.includes(id);
}

// =======================
// COMMANDES UNIFIÉES
export const groupCommands = [
  // ---- ROLE COMMANDS ----
  {
    name: "promote",
    description: "Promouvoir un ou plusieurs membres",
    async execute(sock, ctx) {
      const { from, sender, raw } = ctx;
      if (!(await isOwner(sock, sender))) return ctx.reply("❌ Commande réservée aux owners/sudo.");
      if (!from.endsWith("@g.us")) return ctx.reply("❌ Commande réservée aux groupes.");

      const mentioned = raw.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      const quotedUser = raw.message?.extendedTextMessage?.contextInfo?.participant;
      let targets = [...mentioned];
      if (quotedUser && !targets.includes(quotedUser)) targets.push(quotedUser);

      if (!targets.length) return ctx.reply("⚠️ Mentionne ou répond au message de la personne à promouvoir.");

      targets = targets.filter(t => !isProtectedUser(t, sock));
      if (!targets.length) return ctx.reply("⚠️ Aucun membre à promouvoir (protection active).");

      await sock.groupParticipantsUpdate(from, targets, "promote");
      await sock.sendMessage(from, { react: { text: "⬆️", key: raw.key } });
      ctx.reply(`✅ ${targets.map(t => `@${getBareNumber(t)}`).join(", ")} est maintenant admin.`);
    }
  },
  {
    name: "demote",
    description: "Rétrograder un ou plusieurs admins",
    async execute(sock, ctx) {
      const { from, sender, raw } = ctx;
      if (!(await isOwner(sock, sender))) return ctx.reply("❌ Commande réservée aux owners/sudo.");
      if (!from.endsWith("@g.us")) return ctx.reply("❌ Commande réservée aux groupes.");

      const mentioned = raw.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      const quotedUser = raw.message?.extendedTextMessage?.contextInfo?.participant;
      let targets = [...mentioned];
      if (quotedUser && !targets.includes(quotedUser)) targets.push(quotedUser);

      if (!targets.length) return ctx.reply("⚠️ Mentionne ou répond au message de la personne à rétrograder.");

      targets = targets.filter(t => !isProtectedUser(t, sock));
      if (!targets.length) return ctx.reply("⚠️ Aucun admin à démoter (protection active).");

      await sock.groupParticipantsUpdate(from, targets, "demote");
      await sock.sendMessage(from, { react: { text: "⬇️", key: raw.key } });
      ctx.reply(`✅ ${targets.map(t => `@${getBareNumber(t)}`).join(", ")} n’est plus admin.`);
    }
  },
  {
    name: "promoteall",
    description: "Promouvoir tous les membres non-admins",
    async execute(sock, ctx) {
      const { from, sender, raw } = ctx;
      if (!(await isOwner(sock, sender))) return ctx.reply("❌ Commande réservée aux owners/sudo.");
      if (!from.endsWith("@g.us")) return ctx.reply("❌ Commande réservée aux groupes.");

      const metadata = await sock.groupMetadata(from);
      const participants = metadata.participants || [];
      const toPromote = participants
        .filter(p => !p.admin && !isProtectedUser(p.id, sock))
        .map(p => p.id);

      if (!toPromote.length) return ctx.reply("✅ Tous les membres sont déjà admins ou protégés.");
      await sock.groupParticipantsUpdate(from, toPromote, "promote");
      await sock.sendMessage(from, { react: { text: "🔼", key: raw.key } });
      ctx.reply(`🔼 ${toPromote.length} membre(s) promu(s) admin.`);
    }
  },

  // ---- GROUP MANAGEMENT ----
  {
    name: "kick",
    description: "Expulse un ou plusieurs membres mentionnés ou en reply",
    async execute(sock, ctx) {
      const { from, sender, raw } = ctx;
      if (!(await isOwner(sock, sender))) return ctx.reply("❌ Commande réservée aux owners/sudo.");
      if (!from.endsWith("@g.us")) return ctx.reply("❌ Commande réservée aux groupes.");

      const mentioned = raw.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      const quotedUser = raw.message?.extendedTextMessage?.contextInfo?.participant;
      let targets = [...mentioned];
      if (quotedUser && !targets.includes(quotedUser)) targets.push(quotedUser);

      if (!targets.length) return ctx.reply("⚠️ Mentionne ou répond au message de la personne à expulser.");

      targets = targets.filter(t => !isProtectedUser(t, sock));
      if (!targets.length) return ctx.reply("⚠️ Aucun membre à expulser (protection active).");

      await sock.groupParticipantsUpdate(from, targets, "remove");
      ctx.reply(`✅ ${targets.map(t => `@${getBareNumber(t)}`).join(", ")} expulsé(s) avec succès.`);
    }
  },
  {
    name: "add",
    description: "Ajouter un membre via numéro",
    async execute(sock, ctx, args) {
      const { from, sender } = ctx;
      if (!(await isOwner(sock, sender))) return ctx.reply("❌ Commande réservée aux owners/sudo.");
      if (!from.endsWith("@g.us")) return ctx.reply("❌ Commande réservée aux groupes.");
      if (!args[0]) return ctx.reply("❌ Fournis un numéro à ajouter.");

      const jid = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
      await sock.groupParticipantsUpdate(from, [jid], "add");
      ctx.reply(`✅ @${getBareNumber(jid)} ajouté au groupe.`);
    }
  },
  {
    name: "mute",
    description: "Mute tous les membres",
    async execute(sock, ctx) {
      const { from, sender } = ctx;
      if (!(await isOwner(sock, sender))) return ctx.reply("❌ Commande réservée aux owners/sudo.");
      if (!from.endsWith("@g.us")) return ctx.reply("❌ Commande réservée aux groupes.");

      await sock.groupSettingUpdate(from, "announcement");
      ctx.reply("🔇 Tous les membres ont été mutés.");
    }
  },
  {
    name: "unmute",
    description: "Démute tous les membres",
    async execute(sock, ctx) {
      const { from, sender } = ctx;
      if (!(await isOwner(sock, sender))) return ctx.reply("❌ Commande réservée aux owners/sudo.");
      if (!from.endsWith("@g.us")) return ctx.reply("❌ Commande réservée aux groupes.");

      await sock.groupSettingUpdate(from, "not_announcement");
      ctx.reply("🔊 Tous les membres peuvent envoyer des messages.");
    }
  },
  {
    name: "link",
    description: "Récupère le lien d'invitation du groupe",
    async execute(sock, ctx) {
      const { from, sender } = ctx;
      if (!(await isOwner(sock, sender))) return ctx.reply("❌ Commande réservée aux owners/sudo.");
      if (!from.endsWith("@g.us")) return ctx.reply("❌ Commande réservée aux groupes.");

      const inviteCode = await sock.groupInviteCode(from);
      ctx.reply(`🔗 Lien d'invitation : https://chat.whatsapp.com/${inviteCode}`);
    }
  },

  // ---- MASS COMMANDS ----
  {
    name: "kickall",
    description: "Expulse tous les membres non-admins",
    async execute(sock, ctx) {
      const { from, sender } = ctx;
      if (!(await isOwner(sock, sender))) return ctx.reply("❌ Commande réservée aux owners/sudo.");
      if (!from.endsWith("@g.us")) return ctx.reply("❌ Commande réservée aux groupes.");

      const metadata = await sock.groupMetadata(from);
      const participants = metadata.participants || [];
      const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
      const botLid = sock.user.lid ? sock.user.lid.split(":")[0] + "@lid" : null;
      const owners = (global.bot?.config?.sudoList || []).map(getBareNumber);
      const sudoList = loadSudo().map(getBareNumber);
      const ownerNum = getBareNumber(global.owner || "");

      const toKick = participants
        .filter(p => {
          const idBare = getBareNumber(p.id);
          const isBot = idBare === getBareNumber(botJid) || (botLid && idBare === getBareNumber(botLid));
          const isOwner = owners.includes(idBare) || idBare === ownerNum;
          const isSudo = sudoList.includes(idBare);
          return !p.admin && !isBot && !isOwner && !isSudo;
        })
        .map(p => p.id);

      if (!toKick.length) return ctx.reply("⚠️ Aucun membre non-admin à expulser.");

      await ctx.reply(`Expulsion en cours : ${toKick.length} membre(s).`);
      for (let i = 0; i < toKick.length; i += 5) {
        const chunk = toKick.slice(i, i + 5);
        try { await sock.groupParticipantsUpdate(from, chunk, "remove"); } catch {}
        await new Promise(res => setTimeout(res, 3000));
      }
      ctx.reply(`✅ Kickall terminé : ${toKick.length} membres expulsés.`);
    }
  },
  {
    name: "purge",
    description: "Expulse tous les membres non-admins (protection active)",
    async execute(sock, ctx) {
      const { from, sender } = ctx;
      if (!(await isOwner(sock, sender))) return ctx.reply("❌ Commande réservée aux owners/sudo.");
      if (!from.endsWith("@g.us")) return ctx.reply("❌ Commande réservée aux groupes.");

      const metadata = await sock.groupMetadata(from);
      const participants = metadata.participants || [];
      const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
      const botLid = sock.user.lid ? sock.user.lid.split(":")[0] + "@lid" : null;
      const owners = (global.bot?.config?.sudoList || []).map(getBareNumber);
      const sudoList = loadSudo().map(getBareNumber);
      const ownerNum = getBareNumber(global.owner || "");

      const toKick = participants
        .filter(p => {
          const idBare = getBareNumber(p.id);
          const isBot = idBare === getBareNumber(botJid) || (botLid && idBare === getBareNumber(botLid));
          const isOwner = owners.includes(idBare) || idBare === ownerNum;
          const isSudo = sudoList.includes(idBare);
          return !p.admin && !isBot && !isOwner && !isSudo;
        })
        .map(p => p.id);

      if (!toKick.length) return ctx.reply("⚠️ Aucun membre à expulser.");

      await sock.groupParticipantsUpdate(from, toKick, "remove");
      ctx.reply(`✅ Purge terminée : ${toKick.length} membres expulsés.`);
    }
  },
  {
    name: "dlt",
    description: "Supprime le message auquel vous répondez",
    async execute(sock, ctx) {
      const { from, raw } = ctx;
      if (!raw.message?.extendedTextMessage?.contextInfo?.stanzaId) {
        return ctx.reply("⚠️ Réponds au message que tu veux supprimer.");
      }

      await sock.sendMessage(from, {
        delete: {
          remoteJid: from,
          fromMe: false,
          id: raw.message.extendedTextMessage.contextInfo.stanzaId,
          participant: raw.message.extendedTextMessage.contextInfo.participant
        }
      });
      ctx.reply("✅ Message supprimé.");
    }
  }
];

export default groupCommands;