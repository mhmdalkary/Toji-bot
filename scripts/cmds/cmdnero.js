const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "2اوامر",
    aliases: ["أوامر", "مساعدة", "اوامر"],
    version: "1.4",
    author: "sifo",
    role: 0,
    shortDescription: {
      ar: "عرض جميع أوامر البوت",
      en: "Display all bot commands"
    },
    category: "إدارة",
    guide: {
      ar: "{pn}",
      en: "{pn}"
    }
  },

  langs: {
    ar: {
      allCommands: `
╭─────⭑ قائمة الأوامر ⭑─────╮
  .⚡Nero bot by sifo
  .نيرو: ai 
  .


⌯︙المطور: SIFO ANTER
╰────────────────────╯
`
    }
  },

  onStart: async function ({ message, getLang }) {
    const imagePath = path.join(__dirname, "commands.jpg"); // ضع صورتك هنا
    const imageStream = fs.createReadStream(imagePath);

    message.reply({
      body: getLang("allCommands"),
      attachment: imageStream
    });
  }
};