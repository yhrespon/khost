import fs from "fs";

const FILE = "./groupSettings.json";
const IMAGE_URL = "https://files.catbox.moe/b3yv0e.jpg";

const MESSAGE = `🌹𝑃𝑒𝑟𝑠𝑜𝑛𝑛𝑒 𝑛𝑒 𝑠𝑎𝑖𝑡 𝑞𝑢𝑎𝑛𝑑 𝑙𝑎 𝑚𝑜𝑟𝑡 𝑣𝑖𝑒𝑛𝑑𝑟𝑎 𝑛𝑜𝑢𝑠 𝑐𝑢𝑒𝑖𝑙𝑙𝑖𝑟  
𝑀𝑎𝑖𝑠 𝑞𝑢'𝑖𝑙 𝑛𝑜𝑢𝑠 𝑟𝑒𝑠𝑡𝑒 𝑢𝑛𝑒 𝑠𝑒𝑢𝑙𝑒 𝑗𝑜𝑢𝑟𝑛é𝑒 𝑜𝑢 𝑢𝑛𝑒 𝑏𝑜𝑛𝑛𝑒 𝑠𝑜𝑖𝑥𝑎𝑛𝑡𝑎𝑖𝑛𝑒 𝑑'𝑎𝑛𝑛é𝑒𝑠  
𝑜𝑛 𝑎𝑢𝑟𝑎 𝑡𝑜𝑢𝑗𝑜𝑢𝑟𝑠 𝑙𝑒 𝑠𝑒𝑛𝑡𝑖𝑚𝑒𝑛𝑡 𝑑𝑒 𝑛𝑒 𝑝𝑎𝑠 𝑎𝑣𝑜𝑖𝑟 𝑒𝑢 𝑎𝑠𝑠𝑒𝑧 𝑑𝑒 𝑡𝑒𝑚𝑝𝑠  
𝑝𝑜𝑢𝑟 𝑓𝑎𝑖𝑟𝑒 𝑐𝑒 𝑞𝑢'𝑜𝑛 𝑎𝑖𝑚𝑒 🌹

𝐃𝐄𝐕 𝐇𝐀𝐂𝐊𝐄𝐑`;

function load() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export const name = "antipurge";

export async function execute(sock, msg, args) {
  const from = msg.key.remoteJid;
  if (!from.endsWith("@g.us")) return;

  const option = args[0];
  if (!["on", "off"].includes(option)) return;

  const settings = load();
  if (!settings[from]) settings[from] = {};

  settings[from].antipurge = option === "on";
  save(settings);

  await sock.sendMessage(from, {
    image: { url: IMAGE_URL },
    caption: MESSAGE
  }, { quoted: msg });
}
