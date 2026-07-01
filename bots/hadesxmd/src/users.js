import fs from "fs";
import path from "path";

// Chemin vers le fichier users.json
const usersFile = path.join(process.cwd(), "bots/hadesxmd/src/users.json");

// === Helpers pour lire/écrire users.json ===
function loadUsers() {
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify({ whatsapp: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(usersFile, "utf-8"));
}

function saveUsers(data) {
  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
}

// === Gestion des utilisateurs ===
function getUsers(platform = "whatsapp") {
  const data = loadUsers();
  if (!data[platform]) data[platform] = {};
  return data[platform];
}

function getUser(id, platform = "whatsapp") {
  const users = getUsers(platform);
  return users[id] || null;
}

function ensureUser(id, platform = "whatsapp") {
  const data = loadUsers();
  if (!data[platform]) data[platform] = {};
  if (!data[platform][id]) {
    data[platform][id] = { premium: false, warns: 0 };
    saveUsers(data);
  }
  return data[platform][id];
}

function addUser(id, info = {}, platform = "whatsapp") {
  const data = loadUsers();
  if (!data[platform]) data[platform] = {};
  if (!data[platform][id]) {
    data[platform][id] = { premium: false, warns: 0, ...info };
    saveUsers(data);
  }
}

function updateUser(id, info = {}, platform = "whatsapp") {
  const data = loadUsers();
  if (!data[platform]) data[platform] = {};
  if (!data[platform][id]) data[platform][id] = {};
  data[platform][id] = { ...data[platform][id], ...info };
  saveUsers(data);
}

function removeUser(id, platform = "whatsapp") {
  const data = loadUsers();
  if (!data[platform]) data[platform] = {};
  if (data[platform][id]) {
    delete data[platform][id];
    saveUsers(data);
  }
}

function isPremium(id, platform = "whatsapp") {
  const user = getUser(id, platform);
  return user?.premium === true;
}

// === Nouvelle fonction setPremium automatique ===
function setPremium(jid) {
  // Détecte automatiquement la plateforme
  const platform = "whatsapp";
  // Initialise l'utilisateur s'il n'existe pas
  const user = ensureUser(jid, platform);
  // Active le premium
  if (!user.premium) {
    updateUser(jid, { premium: true }, platform);
  }
  return { jid, platform, user: getUser(jid, platform) };
}

export default {
  getUsers,
  getUser,
  ensureUser,
  addUser,
  updateUser,
  removeUser,
  isPremium,
  setPremium
};