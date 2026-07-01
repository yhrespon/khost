// ban.js
import fs from "fs";
import path from "path";

const BANNED_FILE = path.join(process.cwd(), "banned.json");

function ensureBannedFile() {
  if (!fs.existsSync(BANNED_FILE)) {
    fs.writeFileSync(BANNED_FILE, JSON.stringify({ banned: [] }, null, 2));
  }
}

function readBanned() {
  ensureBannedFile();
  return JSON.parse(fs.readFileSync(BANNED_FILE, "utf8")).banned || [];
}

function writeBanned(list) {
  fs.writeFileSync(
    BANNED_FILE,
    JSON.stringify({ banned: Array.from(new Set(list)) }, null, 2)
  );
}

function normalizeJid(jid) {
  if (!jid) return null;
  return String(jid).split(":")[0].replace("@lid", "@s.whatsapp.net");
}

function bare(jid) {
  if (!jid) return "";
  return normalizeJid(jid).split("@")[0].replace(/[^0-9]/g, "");
}

export default {
  name: "ban",
  description: "Bannir un utilisateur de façon persistante",

  async execute(sock, msg, args) {
    try {
      const from = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;

      const owners = global.owners || []; // array of bare numbers
      const sudoList = fs.existsSync("./sudo.json")
        ? JSON.parse(fs.readFileSync("./sudo.json", "utf8"))
        : [];

      const allowed = [...owners, ...(sudoList || [])].map((n) =>
        String(n).replace(/[^0-9]/g, "")
      );

      const senderBare = bare(sender);

      if (!allowed.includes(senderBare)) {
        return await sock.sendMessage(
          from,
          {
            text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
❌ Seul le propriétaire/sudo peut utiliser cette commande.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,
          },
          { quoted: msg }
        );
      }

      // Resolve target: reply > arg
      const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
      let targetJid = null;

      if (ctx?.participant) {
        targetJid = normalizeJid(ctx.participant);
      } else if (args && args.length) {
        const cleaned = args[0].replace(/[^0-9]/g, "");
        if (!cleaned) {
          return await sock.sendMessage(
            from,
            {
              text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
❌ Numéro invalide.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,
            },
            { quoted: msg }
          );
        }

        targetJid = `${cleaned}@s.whatsapp.net`;
      } else {
        return await sock.sendMessage(
          from,
          {
            text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
⚠️ Usage: .ban <num> ou répondre au message de la personne et taper .ban  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,
          },
          { quoted: msg }
        );
      }

      // Add to banned list
      const banned = readBanned();
      if (!banned.includes(targetJid)) {
        banned.push(targetJid);
        writeBanned(banned);
      }

      // Try remove from group immediately if in a group context
      if (from && from.endsWith("@g.us")) {
        try {
          await sock.groupParticipantsUpdate(from, [targetJid], "remove");
        } catch (e) {
          console.error("ban: remove failed:", e?.message || e);
        }
      }

      // Optionally block contact
      try {
        if (typeof sock.updateBlockStatus === "function") {
          await sock.updateBlockStatus(targetJid, "block").catch(() => {});
        }
      } catch (e) {}

      await sock.sendMessage(
        from,
        {
          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
✅ ${targetJid.split("@")[0]} a été banni (persistant). Le bot supprimera la personne si elle est ajoutée.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error("ban command error:", err);
      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `╔═ஜ۩𝐻𝐴𝐷𝐸𝑆 𝑋𝑀𝐷۩ஜ═╗  
❌ Erreur lors de l'exécution de ban.  
╚════ஜ۩۞۩ஜ═════╝  

> 𝙳𝙴𝚅 by 𝚁𝙰𝙸𝚉𝙴𝙻 & 𝙺𝙽𝚄𝚃`,
        },
        { quoted: msg }
      );
    }
  },
};