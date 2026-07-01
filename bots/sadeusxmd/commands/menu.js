import fs from "fs";
import path from "path";

export default {
  name: "menu",
  description: "𝙼𝚎𝚗𝚞 𝚍𝚎𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚎𝚜",

  async execute(sock, message) {
    const { from } = message;

    const categories = {
      "𝚜𝚊𝚍𝚎𝚞𝚜-𝚌𝚘𝚖": ["purge","tagall","tag","kick","kickall","mute","unmute","left","promote","promoteall","demote","demoteall","add","desc","ginfo","link","invite","online","block"],
      "𝚌𝚘𝚗𝚏𝚒𝚐":      ["setrespons","antidelete"],
      "𝚖𝚎𝚍𝚒𝚊":       ["sticker","tgstick","take","vv","vv2","photo","url","save","down-url"],
      "𝚒𝚗𝚏𝚘":        ["ping","info","weather","news","device","play","image","audiotts","tiktok"],
      "𝚋𝚞𝚐𝚖𝚎𝚗𝚞":     ["sadeusgc","ios-sad","android-sad"],
    };

    let menuText = `╭━━━━━━━━━━━━━━━╮\n   🐍 SADEUS XMD V1🐍\n╰━━━━━━━━━━━━━━━╯\n`;

    for (const [cat, cmds] of Object.entries(categories)) {
      menuText += `╭━━━━━━━━━━━━━━━╮\n┃ ⛩️ 『 ${cat} 』\n`;
      cmds.forEach((cmd, i) => {
        const isLast = i === cmds.length - 1;
        menuText += `┃ ${isLast ? "┗" : "┣"} ➢ ${cmd}\n`;
      });
      menuText += `┣━━━━━━━━━━━━━━━┫\n`;
    }

    menuText += `┃   🐍 ᴘᴏᴡᴇʀ ʙʏ sᴀᴅᴇᴜs\n╰━━━━━━━━━━━━━━━╯`;

    const imagePath = "./bots/sadeusxmd/sadeus.jpg";

    if (fs.existsSync(imagePath)) {
      await sock.sendMessage(from, {
        image: { url: imagePath },
        caption: menuText
      });
    } else {
      await sock.sendMessage(from, { text: menuText });
    }
  }
};
