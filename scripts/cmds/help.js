const fs = require("fs-extra");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "اوامر",
    version: "1.3.1",
    author: "محمد حسن",
    countDown: 5,
    role: 0,
    shortDescription: { ar: "عرض الأوامر حسب الأقسام" },
    longDescription: { ar: "عرض الأوامر مقسمة حسب التصنيف مع إمكانية عرض أوامر قسم معين" },
    category: "النظام",
    guide: { ar: "{pn} [رقم القسم أو اسم الأمر]" },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    // ======== عرض تفاصيل أمر =========
    if (args.length > 0 && isNaN(parseInt(args[0]))) {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));
      if (!command) {
        return message.reply(`❌ | الأمر "${commandName}" غير موجود.`);
      }

      const configCommand = command.config;
      const roleText = roleTextToString(configCommand.role);
      const author = configCommand.author || "غير معروف";
      const longDescription = configCommand.longDescription?.ar || "لا يوجد وصف.";

      let usage = "لا يوجد دليل.";
      if (typeof configCommand.guide?.ar === "string") {
        usage = configCommand.guide.ar
          .replace(/{p}/g, prefix)
          .replace(/{n}/g, configCommand.name);
      }

      const response = `╭── ⭓ الإسم
│ ${configCommand.name}
├── ⭓ معلومات
│ الوصف: ${longDescription}
│ أسماء أخرى: ${configCommand.aliases ? configCommand.aliases.join(", ") : "لا يوجد"}
│ الإصدار: ${configCommand.version || "1.0"}
│ الصلاحية: ${roleText}
│ وقت الإنتظار: ${configCommand.countDown || 1} ثانية
│ المؤلف: ${author}
├── ⭓ كيفية الاستخدام
│ ${usage}
├── ⭓ ملاحظة
│ < > = محتوى مطلوب
│ [a|b|c] = اختيار من القيم
╰━━━━━━━━━━━━━❖`;

      return message.reply(response);
    }

    // ======== تجميع الأوامر حسب الأقسام =========
    const allCommands = Array.from(commands.entries()).filter(([name, cmd]) => {
      return cmd.config.role <= role;
    });

    const categories = new Map();
    allCommands.forEach(([name, cmd]) => {
      const category = cmd.config.category || "بدون قسم";
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category).push({ name, cmd });
    });

    // ======== عرض قائمة الأقسام =========
    if (args.length === 0) {
      const categoryList = Array.from(categories.keys());
      let msg = "📂 قائمة الأقسام:\n\n";
      
      categoryList.forEach((category, index) => {
        msg += `${index + 1}. ${category}\n`;
      });

      msg += `\n🔹 اكتب "${prefix}اوامر [رقم القسم]" لعرض أوامر قسم معين\n`;
      msg += `🔹 مثال: "${prefix}اوامر 1" لعرض أوامر القسم الأول`;

      return message.reply(msg);
    }

    // ======== عرض أوامر قسم معين =========
    const categoryIndex = parseInt(args[0]) - 1;
    const categoryList = Array.from(categories.keys());
    
    if (categoryIndex < 0 || categoryIndex >= categoryList.length) {
      return message.reply(`❌ | رقم القسم غير صحيح. الرجاء اختيار رقم بين 1 و ${categoryList.length}`);
    }

    const selectedCategory = categoryList[categoryIndex];
    const commandsInCategory = categories.get(selectedCategory);

    commandsInCategory.sort((a, b) => a.name.localeCompare(b.name));

    let msg = `📂 أوامر قسم ${selectedCategory}:\n\n`;
    commandsInCategory.forEach(({ name, cmd }, index) => {
      const desc = cmd.config.shortDescription?.ar || "بدون وصف.";
      msg += `${index + 1}. ${prefix}${name}\n» ${desc}\n\n`;
    });

    msg += `\n💡 عدد الأوامر: ${commandsInCategory.length}\n`;
    msg += `🧠 اكتب "${prefix}اوامر [اسم الأمر]" لرؤية تفاصيل أمر محدد.`;

    return message.reply(msg);
  }
};

// تحويل رتبة رقمية إلى نصية
function roleTextToString(roleText) {
  switch (roleText) {
    case 0: return "0 (الجميع)";
    case 1: return "1 (آدمن)";
    case 2: return "2 (المطور)";
    default: return "مجهول";
  }
  }    
    if (categoryIndex < 0 || categoryIndex >= categoryList.length) {
      return message.reply(`❌ | رقم القسم غير صحيح. الرجاء اختيار رقم بين 1 و ${categoryList.length}`);
    }

    const selectedCategory = categoryList[categoryIndex];
    const commandsInCategory = categories.get(selectedCategory);

    commandsInCategory.sort((a, b) => a.name.localeCompare(b.name));

    let msg = `📂 أوامر قسم ${selectedCategory}:\n\n`;
    commandsInCategory.forEach(({ name, cmd }, index) => {
      const desc = cmd.config.shortDescription?.ar || "بدون وصف.";
      msg += `${index + 1}. ${prefix}${name}\n» ${desc}\n\n`;
    });

    msg += `\n💡 عدد الأوامر: ${commandsInCategory.length}\n`;
    msg += `🧠 اكتب "${prefix}اوامر [اسم الأمر]" لرؤية تفاصيل أمر محدد.`;

    return message.reply(msg);
  },
};

// تحويل رتبة رقمية إلى نصية
function roleTextToString(roleText) {
  switch (roleText) {
    case 0: return "0 (الجميع)";
    case 1: return "1 (آدمن)";
    case 2: return "2 (المطور)";
    default: return "مجهول";
  }
    }│ المؤلف : ${author}
├── ⭓ كيفية الاستخدام
│ ${usage}
├── ⭓ ملاحظة
│ < > = محتوى مطلوب
│ [a|b|c] = اختيار من القيم
╰━━━━━━━━━━━━━❖`;

      return message.reply(response);
    }

    // ======== تجميع الأوامر حسب الأقسام =========
    const allCommands = Array.from(commands.entries()).filter(([name, cmd]) => {
      return cmd.config.role <= role;
    });

    const categories = new Map();
    allCommands.forEach(([name, cmd]) => {
      const category = cmd.config.category || "بدون قسم";
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category).push({ name, cmd });
    });

    // ======== عرض قائمة الأقسام =========
    if (args.length === 0) {
      const categoryList = Array.from(categories.keys());
      let msg = "📂 قائمة الأقسام:\n\n";
      
      categoryList.forEach((category, index) => {
        msg += `${index + 1}. ${category}\n`;
      });

      msg += `\n🔹 اكتب "${prefix}اوامر [رقم القسم]" لعرض أوامر قسم معين\n`;
      msg += `🔹 مثال: "${prefix}اوامر 1" لعرض أوامر القسم الأول`;

      return message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(randomImage)
      });
    }

    // ======== عرض أوامر قسم معين =========
    const categoryIndex = parseInt(args[0]) - 1;
    const categoryList = Array.from(categories.keys());
    
    if (categoryIndex < 0 || categoryIndex >= categoryList.length) {
      return message.reply(`❌ | رقم القسم غير صحيح. الرجاء اختيار رقم بين 1 و ${categoryList.length}`);
    }

    const selectedCategory = categoryList[categoryIndex];
    const commandsInCategory = categories.get(selectedCategory);

    commandsInCategory.sort((a, b) => a.name.localeCompare(b.name));

    let msg = `📂 أوامر قسم ${selectedCategory}:\n\n`;
    commandsInCategory.forEach(({ name, cmd }, index) => {
      const desc = cmd.config.shortDescription?.ar || "بدون وصف.";
      msg += `${index + 1}. ${prefix}${name}\n» ${desc}\n\n`;
    });

    msg += `\n💡 عدد الأوامر: ${commandsInCategory.length}\n`;
    msg += `🧠 اكتب "${prefix}اوامر [اسم الأمر]" لرؤية تفاصيل أمر محدد.`;

    return message.reply({
      body: msg,
      attachment: await global.utils.getStreamFromURL(randomImage)
    });
  },
};

// تحويل رتبة رقمية إلى نصية
function roleTextToString(roleText) {
  switch (roleText) {
    case 0: return "0 (الجميع)";
    case 1: return "1 (آدمن)";
    case 2: return "2 (المطور)";
    default: return "مجهول";
  }
}
