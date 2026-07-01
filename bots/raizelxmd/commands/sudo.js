import fs from "fs";

const SUDO_FILE = "./sudo.json";

// =======================
// Helpers
function loadSudo() {
  if (!fs.existsSync(SUDO_FILE)) return [];
  return JSON.parse(fs.readFileSync(SUDO_FILE, "utf-8"));
}

function saveSudo(list) {
  fs.writeFileSync(SUDO_FILE, JSON.stringify(list, null, 2));
}

function getBareNumber(jid) {
  if (!jid) return "";
  return String(jid).split("@")[0].replace(/[^0-9]/g, "");
}

// =======================
// Vérifie si un utilisateur est owner / sudo / lid
export async function checkOwner(sock, senderJid) {
  const sudoList = loadSudo().map(getBareNumber);
  const ownerNum = global.owner || "";
  const bareSender = getBareNumber(senderJid);
  const botJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";

  let lidList = [];
  try {
    const data = fs.existsSync(`sessions/${botJid}/creds.json`)
      ? JSON.parse(fs.readFileSync(`sessions/${botJid}/creds.json`, "utf8"))
      : {};
    const lid = data?.me?.lid || sock.user?.lid || "";
    if (lid) lidList.push(lid.split(":")[0] + "@lid");
  } catch {}

  return (
    bareSender === ownerNum ||           // Owner global
    sudoList.includes(bareSender) ||     // sudo.json
    lidList.includes(senderJid)          // LID check
  );
}

// =======================
// Commandes SUDO
export const sudoCommand = {
  name: "sudo",
  description: "Ajouter un sudo",
  execute: async (sock, ctx, args) => {
    const reply = ctx.reply || (() => {});
    const from = ctx.from || "";
    const sender = ctx.sender || from;

    try {
      if (!await checkOwner(sock, sender)) return await reply("❌ Seul l'owner peut ajouter un sudo.");

      const target = args?.[0] ? getBareNumber(args[0]) : getBareNumber(sender);
      if (!target) return await reply("⚠️ Fournis un numéro à ajouter.");

      const list = loadSudo().map(getBareNumber);
      if (list.includes(target)) return await reply(`⚠️ ${target} est déjà dans la liste sudo.`);

      list.push(target);
      saveSudo(list);
      await reply(`✅ ${target} ajouté à la liste sudo.`);
    } catch (err) {
      console.error("Erreur sudo :", err);
      await reply("⚠️ Une erreur est survenue lors de l'ajout du sudo.");
    }
  }
};

export const delSudoCommand = {
  name: "delsudo",
  description: "Supprimer un sudo",
  execute: async (sock, ctx, args) => {
    const reply = ctx.reply || (() => {});
    const sender = ctx.sender || ctx.from;

    try {
      if (!await checkOwner(sock, sender)) return await reply("❌ Seul l'owner peut retirer un sudo.");

      const target = args?.[0] ? getBareNumber(args[0]) : null;
      if (!target) return await reply("⚠️ Fournis le numéro à retirer.");

      let list = loadSudo().map(getBareNumber);
      list = list.filter(n => n !== target);
      saveSudo(list);

      await reply(`🚫 ${target} retiré de la liste sudo.`);
    } catch (err) {
      console.error("Erreur delsudo :", err);
      await reply("⚠️ Une erreur est survenue lors de la suppression du sudo.");
    }
  }
};

export const listSudoCommand = {
  name: "listsudo",
  description: "Afficher la liste des sudo",
  execute: async (sock, ctx) => {
    const reply = ctx.reply || (() => {});
    const sender = ctx.sender || ctx.from;

    try {
      if (!await checkOwner(sock, sender)) return await reply("❌ Seul l'owner peut voir la liste des sudo.");

      const list = loadSudo().map(getBareNumber);
      if (!list.length) return await reply("📭 Aucun sudo défini.");

      const text = list.map((n, i) => `${i + 1}. ${n}`).join("\n");
      await reply(`👑 Liste des sudo:\n\n${text}`);
    } catch (err) {
      console.error("Erreur listsudo :", err);
      await reply("⚠️ Impossible d'afficher la liste des sudo.");
    }
  }
};