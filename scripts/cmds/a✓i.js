const axios = require("axios");

const Prefixes = [
  "توجي", "بوت", "¶sammy", "ذكاء-اصطناعي",
  ".الين", "/الين", "!الين", "@الين", "#الين", "$الين", "%الين", "^الين", "*الين",
  ".ذكاء-اصطناعي", "/ذكاء-اصطناعي", "!ذكاء-اصطناعي", "@ذكاء-اصطناعي",
  "#ذكاء-اصطناعي", "$ذكاء-اصطناعي", "%ذكاء-اصطناعي", "^ذكاء-اصطناعي", "*ذكاء-اصطناعي"
];

// برومبت يمثل شخصية توجي فيوشيغورو من جوجوتسو كايسن
const BASE_PROMPT = `
أجب على السؤال التالي كشخصية "توجي فيوشيغورو" من أنمي جوجوتسو كايسن.
توجي هو قاتل محترف، بارد، واثق، لا يجامل، يتكلم باختصار، ساخر أحيانًا.
ردوده حادة، مباشرة، ولا يظهر مشاعر واضحة.
استخدم نبرة جدية، وتجنب العبارات اللطيفة أو الودية.

السؤال:
`;

module.exports = {
  config: {
    name: "توجي",
    aliases: ["ذكاء-اصطناعي"],
    version: "2.5",
    author: "الين",
    role: 0,
    category: "أدوات",
    shortDescription: {
      ar: "اسأل الذكاء الاصطناعي عن إجابة بأسلوب توجي."
    },
    longDescription: {
      ar: "استخدم هذا الأمر لطرح سؤال وسيتم الرد عليك بأسلوب شخصية توجي فيوشيغورو من أنمي جوجوتسو كايسن."
    },
    guide: {
      ar: "{pn} [سؤالك]"
    }
  },

  onStart: async function () {},

  onChat: async function ({ api, event, args, message }) {
    try {
      const body = event.body?.toLowerCase();
      const prefix = Prefixes.find(p => body && body.startsWith(p));

      if (!prefix) return; // تجاهل إذا لم يكن البريفكس موجود

      const prompt = event.body.slice(prefix.length).trim();

      if (!prompt) {
        return message.reply("❗ الرجاء كتابة سؤالك بعد الأمر.");
      }

      await message.reply("⌛ جارٍ التفكير...");

      const fullPrompt = BASE_PROMPT + prompt;

      // إرسال الطلب الأول
      const res1 = await axios.get(`https://wra--marok85067.repl.co/?gpt=${encodeURIComponent(fullPrompt)}`);
      if (res1.status !== 200 || !res1.data) throw new Error("فشل في الاتصال بالسيرفر (المرحلة 1)");

      // انتظار بسيط (20 مللي ثانية)
      await new Promise(resolve => setTimeout(resolve, 20));

      // إرسال الطلب الثاني للحصول على الرد
      const res2 = await axios.get("https://wra--marok85067.repl.co/show");
      if (res2.status !== 200 || !res2.data) throw new Error("فشل في استلام الرد من السيرفر (المرحلة 2)");

      const replyText = res2.data.trim();
      if (!replyText) throw new Error("الرد فارغ");

      await message.reply(replyText);

      console.log("✅ تم إرسال الرد بنجاح.");

    } catch (error) {
      console.error("❌ حدث خطأ:", error.message);
      api.sendMessage(
        `⚠️ حدث خطأ: ${error.message}\n\nيرجى المحاولة مرة أخرى لاحقًا.`,
        event.threadID
      );
    }
  }
};
