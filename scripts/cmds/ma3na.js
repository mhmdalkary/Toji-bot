const axios = require('axios');

module.exports = {
  config: {
    name: "معنى_إيموجي",
    version: "1.1",
    author: "Mohamed Hassan",
    role: 0,
    shortDescription: { ar: "يعرض معنى الإيموجي" },
    longDescription: { ar: "يعرض وصف ومعنى أي إيموجي ترسله من خلال API خارجي" },
    category: "أدوات",
    guide: { ar: "{p}معنى_إيموجي 😂" }
  },

  onStart: async function ({ message, args }) {
    const emoji = args[0];
    if (!emoji) return message.reply("❌ | أرسل إيموجي واحد فقط للحصول على معناه.");

    try {
      const res = await axios.get(`https://emojihub.yurace.pro/api/all`);
      const allEmojis = res.data;

      const found = allEmojis.find(e => {
        if (!e.unicode) return false;
        return e.unicode.includes(emoji.codePointAt(0).toString(16));
      });

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
