const axios = require("axios");

module.exports = {
  config: {
    name: "توجي",
    aliases: ["toji"],
    version: "3.0.0",
    author: "محمد ✨",
    countDown: 2,
    role: 0,
    shortDescription: "تحدث مع توجي بأسلوب مخصص",
    longDescription: "استخدم ذكاء اصطناعي للحديث مع شخصية توجي من أنمي جوجتسو كايسن بأسلوب مرعب وذكي",
    category: "ذكاء اصطناعي",
    guide: {
      ar: "{p}توجي [سؤالك]",
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const API_KEY = "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"; // مثال: openrouter-abc123xyz
    const MODEL = "gpt-oss-20b (free)";

    const PROMPT_STYLE = "أجب كأنك توجي من أنمي جوجتسو كايسن، كن ذكيًا، مرعبًا، وغامضًا، واستخدم العربية الفصحى بلمسة ليبية إذا أمكن.";

    let userInput = args.join(" ").trim();
    const messageReply = event.messageReply;

    // لو ما كتب شي وش رد على رسالة من توجي، اعتبرها مواصلة للحوار
    if (!userInput && messageReply?.senderID === api.getCurrentUserID()) {
      userInput = messageReply.body;
    }

    // لو فاضي تمامًا
    if (!userInput) {
      return message.reply("👀 أكتب شي بعد 'توجي' أو رد على رسالته مباشرة.");
    }

    const fullPrompt = `${PROMPT_STYLE}\n\nالمستخدم: ${userInput}\nتوجي:`;

    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: MODEL,
          messages: [{ role: "user", content: fullPrompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "HTTP-Referer": "https://chat.openrouter.ai", // بعض النماذج تتطلبه
            "Content-Type": "application/json"
          },
        }
      );

      const reply = res.data.choices?.[0]?.message?.content || "🔇 ما عنديش رد واضح.";
      message.reply(reply);
    } catch (err) {
      console.error("❌ خطأ:", err.message);
      message.reply("⚠️ حدث خطأ أثناء الاتصال بـ OpenRouter. جرب لاحقًا.");
    }
  }
};