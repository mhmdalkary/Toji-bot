const axios = require("axios");

module.exports = {
  config: {
    name: "معنى_إيموجي",
    version: "1.0",
    author: "ChatGPT + تعديلات محمد حسن",
    shortDescription: {
      ar: "احصل على معنى الإيموجي"
    },
    longDescription: {
      ar: "يعرض معنى إيموجي معين من الإنترنت بالإضافة إلى مصادر المعنى"
    },
    category: "الذكاء-الاصطناعي",
    guide: {
      ar: "{p}معنى_إيموجي 🐱"
    }
  },

  onStart: async function ({ args, message, event, getLang }) {
    const emoji = args[0];
    const myLang = "ar"; // تغيير اللغة حسب ما تحتاج

    if (!emoji) return message.reply("❌ | الرجاء إدخال إيموجي مثل: {p}معنى_إيموجي 😂");

    let getMeaning;
    try {
      getMeaning = await getEmojiMeaning(emoji, myLang);
    } catch (e) {
      if (e.response && e.response.status == 429) {
        let tryNumber = 0;
        while (tryNumber < 3) {
          try {
            getMeaning = await getEmojiMeaning(emoji, myLang);
            break;
          } catch (err) {
            tryNumber++;
          }
        }
        if (tryNumber === 3)
          return message.reply("❌ | تم إرسال عدد كبير من الطلبات، حاول لاحقاً.");
      } else {
        return message.reply("❌ | حدث خطأ أثناء محاولة جلب معنى الإيموجي.");
      }
    }

    if (!getMeaning || typeof getMeaning !== "object" || !getMeaning.meaning) {
      return message.reply("❌ | لم أتمكن من العثور على معنى هذا الإيموجي.");
    }

    const {
      meaning,
      moreMeaning,
      wikiText,
      meaningOfWikipedia,
      shortcode,
      source
    } = getMeaning;

    const result = `🔍 | معنى الإيموجي ${emoji}:\n\n` +
      `📖 المعنى: ${meaning}\n` +
      `${moreMeaning ? `📝 إضافات: ${moreMeaning}\n` : ''}` +
      `${meaningOfWikipedia ? `📚 ويكيبيديا: ${meaningOfWikipedia}\n` : ''}` +
      `${wikiText ? `📘 شرح: ${wikiText}\n` : ''}` +
      `${shortcode ? `🏷️ الاختصار: ${shortcode}\n` : ''}` +
      `${source ? `🔗 المصدر: ${source}` : ''}`;

    message.reply(result);
  }
};

async function getEmojiMeaning(emoji, lang = "en") {
  const res = await axios.get(`https://emojihub.yurace.pro/api/emoji/${encodeURIComponent(emoji)}?lang=${lang}`);
  return res.data;
}