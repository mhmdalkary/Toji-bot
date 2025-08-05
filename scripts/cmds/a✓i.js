const axios = require("axios");

const Prefixes = [
  "توجي", "¶sammy", "ذكاء-اصطناعي",
  ".الين", "/الين", "!الين", "@الين", "#الين", "$الين", "%الين", "^الين", "*الين",
  ".ذكاء-اصطناعي", "/ذكاء-اصطناعي", "!ذكاء-اصطناعي", "@ذكاء-اصطناعي",
  "#ذكاء-اصطناعي", "$ذكاء-اصطناعي", "%ذكاء-اصطناعي", "^ذكاء-اصطناعي", "*ذكاء-اصطناعي"
];

// برومبت شخصية توجي فيوشيغورو
const BASE_PROMPT = `
أجب على السؤال التالي كشخصية "توجي فيوشيغورو" من أنمي جوجوتسو كايسن.
توجي شخص بارد، لا يُبالي، يتحدث بثقة واختصار وسخرية دون عاطفة.

السؤال:
`;

module.exports = {
  config: {
    name: "توجي",
    aliases: ["ذكاء-اصطناعي"],
    version: "3.0",
    author: "الين ✦ تطوير: محمد",
    role: 0,
    category: "أدوات",
    shortDescription: { ar: "ردود ذكية بأسلوب توجي فيوشيغورو" },
    longDescription: { ar: "اطرح سؤالاً لترد عليك شخصية توجي بجفاف وقوة وبدون مجاملة" },
    guide: { ar: "{pn} [سؤالك]" }
  },

  onStart: async () => {},

  onChat: async function ({ event, message }) {
    try {
      const body = event.body?.toLowerCase();
      const prefix = Prefixes.find(p => body?.startsWith(p));
      if (!prefix) return;

      const prompt = event.body.slice(prefix.length).trim();
      if (!prompt) return message.reply("❗ اكتب سؤالك بعد اسم الأمر.");

      const fullPrompt = BASE_PROMPT + prompt;

      // استخدم API موثوق من HuggingFace
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/EleutherAI/gpt-j-6B",
        {
          inputs: fullPrompt
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 15000 // 15 ثانية
        }
      );

      const reply = response.data?.[0]?.generated_text?.replace(fullPrompt, "").trim();

      if (!reply) throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي.");

      await message.reply(reply);

    } catch (error) {
      console.error("❌ خطأ:", error.message);
      await message.reply(`⚠ حدث خطأ: ${error.message.includes("ENOTFOUND") ? "تعذر الوصول إلى الخادم." : error.message}\n\nيرجى المحاولة مرة أخرى لاحقًا.`);
    }
  }
};
