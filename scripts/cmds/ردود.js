const fs = require("fs");
const path = require("path");

const repliesFile = path.join(__dirname, "autoReplies.json");

// إن لم يوجد الملف، يتم إنشاؤه تلقائيًا عند أول تشغيل
if (!fs.existsSync(repliesFile)) {
  fs.writeFileSync(repliesFile, JSON.stringify({}, null, 2));
  console.log("✅ تم إنشاء ملف autoReplies.json لتخزين الردود التلقائية.");
}

module.exports = {
  config: {
    name: "الرد",
    version: "1.0.0",
    hasPermission: 0,
    credits: "محمد & ChatGPT",
    description: "إضافة، حذف، أو عرض الردود التلقائية",
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
    const replies = JSON.parse(fs.readFileSync(repliesFile, "utf8"));

    // إضافة رد
    if (content.startsWith(".اضفرد ")) {
      const parts = content.slice(8).split("=>").map(s => s.trim());
      if (parts.length !== 2 || !parts[0] || !parts[1])
        return message.reply("❌ الصيغة غير صحيحة. استخدم:\n.اضفرد كلمة => الرد");

      const [trigger, replyText] = parts;
      replies[trigger.toLowerCase()] = replyText;
      fs.writeFileSync(repliesFile, JSON.stringify(replies, null, 2));
      return message.reply(`✅ تم إضافة الرد على "${trigger}" بنجاح.`);
    }

    // حذف رد
    if (content.startsWith(".احذررد ")) {
      const trigger = content.slice(9).trim().toLowerCase();
      if (!replies[trigger]) return message.reply("❌ لا يوجد رد محفوظ بهذه الكلمة.");
      delete replies[trigger];
      fs.writeFileSync(repliesFile, JSON.stringify(replies, null, 2));
      return message.reply(`🗑️ تم حذف الرد على "${trigger}" بنجاح.`);
    }

    // عرض الردود
    if (content === ".عرضالردود") {
      const keys = Object.keys(replies);
      if (keys.length === 0) return message.reply("📭 لا توجد أي ردود محفوظة حالياً.");
      const formatted = keys.map(key => `🔹 "${key}" ➜ ${replies[key]}`).join("\n");
      return message.reply(`📋 قائمة الردود:\n\n${formatted}`);
    }

    // التحقق من الرد التلقائي
    const msg = content.toLowerCase();
    if (replies[msg]) {
      return message.reply(replies[msg]);
    }
  }
};
