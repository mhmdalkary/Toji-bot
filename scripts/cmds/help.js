const fs = require("fs-extra");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "اوامر",
    version: "2.4",
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
    const sendMessageWithImage = async (msgContent) => {
      try {
        const imagePath = path.join(__dirname, "commands.png");
        
        if (fs.existsSync(imagePath)) {
          await message.reply({
            body: msgContent,
            attachment: fs.createReadStream(imagePath)
          });
        } else {
          await message.reply({
            body: msgContent + "\n\n⚠️ صورة الأوامر غير متوفرة حالياً",
            attachment: null
          });
        }
      } catch (error) {
        console.error("حدث خطأ في إرسال الرسالة:", error);
        await message.reply("❌ | حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة لاحقًا.");
      }
    };

    try {
      const { threadID } = event;
      const prefix = getPrefix(threadID);

      // عرض تفاصيل أمر معين
      if (args.length > 0) {
        const commandName = args[0].toLowerCase();
        const command = commands.get(commandName) || commands.get(aliases.get(commandName));
        
        if (!command) {
          return await message.reply(`❌ | الأمر "${commandName}" غير موجود.`);
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

        return await message.reply(response);
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
          description: command.config.shortDescription?.ar || "لا يوجد وصف"
        });
      }

      // بناء رسالة الأوامر
      let msg = "╔══════════════════╗\n";
      msg += "     🐐 قائمة أوامر البوت 🐐\n";
      msg += "╚══════════════════╝\n\n";
      
      for (const [category, commandsList] of Object.entries(categories)) {
        msg += `╭── ⭓ ${category.toUpperCase()} ───\n`;
        
        commandsList.sort((a, b) => a.name.localeCompare(b.name)).forEach((cmd, index) => {
          msg += `│ ${index + 1}. ${prefix}${cmd.name}\n`;
          msg += `│ » ${cmd.description}\n`;
        });
        
        msg += `╰──────────────────────❖\n\n`;
      }

      msg += `📌 عدد الأوامر: ${Object.values(categories).flat().length}\n`;
      msg += `🔍 اكتب "${prefix}اوامر [اسم الأمر]" لعرض تفاصيله\n`;
      msg += `🎀 المطور: محمد حسن`;

      // إرسال الرسالة مع الصورة
      await sendMessageWithImage(msg);

    } catch (error) {
      console.error("حدث خطأ في أمر المساعدة:", error);
      await message.reply("❌ | حدث خطأ أثناء تنفيذ الأمر. يرجى المحاولة لاحقًا.");
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
}    for (const [name, cmd] of commands) {
      if (cmd.config.role > role) continue;
      
      const category = cmd.config.category || "بدون قسم";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(name);
    }

    // بناء رسالة الأوامر
    let msg = "╔═══════════════╗\n";
    msg += "   🐐 قائمة أوامر البوت 🐐\n";
    msg += "╚═══════════════╝\n\n";
    
    for (const [category, commandsList] of Object.entries(categories)) {
      msg += `╭── ⭓ ${category.toUpperCase()}\n`;
      
      // ترتيب الأوامر أبجدياً
      commandsList.sort().forEach((cmd, index) => {
        msg += `│ ${index + 1}. ${prefix}${cmd}\n`;
      });
      
      msg += `╰───────────────────❖\n\n`;
    }

    msg += `📌 عدد الأوامر المتاحة: ${Object.values(categories).flat().length}\n`;
    msg += `🔍 اكتب "${prefix}اوامر [اسم الأمر]" لرؤية تفاصيل أمر معين\n`;
    msg += `🎀 مطور البوت: محمد حسن`;

    // إرسال الرسالة مع صورة
    const helpImages = [
      "https://i.ibb.co/pzY9C1q/images-2024-11-02-T221234-654.jpg",
      "https://i.ibb.co/KKCqKNF/images-2024-11-02-T221220-635.jpg",
      "https://i.ibb.co/9GbwGBS/images-2024-11-02-T221142-231.jpg"
    ];
    
    const randomImage = helpImages[Math.floor(Math.random() * helpImages.length)];
    
    await message.reply({
      body: msg,
      attachment: await global.utils.getStreamFromURL(randomImage)
    });
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
      const category = cmd.config.category || "بدون قسم";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(name);

    // بناء رسالة الأوامر
    let msg = "╔═══════════════╗\n";
    msg += "   🐐 قائمة أوامر البوت 🐐\n";
    msg += "╚═══════════════╝\n\n";
    
    for (const [category, commandsList] of Object.entries(categories)) {
      msg += `╭── ⭓ ${category.toUpperCase()}\n`;
      
      // ترتيب الأوامر أبجدياً
      commandsList.sort().forEach((cmd, index) => {
        msg += `│ ${index + 1}. ${prefix}${cmd}\n`;
      });
      
      msg += `╰───────────────────❖\n\n`;
    }

    msg += `📌 عدد الأوامر المتاحة: ${Object.values(categories).flat().length}\n`;
    msg += `🔍 اكتب "${prefix}اوامر [اسم الأمر]" لرؤية تفاصيل أمر معين\n`;
    msg += ` مطور البوت: محمد حسن`;

    // إرسال الرسالة مع صورة
    const helpImages = [
      "https://i.ibb.co/pzY9C1q/images-2024-11-02-T221234-654.jpg",
      "https://i.ibb.co/KKCqKNF/images-2024-11-02-T221220-635.jpg",
      "https://i.ibb.co/9GbwGBS/images-2024-11-02-T221142-231.jpg"
    ];
    
    const randomImage = helpImages[Math.floor(Math.random() * helpImages.length)];
    
    await message.reply({
      body: msg,
      attachment: await global.utils.getStreamFromURL(randomImage)
    });
  }
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0: return "0 (الجميع)";
    case 1: return "1 (آدمن)";
    case 2: return "2 (المطور)";
    default: return "مجهول";
  }
}      msg += `╔═══════════════╗\n💫 ᴍɪᴅᴏᴜʀɪʏᴀ LIST 💫\n╚═══════════════╝`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach(category => {
        if (category !== "info") {
          msg += `\n\n│『 ${category.toUpperCase()} 』`;

          const names = categories[category].commands.sort();
          for (let i = 0; i < names.length; i += 1) {
            const cmds = names.slice(i, i + 1).map(item => `│⚜️${item}`);
            msg += `\n${cmds.join(" ".repeat(Math.max(0, 5 - cmds.join("").length)))}`;
          }

          msg += `\n`;
        }
      });

      const totalCommands = commands.size;
      msg += `\nحاليا البوت لديه ${totalCommands} أمر يمكن إستخدامه\n`;
      msg += `أكتب ${prefix} أوامر من أجل أن ترى كيفية إستخدام ذالك الأمر\n`;
      msg += `💚 | ᴍɪᴅᴏᴜʀɪʏᴀ`;

      await message.reply({
        body: msg,
        attachment: fs.createReadStream(path.join(__dirname, "commands.png"))
      });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(` ❓ | الأمر "${commandName}" لم يتم إيجاده.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";

        const longDescription = configCommand.longDescription ? configCommand.longDescription.en || "لا وصف" : "No description";

        const guideBody = configCommand.guide?.en || "لا يوجد إرشاد في هذا الأمر.";
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `╭── الإسم ────⭓
│ ${configCommand.name}
├── معلومات
│ الوصف: ${longDescription}
│ أسماء أخرى : ${configCommand.aliases ? configCommand.aliases.join(", ") : "لا أملك "}
│ أسماء اخرى في مجموعتك لا أملك: لا أملك
│ الإصدار : ${configCommand.version || "1.0"}
│ الصلاحية : ${roleText}
│ وقت الإنتظار : ${configCommand.countDown || 1} ثانية
│ المؤلف : ${author}
├── كيفية الاستخدام 
│ ${usage}
├── ملاحظة 
│ المحتوى داخل المعقوفتين <XXXXX> يمكن تغييرها 
│ المحتوى داخل [a|b|c] هو a أو b أو c
╰━━━━━━━❖`;

        await message.reply(response);
      }
    }
  },
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "0 (الجميع)";
    case 1:
      return "1 (فقط الآدمن)";
    case 2:
      return "2 (المطور)";
    default:
      return "مجهول";
  }
}      const category = command.config.category || "بدون قسم";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({
        name: name,
        description: command.config.shortDescription?.ar || "لا يوجد وصف"
      });
    

    // بناء رسالة الأوامر
    let msg = "╔══════════════════╗\n";
    msg += "     🐐 قائمة أوامر البوت 🐐\n";
    msg += "╚══════════════════╝\n\n";
    
    for (const [category, commandsList] of Object.entries(categories)) {
      msg += `╭── ⭓ ${category.toUpperCase()} ───\n`;
      
      // ترتيب الأوامر أبجدياً
      commandsList.sort((a, b) => a.name.localeCompare(b.name)).forEach((cmd, index) => {
        msg += `│ ${index + 1}. ${prefix}${cmd.name}\n`;
        msg += `│ » ${cmd.description}\n`;
      });
      
      msg += `╰──────────────────────❖\n\n`;
    }

    msg += `📌 عدد الأوامر: ${Object.values(categories).flat().length}\n`;
    msg += `🔍 اكتب "${prefix}اوامر [اسم الأمر]" لعرض تفاصيله\n`;
    msg += `🎀 المطور: محمد حسن`;

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

    // تجميع الأوامر حسب الأقسام
    const categories = {};
    
    for (const [name, cmd] of commands) {
      if (cmd.config.role > role) continue;
      
      const category = cmd.config.category || "بدون قسم";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(name);
    }

    // بناء رسالة الأوامر
    let msg = "╔═══════════════╗\n";
    msg += "   🐐 قائمة أوامر البوت 🐐\n";
    msg += "╚═══════════════╝\n\n";
    
    for (const [category, commandsList] of Object.entries(categories)) {
      msg += `╭── ⭓ ${category.toUpperCase()}\n`;
      
      // ترتيب الأوامر أبجدياً
      commandsList.sort().forEach((cmd, index) => {
        msg += `│ ${index + 1}. ${prefix}${cmd}\n`;
      });
      
      msg += `╰───────────────────❖\n\n`;
    }

    msg += `📌 عدد الأوامر المتاحة: ${Object.values(categories).flat().length}\n`;
    msg += `🔍 اكتب "${prefix}اوامر [اسم الأمر]" لرؤية تفاصيل أمر معين\n`;
    msg += `🎀 مطور البوت: محمد حسن`;

    // إرسال الرسالة مع الفيديو
    const videoPath = path.join(__dirname, "commands.mp4.mp4");
    
    if (fs.existsSync(videoPath)) {
      await message.reply({
        body: msg,
        attachment: fs.createReadStream(videoPath)
      });
    } else {
      await message.reply({
        body: msg + "\n\n⚠️ لم يتم العثور على الفيديو المرفق",
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
      const category = cmd.config.category || "بدون قسم";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(name);
    

    // بناء رسالة الأوامر
    let msg = "╔═══════════════╗\n";
    msg += "   🐐 قائمة أوامر البوت 🐐\n";
    msg += "╚═══════════════╝\n\n";
    
    for (const [category, commandsList] of Object.entries(categories)) {
      msg += `╭── ⭓ ${category.toUpperCase()}\n`;
      
      // ترتيب الأوامر أبجدياً
      commandsList.sort().forEach((cmd, index) => {
        msg += `│ ${index + 1}. ${prefix}${cmd}\n`;
      });
      
      msg += `╰───────────────────❖\n\n`;
    }

    msg += `📌 عدد الأوامر المتاحة: ${Object.values(categories).flat().length}\n`;
    msg += `🔍 اكتب "${prefix}اوامر [اسم الأمر]" لرؤية تفاصيل أمر معين\n`;
    msg += `🎀 مطور البوت: محمد حسن`;

    
    
    
  


function roleTextToString(roleText) {
  switch (roleText) {
    case 0: return "0 (الجميع)";
    case 1: return "1 (آدمن)";
    case 2: return "2 (المطور)";
    default: return "مجهول";
  }
}
