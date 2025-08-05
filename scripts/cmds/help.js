const fs = require("fs-extra");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "اوامر",
    version: "1.17",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    shortDescription: { en: "عرض استخدام الأوامر وسرد كافة الأوامر مباشرة" },
    longDescription: { en: "عرض استخدام الأوامر وسرد كافة الأوامر مباشرة" },
    category: "النظام",
    guide: { en: "{pn} أو {pn} اسم_الأمر" },
    priority: 1
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = "╔═══════════════╗\n💫 TOJI LIST 💫\n╚═══════════════╝";

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "غير مصنف";
        if (!categories[category]) categories[category] = [];
        categories[category].push(name);
      }

      for (const category of Object.keys(categories).sort()) {
        msg += `\n\n❖『 ${category.toUpperCase()} 』\n`;
        const cmdList = categories[category].sort().map(cmd => `⚜️ ${cmd}`).join("\n");
        msg += cmdList;
      }

      msg += `\n\n📌 يحتوي البوت على ${commands.size} أمر حاليًا.`;
      msg += `\n✍️ اكتب ${prefix}اوامر [اسم الأمر] لمزيد من التفاصيل.`;
      msg += `\n💚 | TOJI`;

      const imagePath = path.join(__dirname, "commands.png");

      if (fs.existsSync(imagePath)) {
        await message.reply({
          body: msg,
          attachment: fs.createReadStream(imagePath)
        });
      } else {
        await message.reply(msg + "\n⚠️ لم يتم العثور على ملف الصورة: commands.png");
      }

    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        return message.reply(`❓ | الأمر "${commandName}" غير موجود.`);
      }

      const config = command.config;
      const roleText = roleTextToString(config.role);
      const author = config.author || "غير معروف";
      const longDescription = config.longDescription?.en || "لا يوجد وصف.";
      const guide = (config.guide?.en || "لا يوجد شرح.").replace(/{p}/g, prefix).replace(/{n}/g, config.name);

      const response = `╭── الإسم ────⭓
│ ${config.name}
├── معلومات
│  الوصف: ${longDescription}
│  أسماء أخرى: ${config.aliases?.join(", ") || "لا يوجد"}
│  الإصدار: ${config.version || "1.0"}
│  الصلاحية: ${roleText}
│  الإنتظار: ${config.countDown || 1} ثانية
│  المؤلف: ${author}
├── كيفية الاستخدام
│ ${guide}
├── ملاحظة
│ <x>: مدخل يجب تغييره
│ [a|b|c]: اختر أحد الخيارات
╰━━━━━━━━━━━━━❖`;

      await message.reply(response);
    }
  }
};

function roleTextToString(role) {
  switch (role) {
    case 0: return "0 (للكل)";
    case 1: return "1 (الآدمن)";
    case 2: return "2 (المطور)";
    default: return "غير معروف";
  }
        }
