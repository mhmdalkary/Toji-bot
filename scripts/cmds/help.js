const { commands } = global.GoatBot;
const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: "اوامر",
    version: "1.2",
    hasPermission: 0,
    credits: "محمد ✨",
    description: "عرض أقسام الأوامر أو أوامر قسم معين.",
    commandCategory: "النظام",
    usages: "[رقم القسم]",
    cooldowns: 5
  },

  onStart: async function ({ args, message, event }) {
    const prefix = getPrefix(event.threadID);

    // جمع الأوامر حسب القسم
    const commandsByCategory = {};
    for (const cmd of commands.values()) {
      const category = cmd.config.commandCategory || "غير مصنف";
      if (!commandsByCategory[category]) {
        commandsByCategory[category] = [];
      }
      commandsByCategory[category].push(cmd.config.name);
    }

    const categories = Object.keys(commandsByCategory);

    // 👈 عرض الأقسام
    if (!args[0]) {
      let text = `🌟 *دليل الأوامر المفصّل*\n\n🗂️ | الأقسام المتوفرة:\n\n`;
      categories.forEach((cat, i) => {
        text += `${i + 1}. ${cat} (${commandsByCategory[cat].length} أمر)\n`;
      });
      text += `\n📌 لعرض أوامر قسم معين، أرسل:\n» ${prefix}اوامر [رقم القسم]\nمثال: ${prefix}اوامر 1`;
      return message.reply(text);
    }

    // 👈 التحقق من الرقم
    const sectionNumber = parseInt(args[0]);
    if (isNaN(sectionNumber) || sectionNumber < 1 || sectionNumber > categories.length) {
      return message.reply("⚠️ | رقم القسم غير صحيح، تأكد من إدخال رقم من القائمة.");
    }

    // 👈 عرض أوامر القسم المختار
    const selectedCategory = categories[sectionNumber - 1];
    const commandsInSection = commandsByCategory[selectedCategory];

    let replyText = `📂 | الأوامر في قسم: *${selectedCategory}*\n\n`;
    replyText += commandsInSection.map(cmd => `🔹 ${prefix}${cmd}`).join('\n');

    replyText += `\n\n✍️ لعرض الأقسام مرة أخرى:\n» ${prefix}اوامر`;

    return message.reply(replyText);
  }
};