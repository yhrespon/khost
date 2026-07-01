import fs from "fs";
import path from "path";

const GROUP_CONFIG_PATH = path.join(process.cwd(), "bots/knutxmd/group.json");

let groupConfig = {};

const loadGroupConfig = () => {
  if (fs.existsSync(GROUP_CONFIG_PATH)) {
    try {
      groupConfig = JSON.parse(fs.readFileSync(GROUP_CONFIG_PATH, "utf-8"));
    } catch (err) {
      console.error("Erreur lecture group.json:", err);
      groupConfig = { groups: {} };
    }
  } else {
    groupConfig = { groups: {} };
  }
};

const saveGroupConfig = () => {
  fs.writeFileSync(GROUP_CONFIG_PATH, JSON.stringify(groupConfig, null, 2));
};

// Charger au démarrage
loadGroupConfig();

// === GET / SET PAR GROUPE ===
export const getGroupProtections = (groupJid) => {
  return groupConfig.groups[groupJid] || {};
};

export const setGroupProtection = (groupJid, protection, value) => {
  if (!groupConfig.groups[groupJid]) {
    groupConfig.groups[groupJid] = {};
  }
  groupConfig.groups[groupJid][protection] = value;
  saveGroupConfig();
};

export const toggleGroupProtection = (groupJid, protection) => {
  const current = getGroupProtections(groupJid)[protection] ?? false;
  setGroupProtection(groupJid, protection, !current);
  return !current;
};


export const registerGroupOnOwnerMessage = (groupJid, sock) => {
  if (groupConfig.groups[groupJid]) return; 


  const defaultProtections = {
    antiLink: false,
    antiPromote1: false,
    antiDemote: false,
    antiBot: false,
    antiSpam: false,
    antiSticker: false,
    antiVoice: false,
    antiVideo: false,
    antiMessage: false,
    knuta: false,              
    autoKnutChat: false,       
    autoReact: false,
    statusLike: false,
    warnAdmin: false,
    alertAdmin: false,
    respons: true,
    autoVV2: false,
    welcome: true,
    goodbye: true
  };

  groupConfig.groups[groupJid] = defaultProtections;
  saveGroupConfig();

 
  console.log(`[GROUP MANAGER] Nouveau groupe détecté : ${groupJid.split("@")[0]}`);
};


export default {
  getGroupProtections,
  setGroupProtection,
  toggleGroupProtection,
  registerGroupOnOwnerMessage
};