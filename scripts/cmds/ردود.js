const fs = require("fs");
const path = require("path");

const repliesFile = path.join(__dirname, "autoReplies.json");

// إنشاء الملف تلقائيًا إذا لم يوجد
if (!fs.existsSync(repliesFile)) {
  fs.writeFileSync(repliesFile, JSON.stringify({}, null, 2));
  console.log("✅ تم إنشاء ملف الردود التلقائية.");
}

module.exports = {
  config: {
    name: "الرد",
    version: "1.1.0",
    hasPermission: 0,
    credits: "محمد & ChatGPT",
    description: "إضافة، حذف، عرض، وردود متعددة تلقائية",
    commandCategory: "الردود",
    usages: `
.اضفرد [كلمة] => [الرد]
.احذررد [كلمة]
.عرضالردود
    `.trim(),
    cooldowns: 2,
  },

  run: async function ({ event, message }) {
    const content = event.body;
    let replies = JSON.parse(fs.readFileSync(repliesFile, "utf8"));

    // أمر الإضافة
    if (content.startsWith(".اضفرد ")) {
      const parts = content.slice(8).split("=>").map(s => s.trim());
      if (parts.length !== 2 || !parts[0] || !parts[1])
        return message.reply("❌ الصيغة غير صحيحة. استخدم:\n.اضفرد كلمة => الرد");

      const [trigger, replyText] = parts;
      const key = trigger.toLowerCase();

      if (!replies[key]) {
        replies[key] = [replyText];
      } else {
        if (replies[key].includes(replyText)) {
          return message.reply("⚠️ هذا الرد مضاف مسبقًا لهذه الكلمة.");
        }
        replies[key].push(replyText);
      }

      fs.writeFileSync(repliesFile, JSON.stringify(replies, null, 2));
      return message.reply(`✅ تم إضافة الرد على "${key}".`);
    }

    // أمر الحذف
    if (content.startsWith(".احذررد ")) {
      const key = content.slice(9).trim().toLowerCase();
      if (!replies[key]) return message.reply("❌ لا يوجد رد محفوظ بهذه الكلمة.");

      delete replies[key];
      fs.writeFileSync(repliesFile, JSON.stringify(replies, null, 2));
      return message.reply(`🗑️ تم حذف جميع الردود على "${key}".`);
    }

    // أمر العرض
    if (content === ".عرضالردود") {
      const keys = Object.keys(replies);
      if (keys.length === 0) return message.reply("📭 لا توجد أي ردود محفوظة حالياً.");

      const formatted = keys.map(key =>
        `🔹 "${key}":\n${replies[key].map((r, i) => `   ${i + 1}. ${r}`).join("\n")}`
      ).join("\n\n");

      return message.reply(`📋 الردود:\n\n${formatted}`);
    }

    // الرد التلقائي (تطابق جزئي + عشوائي)
    const msg = content.toLowerCase();

    for (let key in replies) {
      if (msg.includes(key)) {
        const possibleReplies = replies[key];
        const randomReply = possibleReplies[Math.floor(Math.random() * possibleReplies.length)];
        return message.reply(randomReply);
      }
    }
  }
};      return message.reply(replies[msg]);
  }
};
