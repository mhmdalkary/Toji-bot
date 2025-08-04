const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "اوامر",
    version: "1.3.0",
    author: "محمد حسن",
    countDown: 5,
    role: 0,
    shortDescription: { ar: "عرض الأوامر مقسمة لأقسام" },
    longDescription: { ar: "عرض قائمة أقسام الأوامر ويمكن عرض أوامر كل قسم برقم القسم" },
    category: "النظام",
    guide: { ar: "{pn} [رقم القسم أو اسم الأمر]" },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    // صور خلفيات من أنمي جوجتسو كايسن (جودة متوسطة)
    const helpListImages = [
      "https://i.ibb.co/02hSZc9/jujutsu-kaisen-1.jpg",
      "https://i.ibb.co/FYqkm4Z/jujutsu-kaisen-2.jpg",
      "https://i.ibb.co/8PgMM7z/jujutsu-kaisen-3.jpg",
      "https://i.ibb.co/dP9gJcy/jujutsu-kaisen-4.jpg",
      "https://i.ibb.co/hR0J3vD/jujutsu-kaisen-5.jpg",
    ];
    const helpListImage = helpListImages[Math.floor(Math.random() * helpListImages.length)];

    // 1. عرض تفاصيل أمر عند كتابة اسمه
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
        usage = configCommand.guide.ar.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);
      }

      const response = 
`╭── ⭓ الإسم
│ ${configCommand.name}
├── ⭓ معلومات
│ الوصف: ${longDescription}
│ أسماء أخرى : ${configCommand.aliases ? configCommand.aliases.join(", ") : "لا يوجد"}
│ الإصدار : ${configCommand.version || "1.0"}
│ الصلاحية : ${roleText}
│ وقت الإنتظار : ${configCommand.countDown || 1} ثانية
│ المؤلف : ${author}
├── ⭓ كيفية الاستخدام
│ ${usage}
├── ⭓ ملاحظة
│ < > = محتوى مطلوب
│ [a|b|c] = اختيار من القيم
╰━━━━━━━━━━━━━❖`;

      return message.reply(response);
    }

    // 2. تجميع الأوامر حسب القسم مع فلترة حسب صلاحية المستخدم
    const allCommands = Array.from(commands.entries()).filter(([name, cmd]) => cmd.config.role <= role);

    // بناء خريطة الأقسام مع أوامر كل قسم
    const sectionsMap = new Map();
    allCommands.forEach(([name, cmd]) => {
      const category = cmd.config.category || "غير محدد";
      if (!sectionsMap.has(category)) sectionsMap.set(category, []);
      sectionsMap.get(category).push([name, cmd]);
    });

    // 3. عرض قائمة الأقسام مرتبة أبجدياً مع أرقام
    const sortedSections = Array.from(sectionsMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    // إذا لم يتم تمرير رقم القسم، عرض قائمة الأقسام فقط
    if (args.length === 0 || isNaN(parseInt(args[0]))) {
      let msg = `📚 أقسام الأوامر:\n\n`;
      sortedSections.forEach(([sectionName, cmds], index) => {
        msg += `${index + 1}. ${sectionName} (${cmds.length} أمر)\n\n`;
      });
      msg += `✍️ لعرض أوامر قسم معيّن، أكتب: ${prefix}اوامر [رقم القسم]\n`;
      msg += `✍️ أو عرض تفاصيل أمر: ${prefix}اوامر [اسم الأمر]\n`;

      return message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(helpListImage),
      });
    }

    // 4. عرض أوامر القسم المختار حسب الرقم المدخل
    const sectionNumber = parseInt(args[0]);
    if (sectionNumber < 1 || sectionNumber > sortedSections.length) {
      return message.reply(`❌ | رقم القسم ${sectionNumber} غير موجود. اختر رقم من 1 إلى ${sortedSections.length}.`);
    }

    const [sectionName, sectionCommands] = sortedSections[sectionNumber - 1];

    let msg = `📂 أوامر قسم: ${sectionName} (${sectionCommands.length} أمر)\n\n`;
    sectionCommands.forEach(([name, cmd], idx) => {
      const desc = cmd.config.shortDescription?.ar || "بدون وصف.";
      msg += `${idx + 1}. ${prefix}${name}\n» ${desc}\n\n`;
    });

    msg += `✍️ لعرض تفاصيل أي أمر: ${prefix}اوامر [اسم الأمر]\n`;
    msg += `✍️ لعرض قائمة الأقسام: ${prefix}اوامر\n`;

    return message.reply({
      body: msg,
      attachment: await global.utils.getStreamFromURL(helpListImage),
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