const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("اقتباس")
    .setDescription("يعرض اقتباسًا عشوائيًا من مجموعة مختارة."),

  async execute(interaction) {
    try {
      const filePath = path.join(__dirname, "quots.json");

      if (!fs.existsSync(filePath)) {
        return await interaction.reply("❌ لم يتم العثور على ملف الاقتباسات.");
      }

      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      if (!Array.isArray(data) || data.length === 0) {
        return await interaction.reply("📭 لا توجد اقتباسات متاحة حاليًا.");
      }

      const randomQuote = data[Math.floor(Math.random() * data.length)];
      await interaction.reply(`💬 ${randomQuote}`);
    } catch (error) {
      console.error("❌ خطأ في أمر الاقتباس:", error);
      await interaction.reply("⚠️ حدث خطأ أثناء محاولة عرض الاقتباس.");
    }
  },
};
