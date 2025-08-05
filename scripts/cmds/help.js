const fs = require("fs-extra");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

// دالة مساعدة لتحويل الرتبة إلى نص
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

  onStart: async function ({ message, args, event, threadsData, role, api }) {
    try {
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

      const availableCategories = Array.from(categories.keys());

      // عرض قائمة الأقسام فقط
      if (args.length === 0) {
        let msg = "📂 قائمة الأقسام:\n\n";
        availableCategories.forEach((category, index) => {
          msg += `${index + 1}. ${category}\n`;
        });

        msg += `\n🔹 قم بالرد على هذه الرسالة برقم القسم الذي تريد عرض أوامره.\n`;
        msg += `🔹 مثال: الرد بـ "1" لعرض أوامر القسم الأول.\n`;

        const sentMsg = await message.reply({
          body: msg,
          callback: async function ({ body, senderID, messageID: replyMsgID }) {
            const categoryIndex = parseInt(body) - 1;

            if (isNaN(categoryIndex) || categoryIndex < 0 || categoryIndex >= availableCategories.length) {
              return message.reply("❌ | رقم القسم غير صحيح.");
            }

            const chosenCategory = availableCategories[categoryIndex];
            const categoryCommands = categories.get(chosenCategory).sort((a, b) => a.name.localeCompare(b.name));

            let categoryMessage = `📂 أوامر قسم ${chosenCategory}:\n\n`;
            categoryCommands.forEach(({ name, cmd }, index) => {
              const desc = cmd.config.shortDescription?.ar || "بدون وصف.";
              categoryMessage += `${index + 1}. ${prefix}${name}\n» ${desc}\n\n`;
            });

            categoryMessage += `💡 عدد الأوامر: ${categoryCommands.length}\n`;
            categoryMessage += `🧠 اكتب "${prefix}مساعدة [اسم الأمر]" لرؤية تفاصيل أمر معين.`;

            // حذف رسالة الأقسام فورًا
            await message.unsend(sentMsg.messageID);

            // إرسال أوامر القسم
            const sentCategoryMsg = await message.reply(categoryMessage);

            // حذفها بعد 5 دقائق
            setTimeout(async () => {
              try {
                await message.unsend(sentCategoryMsg.messageID);
              } catch (e) {}
            }, 5 * 60 * 1000);
          }
        });

        return;
      }

      // حالة: المستخدم كتب رقم القسم مباشرة بدل الرد
      const categoryIndex = parseInt(args[0]) - 1;
      if (isNaN(categoryIndex) || categoryIndex < 0 || categoryIndex >= availableCategories.length) {
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

      categoryMessage += `💡 عدد الأوامر: ${categoryCommands.length}\n`;
      categoryMessage += `🧠 اكتب "${prefix}مساعدة [اسم الأمر]" لرؤية تفاصيل أمر معين.`;

      const sentMsg = await message.reply(categoryMessage);

      setTimeout(async () => {
        try {
          await message.unsend(sentMsg.messageID);
        } catch (e) {}
      }, 5 * 60 * 1000);

    } catch (error) {
      console.error(error);
      return message.reply("❌ | حدث خطأ أثناء تنفيذ الأمر. يرجى المحاولة لاحقًا.");
    }
  }
};      arrayInfo.push(name);
    

    arrayInfo.sort((a, b) => a.data - b.data);

    const startSlice = numberOfOnePage*page - numberOfOnePage;
    i = startSlice;
    const returnArray = arrayInfo.slice(startSlice, startSlice + numberOfOnePage);

    for (let item of returnArray) msg += `「 ${++i} 」${prefix}${item}\n`;


    const siu = `Command list 📄\nMade by Prîyánsh Rajput 🥀\nFor More Information type /help (command name) ✨\n󰂆 󰟯 󰟰 󰟷 󰟺 󰟵 󰟫`;

 const text = `\nPage (${page}/${Math.ceil(arrayInfo.length/numberOfOnePage)})\n`;

    return api.sendMessage(siu + "\n\n" + msg  + text, threadID, async (error, info) => {
                        if (autoUnsend) {
                                await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
                                return api.unsendMessage(info.messageID);
                        } else return;
                }, event.messageID);
        }

        return api.sendMessage(getText("moduleInfo", command.config.name, command.config.description, `${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`, command.config.commandCategory, command.config.cooldowns, ((command.config.hasPermssion == 0) ? getText("user") : (command.config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot")), command.config.credits), threadID, messageID);
};          `│ ${usage}`,
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

      const availableCategories = Array.from(categories.keys());

      // عرض قائمة الأقسام فقط
      if (args.length === 0) {
        let msg = "📂 قائمة الأقسام:\n\n";
        availableCategories.forEach((category, index) => {
          msg += `${index + 1}. ${category}\n`;
        });

        msg += `\n🔹 قم بالرد على هذه الرسالة برقم القسم الذي تريد عرض أوامره.\n`;
        msg += `🔹 مثال: الرد بـ "1" لعرض أوامر القسم الأول.\n`;

        const sentMsg = await message.reply({
          body: msg,
          callback: async function ({ body, senderID, messageID: replyMsgID }) {
            const categoryIndex = parseInt(body) - 1;

            if (isNaN(categoryIndex) || categoryIndex < 0 || categoryIndex >= availableCategories.length) {
              return message.reply("❌ | رقم القسم غير صحيح.");
            }

            const chosenCategory = availableCategories[categoryIndex];
            const categoryCommands = categories.get(chosenCategory).sort((a, b) => a.name.localeCompare(b.name));

            let categoryMessage = `📂 أوامر قسم ${chosenCategory}:\n\n`;
            categoryCommands.forEach(({ name, cmd }, index) => {
              const desc = cmd.config.shortDescription?.ar || "بدون وصف.";
              categoryMessage += `${index + 1}. ${prefix}${name}\n» ${desc}\n\n`;
            });

            categoryMessage += `💡 عدد الأوامر: ${categoryCommands.length}\n`;
            categoryMessage += `🧠 اكتب "${prefix}مساعدة [اسم الأمر]" لرؤية تفاصيل أمر معين.`;

            // حذف رسالة الأقسام فورًا
            await message.unsend(sentMsg.messageID);

            // إرسال أوامر القسم
            const sentCategoryMsg = await message.reply(categoryMessage);

            // حذفها بعد 5 دقائق
            setTimeout(async () => {
              try {
                await message.unsend(sentCategoryMsg.messageID);
              } catch (e) {}
            }, 5 * 60 * 1000);
          }
        });

        return;
      }

      // حالة: المستخدم كتب رقم القسم مباشرة بدل الرد
      const categoryIndex = parseInt(args[0]) - 1;
      if (isNaN(categoryIndex) || categoryIndex < 0 || categoryIndex >= availableCategories.length) {
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

      categoryMessage += `💡 عدد الأوامر: ${categoryCommands.length}\n`;
      categoryMessage += `🧠 اكتب "${prefix}مساعدة [اسم الأمر]" لرؤية تفاصيل أمر معين.`;

      const sentMsg = await message.reply(categoryMessage);

      setTimeout(async () => {
        try {
          await message.unsend(sentMsg.messageID);
        } catch (e) {}
      }, 5 * 60 * 1000);

    } catch (error) {
      console.error(error);
      return message.reply("❌ | حدث خطأ أثناء تنفيذ الأمر. يرجى المحاولة لاحقًا.");
    }
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

        msg += `\n🔹 قم بالرد على هذه الرسالة برقم القسم الذي تريد عرض أوامره\n`;
        msg += `🔹 مثال: الرد برقم "1" لعرض أوامر القسم الأول`;

        const sentMsg = await message.reply(msg);
        
        const replyHandler = async (replyEvent) => {
          try {
            if (replyEvent.threadID === threadID && 
                replyEvent.messageReply?.messageID === sentMsg.messageID) {
              
              const replyContent = replyEvent.body.trim();
              const categoryIndex = parseInt(replyContent) - 1;
              
              if (!isNaN(categoryIndex) && categoryIndex >= 0 && categoryIndex < categoryList.length) {
                await api.unsendMessage(sentMsg.messageID);
                api.removeMessageListener(replyHandler);
                
                const currentCategory = categoryList[categoryIndex];
                const categoryCommands = categories.get(currentCategory)
                  .sort((a, b) => a.name.localeCompare(b.name));

                let categoryMessage = `📂 أوامر قسم ${currentCategory}:\n\n`;
                categoryCommands.forEach(({ name, cmd }, index) => {
                  const desc = cmd.config.shortDescription?.ar || "بدون وصف.";
                  categoryMessage += `${index + 1}. ${prefix}${name}\n» ${desc}\n\n`;
                });

                categoryMessage += `\n💡 عدد الأوامر: ${categoryCommands.length}\n`;
                categoryMessage += `🧠 اكتب "${prefix}مساعدة [اسم الأمر]" لرؤية تفاصيل أمر محدد.`;

                const sentCategoryMsg = await message.reply(categoryMessage);
                
                setTimeout(async () => {
                  try {
                    await api.unsendMessage(sentCategoryMsg.messageID);
                  } catch (e) {
                    console.error("خطأ في حذف الرسالة:", e);
                  }
                }, 5 * 60 * 1000);
              }
            }
          } catch (error) {
            console.error("حدث خطأ في معالج الرد:", error);
          }
        };

        api.addMessageListener(replyHandler);
        return;
      }

      // عرض أوامر قسم معين مباشرة إذا تم إدخال رقم القسم
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

      const sentMsg = await message.reply(categoryMessage);
      
      setTimeout(async () => {
        try {
          await api.unsendMessage(sentMsg.messageID);
        } catch (e) {
          console.error("خطأ في حذف الرسالة:", e);
        }
      }, 5 * 60 * 1000);

    } catch (error) {
      console.error(error);
      return message.reply("❌ | حدث خطأ أثناء تنفيذ الأمر. يرجى المحاولة لاحقًا.");
    }
  }
};            const categoryIndex = parseInt(replyContent) - 1;
            
            if (!isNaN(categoryIndex) && categoryIndex >= 0 && categoryIndex < categoryList.length) {
              // حذف رسالة القوائم فوراً
              api.unsendMessage(sentMsg.messageID);
              
              // إلغاء الاشتراك في الحدث
              api.removeMessageListener(replyHandler);
              
              // عرض أوامر القسم المطلوب
              const currentCategory = categoryList[categoryIndex];
              const categoryCommands = categories.get(currentCategory)
                .sort((a, b) => a.name.localeCompare(b.name));

              let categoryMessage = `📂 أوامر قسم ${currentCategory}:\n\n`;
              categoryCommands.forEach(({ name, cmd }, index) => {
                const desc = cmd.config.shortDescription?.ar || "بدون وصف.";
                categoryMessage += `${index + 1}. ${prefix}${name}\n» ${desc}\n\n`;
              });

              categoryMessage += `\n💡 عدد الأوامر: ${categoryCommands.length}\n`;
              categoryMessage += `🧠 اكتب "${prefix}مساعدة [اسم الأمر]" لرؤية تفاصيل أمر محدد.`;

              // إرسال رسالة الأوامر مع ضبط مؤقت للحذف بعد 5 دقائق
              const sentCategoryMsg = await message.reply(categoryMessage);
              
              // حذف رسالة الأوامر بعد 5 دقائق
              setTimeout(() => {
                api.unsendMessage(sentCategoryMsg.messageID);
              }, 5 * 60 * 1000); // 5 دقائق
            }
          }
        };

        // الاشتراك في حدث الرد على الرسالة
        api.addMessageListener(replyHandler);
        
        return;
      }

      // عرض أوامر قسم معين مباشرة إذا تم إدخال رقم القسم
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

      // إرسال رسالة الأوامر مع ضبط مؤقت للحذف بعد 5 دقائق
      const sentMsg = await message.reply(categoryMessage);
      
      setTimeout(() => {
        api.unsendMessage(sentMsg.messageID);
      }, 5 * 60 * 1000); // 5 دقائق

    } catch (error) {
      console.error(error);
      return message.reply("❌ | حدث خطأ أثناء تنفيذ الأمر. يرجى المحاولة لاحقًا.");
    }
  }
};    const prefix = getPrefix(threadID);

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
