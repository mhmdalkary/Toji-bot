const axios = require('axios');

module.exports = {
  config: {
    name: "معنى_إيموجي",
    version: "1.0",
    author: "Mohamed Hassan",
    role: 0,
    shortDescription: { ar: "يُظهر معنى الإيموجي من API" },
    longDescription: { ar: "يعرض وصف الإيموجي المطلوب باستخدام API خارجي" },
    category: "ترفيه",
    guide: { ar: "{p}معنى_إيموجي 😂" }
  },

  onStart: async function ({ message, args }) {
    const emoji = args[0];
    if (!emoji) return message.reply("❌ | أرسل إيموجي واحد فقط للحصول على معناه.");

    try {
      const res = await axios.get(`https://emojihub.yurace.pro/api/all`);
      const allEmojis = res.data;

      const found = allEmojis.find(e => e.htmlCode && e.htmlCode.includes(emoji));

      if (!found) return message.reply("❌ | لم أتمكن من إيجاد معنى هذا الإيموجي.");

      const name = found.name || "غير معروف";
      const category = found.category || "غير معروف";
      const group = found.group || "غير معروف";

      return message.reply(`🔎 | معنى الإيموجي ${emoji}:\n\n📝 الاسم: ${name}\n📂 الفئة: ${category}\n👥 المجموعة: ${group}`);
    } catch (err) {
      console.error(err);
      return message.reply("❌ | حدث خطأ أثناء محاولة جلب معنى الإيموجي.");
    }
  }
};