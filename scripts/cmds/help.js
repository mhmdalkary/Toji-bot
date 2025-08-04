const { commands } = global.GoatBot;
const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: "اوامر",
    version: "1.1",
    hasPermission: 0,
    credits: "محمد ✨",
    description: "عرض أقسام الأوامر أو أوامر قسم معين.",
    commandCategory: "نظام",
    usages: "[رقم القسم]",
    cooldowns: 5
  },

  onStart: async function ({ args, message, event }) {
    const prefix = getPrefix(event.threadID);

    // نجمع الأوامر حسب الأقسام
    const commandsByCategory = {};
    for (const cmd of commands.values()) {
      const cat = cmd.config.commandCategory || "غير مصنف";
      if (!commandsByCategory[cat]) commandsByCategory[cat] = [];
      commandsByCategory[cat].push(cmd.config.name);
    }

    const categories = Object.keys(commandsByCategory);

    // عرض قائمة الأقسام
    if (!args[0]) {
      let text = "🗂️ | قائمة الأقسام:\n\n";
      categories.forEach((cat, index) => {
        text += `${index + 1}. ${cat} (${commandsByCategory[cat].length} أمر)\n`;
      });
      text += `\nاكتب: ${prefix}اوامر رقم_القسم\nمثال: ${prefix}اوامر 1`;
      return message.reply(text);
    }

    // التحقق من الرقم المُدخل
    const sectionNumber = parseInt(args[0]);
    if (isNaN(sectionNumber) || sectionNumber < 1 || sectionNumber > categories.length) {
      return message.reply("⚠️ | رقم القسم غير صالح، تأكد من إدخاله بشكل صحيح.");
    }

    // عرض أوامر القسم
    const selectedCategory = categories[sectionNumber - 1];
    const commandsInSection = commandsByCategory[selectedCategory];

    const text = `📚 | الأوامر في قسم: ${selectedCategory} \n\n🔹 ${commandsInSection.join('\n🔹 ')}`;
    return message.reply(text);
  }
};