import fs from "fs";
import path from "path";

const configDir = path.join(__dirname, "../../user_configs");

if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

function getUserConfig(id) {
  const filePath = path.join(configDir, `${id}.json`);
  if (!fs.existsSync(filePath)) {
    const defaultConfig = {
      PREFIXE_COMMANDE: ".",
      BOT_MODE: "private", // "private" ou "public"
      sudo: [],
      STATUS_REACT: "❤️"
    };
    fs.writeFileSync(filePath, JSON.stringify(defaultConfig, null, 2), "utf-8");
    return defaultConfig;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function setUserConfig(id, newConfig) {
  const filePath = path.join(configDir, `${id}.json`);
  const config = getUserConfig(id);
  const updated = { ...config, ...newConfig };
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}

export default { getUserConfig, setUserConfig };