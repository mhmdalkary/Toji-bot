const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "اوامر",
    version: "1.2.0",
    author: "محمد حسن",
    countDown: 5,
    role: 0,
    shortDescription: { ar: "عرض الأوامر مع صفحات" },
    longDescription: { ar: "عرض كل الأوامر مع وصف كل أمر وتقسيمها لصفحات" },
    category: "النظام",
    guide: { ar: "{pn} [اسم الأمر أو رقم الصفحة]" },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    const helpListImages = [
      "https://i.ibb.co/pzY9C1q/images-2024-11-02-T221234-654.jpg",
      "https://i.ibb.co/KKCqKNF/images-2024-11-02-T221220-635.jpg",
      "https://i.ibb.co/9GbwGBS/images-2024-11-02-T221142-231.jpg",
      "https://i.ibb.co/28kprSm/images-2024-11-02-T221108-131.jpg",
      "https://i.ibb.co/myMn8DB/images-2024-11-02-T221059-359.jpg",
      "https://i.ibb.co/FWYZhsb/images-2024-11-02-T221048-923.jpg"
    ];
    const helpListImage = helpListImages[Math.floor(Math.random() * helpListImages.length)];

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

    // ======== عرض صفحة أوامر =========
    const page = parseInt(args[0]) || 1;
    const cmdsPerPage = 50;

    const allCommands = Array.from(commands.entries()).filter(([name, cmd]) => {
      return cmd.config.role <= role;
    });

    allCommands.sort((a, b) => a[0].localeCompare(b[0]));
    const totalPages = Math.ceil(allCommands.length / cmdsPerPage);

    if (page < 1 || page > totalPages) {
      return message.reply(`❌ | الصفحة ${page} غير موجودة. يوجد فقط ${totalPages} صفحة.`);
    }

    const startIndex = (page - 1) * cmdsPerPage;
    const currentCommands = allCommands.slice(startIndex, startIndex + cmdsPerPage);

    let msg = `📜 قائمة الأوامر - صفحة (${page}/${totalPages}):\n`;
    msg += `🔹 أكتب ${prefix}اوامر [رقم الصفحة] للتنقل بين الصفحات.\n\n`;

    currentCommands.forEach(([name, cmd], index) => {
      const desc = cmd.config.shortDescription?.ar || "بدون وصف.";
      msg += `${startIndex + index + 1}. ${prefix}${name}\n» ${desc}\n\n`;
    });

    msg += `💡 مجموع الأوامر: ${allCommands.length}\n`;
    msg += `🧠 أكتب ${prefix}اوامر [اسم الأمر] لرؤية تفاصيل أمر محدد.`;

    return message.reply({
      body: msg,
      attachment: await global.utils.getStreamFromURL(helpListImage)
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