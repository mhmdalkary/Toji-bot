const fs = require("fs-extra");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "اوامر",
    version: "2.0",
    author: "محمد حسن",
    countDown: 5,
    role: 0,
    shortDescription: {
      ar: "عرض جميع الأوامر حسب الأقسام"
    },
    longDescription: {
      ar: "عرض جميع الأوامر مصنفة حسب الأقسام في رسالة واحدة"
    },
    category: "النظام",
    guide: {
      ar: "{pn} [اسم الأمر]"
    },
    priority: 1
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    // عرض تفاصيل أمر معين  
    if (args.length > 0) {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        return message.reply(`❌ | الأمر "${commandName}" غير موجود.`);
      }

      const configCommand = command.config;
      const longDescription = configCommand.longDescription?.ar || "لا يوجد وصف.";
      const usage = configCommand.guide?.ar?.replace(/{p}/g, prefix)?.replace(/{n}/g, configCommand.name) || "لا يوجد دليل.";

      const response = `╭── ⭓ الإسم: ${configCommand.name}

├── ⭓ معلومات:
│ الوصف: ${longDescription}
│ أسماء أخرى: ${configCommand.aliases ? configCommand.aliases.join(", ") : "لا يوجد"}
│ الإصدار: ${configCommand.version || "1.0"}
│ الصلاحية: ${roleTextToString(configCommand.role)}
│ وقت الإنتظار: ${configCommand.countDown || 1} ثانية
│ المؤلف: ${configCommand.author || "غير معروف"}
├── ⭓ كيفية الاستخدام:
│ ${usage}
├── ⭓ ملاحظة:
│ < > = محتوى مطلوب
│ [a|b|c] = اختيار من القيم
╰━━━━━━━━━━━━━❖`;

      return message.reply(response);
    }

    // تجميع الأوامر حسب الأقسام  
    const categories = {};

    for (const [name, command] of commands) {
      if (command.config.role > role) continue;

      const category = command.config.category || "بدون قسم";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({
        name: name,
      });
    }

    // بناء رسالة الأوامر بالشكل الجديد مع 3 أوامر في كل سطر
    let msg = " ───< قائمة توجي >─── \n\n";

    for (const [category, commandsList] of Object.entries(categories)) {
      msg += `「 ${category.toUpperCase()} :」\n`;

      // ترتيب الأوامر أبجدياً
      const sortedCmds = commandsList.sort((a, b) => a.name.localeCompare(b.name));

      // تقسيم الأوامر إلى صفوف كل صف 3 أوامر
      for (let i = 0; i < sortedCmds.length; i += 2) {
        const slice = sortedCmds.slice(i, i + 2).map(cmd => cmd.name);
        msg += `＊ ${slice.join(" * ")}\n`;
      }

      msg += "———————————————\n\n";
    }

    msg += `「 ─────────────── 」\n`;
    msg += `│TB: عدد الاوامر المتاحة: ${Object.values(categories).flat().length}\n`;
    msg += `│TB: لحذف رسالة قم بالرد بـ ح\n`;

    // إرسال الرسالة مع الصورة الثابتة  
    const imagePath = path.join(__dirname, "commands.png");

    if (fs.existsSync(imagePath)) {
      await message.reply({
        body: msg,
        attachment: fs.createReadStream(imagePath)
      });
    } else {
      await message.reply({
        body: msg + "\n\n⚠️ صورة الأوامر غير متوفرة حالياً",
        attachment: null
      });
    }
  }
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0: return "0 (الجميع)";
    case 1: return "1 (آدمن)";
    case 2: return "2 (المطور)";
    default: return "مجهول";
  }
}
