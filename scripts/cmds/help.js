const fs = require("fs-extra");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

function roleTextToString(roleText) {
  switch (roleText) {
    case 0: return "0 (الجميع)";
    case 1: return "1 (آدمن)";
    case 2: return "2 (المطور)";
    default: return "مجهول";
  }
}

module.exports = {
  config: {
    name: "مساعدة",
    version: "1.4.0",
    author: "محمد حسن",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "عرض الأوامر حسب الأقسام"
    },
    longDescription: {
      ar: "عرض الأوامر مقسمة حسب التصنيف مع إمكانية عرض أوامر قسم معين"
    },
    category: "أدوات",
    guide: {
      ar: "{pn} [رقم القسم أو اسم الأمر]"
    },
    priority: 1
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID, messageID, senderID } = event;
    const prefix = getPrefix(threadID);

    // --------- 1. عند كتابة اسم أمر معين ---------
    if (args.length > 0 && isNaN(parseInt(args[0]))) {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));
      
      if (!command) return message.reply(`❌ | الأمر "${commandName}" غير موجود.`);

      const configCommand = command.config;
      const longDescription = configCommand.longDescription?.ar || "لا يوجد وصف.";
      const usage = configCommand.guide?.ar?.replace(/{p}/g, prefix)?.replace(/{n}/g, configCommand.name) || "لا يوجد دليل.";

      const response = [
        `╭── ⭓ الإسم: ${configCommand.name}`,
        `├── ⭓ معلومات:`,
        `│ الوصف: ${longDescription}`,
        `│ أسماء أخرى: ${configCommand.aliases?.join(", ") || "لا يوجد"}`,
        `│ الإصدار: ${configCommand.version || "1.0"}`,
        `│ الصلاحية: ${roleTextToString(configCommand.role)}`,
        `│ وقت الإنتظار: ${configCommand.countDown || 1} ثانية`,
        `│ المؤلف: ${configCommand.author || "غير معروف"}`,
        `├── ⭓ كيفية الاستخدام:`,
        `│ ${usage}`,
        `├── ⭓ ملاحظة:`,
        `│ < > = محتوى مطلوب`,
        `│ [a|b|c] = اختيار من القيم`,
        `╰━━━━━━━━━━━━━❖`
      ].join("\n");

      return message.reply(response);
    }

    // --------- 2. عرض الأقسام ---------
    const allCommands = Array.from(commands.entries()).filter(([_, cmd]) => cmd.config.role <= role);
    const categories = new Map();
    allCommands.forEach(([name, cmd]) => {
      const category = cmd.config.category || "بدون قسم";
      if (!categories.has(category)) categories.set(category, []);
      categories.get(category).push({ name, cmd });
    });

    if (args.length === 0) {
      const categoryList = Array.from(categories.keys());
      let msg = "📂 قائمة الأقسام:\n\n";
      categoryList.forEach((category, index) => {
        msg += `${index + 1}. ${category}\n`;
      });
      msg += `\n🔹 اكتب رقم القسم في رد على هذه الرسالة لعرض أوامره.\nمثال: 1`;

      const sent = await message.reply(msg);

      // الإنصات للرد
      const listener = async ({ body, senderID: replySender, messageID: replyID }) => {
        if (replySender !== senderID) return;
        if (!/^\d+$/.test(body.trim())) return;

        const categoryIndex = parseInt(body) - 1;
        const categoryNames = Array.from(categories.keys());

        if (categoryIndex < 0 || categoryIndex >= categoryNames.length) {
          return message.reply(`❌ | رقم القسم غير صحيح. اختر رقم بين 1 و ${categoryNames.length}`);
        }

        // حذف رسالة الأقسام
        await message.unsend(sent.messageID);

        const selectedCategory = categoryNames[categoryIndex];
        const cmds = categories.get(selectedCategory).sort((a, b) => a.name.localeCompare(b.name));

        let replyMsg = `📂 أوامر قسم ${selectedCategory}:\n\n`;
        cmds.forEach(({ name, cmd }, i) => {
          const desc = cmd.config.shortDescription?.ar || "بدون وصف.";
          replyMsg += `${i + 1}. ${prefix}${name}\n» ${desc}\n\n`;
        });
        replyMsg += `\n💡 عدد الأوامر: ${cmds.length}\n🧠 اكتب "${prefix}مساعدة [اسم الأمر]" لرؤية التفاصيل.`;

        const categoryMsg = await message.reply(replyMsg);

        // حذف رسالة القسم بعد 5 دقائق
        setTimeout(() => {
          message.unsend(categoryMsg.messageID);
        }, 5 * 60 * 1000);
      };

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: "مساعدة",
        messageID: sent.messageID,
        author: senderID,
        type: "reply",
        callback: listener
      });

      return;
    }

    // --------- 3. الرد المباشر برقم القسم دون استخدام reply ---------
    const categoryIndex = parseInt(args[0]) - 1;
    const availableCategories = Array.from(categories.keys());

    if (categoryIndex < 0 || categoryIndex >= availableCategories.length) {
      return message.reply(`❌ | رقم القسم غير صحيح. الرجاء اختيار رقم بين 1 و ${availableCategories.length}`);
    }

    const currentCategory = availableCategories[categoryIndex];
    const categoryCommands = categories.get(currentCategory).sort((a, b) => a.name.localeCompare(b.name));

    let categoryMessage = `📂 أوامر قسم ${currentCategory}:\n\n`;
    categoryCommands.forEach(({ name, cmd }, index) => {
      const desc = cmd.config.shortDescription?.ar || "بدون وصف.";
      categoryMessage += `${index + 1}. ${prefix}${name}\n» ${desc}\n\n`;
    });

    categoryMessage += `\n💡 عدد الأوامر: ${categoryCommands.length}\n`;
    categoryMessage += `🧠 اكتب "${prefix}مساعدة [اسم الأمر]" لرؤية تفاصيل أمر محدد.`;

    const sentCategoryMsg = await message.reply(categoryMessage);
    setTimeout(() => {
      message.unsend(sentCategoryMsg.messageID);
    }, 5 * 60 * 1000);
  }
};    try {
      const { threadID } = event;
      const prefix = getPrefix(threadID);

      // عرض تفاصيل أمر معين
      if (args.length > 0 && isNaN(parseInt(args[0]))) {
        const commandName = args[0].toLowerCase();
        const command = commands.get(commandName) || commands.get(aliases.get(commandName));
        
        if (!command) {
          return message.reply(`❌ | الأمر "${commandName}" غير موجود.`);
        }

        const configCommand = command.config;
        const longDescription = configCommand.longDescription?.ar || "لا يوجد وصف.";
        const usage = configCommand.guide?.ar?.replace(/{p}/g, prefix)?.replace(/{n}/g, configCommand.name) || "لا يوجد دليل.";

        const response = [
          `╭── ⭓ الإسم: ${configCommand.name}`,
          `├── ⭓ معلومات:`,
          `│ الوصف: ${longDescription}`,
          `│ أسماء أخرى: ${configCommand.aliases?.join(", ") || "لا يوجد"}`,
          `│ الإصدار: ${configCommand.version || "1.0"}`,
          `│ الصلاحية: ${roleTextToString(configCommand.role)}`,
          `│ وقت الإنتظار: ${configCommand.countDown || 1} ثانية`,
          `│ المؤلف: ${configCommand.author || "غير معروف"}`,
          `├── ⭓ كيفية الاستخدام:`,
          `│ ${usage}`,
          `├── ⭓ ملاحظة:`,
          `│ < > = محتوى مطلوب`,
          `│ [a|b|c] = اختيار من القيم`,
          `╰━━━━━━━━━━━━━❖`
        ].join("\n");

        return message.reply(response);
      }

      // تجميع الأوامر حسب الأقسام
      const allCommands = Array.from(commands.entries())
        .filter(([_, cmd]) => cmd.config.role <= role);

      const categories = new Map();
      allCommands.forEach(([name, cmd]) => {
        const category = cmd.config.category || "بدون قسم";
        if (!categories.has(category)) {
          categories.set(category, []);
        }
        categories.get(category).push({ name, cmd });
      });

      // عرض قائمة الأقسام
      if (args.length === 0) {
        const categoryList = Array.from(categories.keys());
        let msg = "📂 قائمة الأقسام:\n\n";
        
        categoryList.forEach((category, index) => {
          msg += `${index + 1}. ${category}\n`;
        });

        msg += `\n🔹 اكتب "${prefix}مساعدة [رقم القسم]" لعرض أوامر قسم معين\n`;
        msg += `🔹 مثال: "${prefix}مساعدة 1" لعرض أوامر القسم الأول`;

        return message.reply(msg);
      }

      // عرض أوامر قسم معين
      const categoryIndex = parseInt(args[0]) - 1;
      const availableCategories = Array.from(categories.keys());
      
      if (categoryIndex < 0 || categoryIndex >= availableCategories.length) {
        return message.reply(`❌ | رقم القسم غير صحيح. الرجاء اختيار رقم بين 1 و ${availableCategories.length}`);
      }

      const currentCategory = availableCategories[categoryIndex];
      const categoryCommands = categories.get(currentCategory)
        .sort((a, b) => a.name.localeCompare(b.name));

      let categoryMessage = `📂 أوامر قسم ${currentCategory}:\n\n`;
      categoryCommands.forEach(({ name, cmd }, index) => {
        const desc = cmd.config.shortDescription?.ar || "بدون وصف.";
        categoryMessage += `${index + 1}. ${prefix}${name}\n» ${desc}\n\n`;
      });

      categoryMessage += `\n💡 عدد الأوامر: ${categoryCommands.length}\n`;
      categoryMessage += `🧠 اكتب "${prefix}مساعدة [اسم الأمر]" لرؤية تفاصيل أمر محدد.`;

      return message.reply(categoryMessage);

    } catch (error) {
      console.error(error);
      return message.reply("❌ | حدث خطأ أثناء تنفيذ الأمر. يرجى المحاولة لاحقًا.");
    }
