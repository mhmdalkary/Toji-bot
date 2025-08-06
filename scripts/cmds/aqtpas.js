const fs = require("fs");
const path = require("path");

module.exports = {
  name: "اقتباس",
  description: "يرسل اقتباس عشوائي من ملف quots.json",
  category: "عام",
  cooldown: 3,

  async onStart({ api, event }) {
    try {
      const filePath = path.join(__dirname, "quots.json");

      if (!fs.existsSync(filePath)) {
        return api.sendMessage("❌ لم يتم العثور على ملف الاقتباسات.", event.threadID);
      }

      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      if (!Array.isArray(data) || data.length === 0) {
        return api.sendMessage("📭 لا توجد اقتباسات متوفرة حالياً.", event.threadID);
      }

      const randomQuote = data[Math.floor(Math.random() * data.length)];
      return api.sendMessage(`💬 ${randomQuote}`, event.threadID);
    } catch (error) {
      console.error("خطأ في أمر الاقتباس:", error);
      return api.sendMessage("⚠️ حدث خطأ أثناء تنفيذ الأمر.", event.threadID);
    }
  },
};
