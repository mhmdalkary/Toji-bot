const axios = require("axios");

module.exports.config = {
  name: "توجي",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "محمد ✨",
  description: "تحدث مع توجي باستخدام OpenRouter",
  commandCategory: "ذكاء اصطناعي",
  usages: "[سؤال]",
  cooldowns: 2,
};

const API_KEY = "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"; // مثال: openrouter-abc123xyz456
const MODEL = "mistralai/mistral-7b-instruct";

const PROMPT_STYLE = "أجب كأنك توجي من أنمي جوجتسو كايسن، كن ذكيًا، مرعبًا، وغامضًا، واستخدم العربية الفصحى بلمسة ليبية إذا أمكن.";

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, messageReply, body } = event;
  let userInput = args.join(" ").trim();

  if (!userInput && messageReply?.senderID !== api.getCurrentUserID()) {
    return api.sendMessage("👀 أكتب شي بعد 'توجي' أو رد على رسالته مباشرة.", threadID, messageID);
  }

  if (!userInput && messageReply?.senderID === api.getCurrentUserID()) {
    userInput = messageReply.body;
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
          "HTTP-Referer": "https://chat.openrouter.ai", // اختياري، لكن بعض النماذج تحتاجه
          "Content-Type": "application/json"
        },
      }
    );

    const reply = res.data.choices?.[0]?.message?.content || "🔇 ما عنديش رد واضح.";
    api.sendMessage(reply, threadID, messageID);
  } catch (err) {
    console.error("❌ خطأ:", err.message);
    api.sendMessage("⚠️ حدث خطأ أثناء الاتصال بـ OpenRouter. جرب لاحقًا.", threadID, messageID);
  }
};

module.exports.handleEvent = async function({ api, event }) {
  const { body, threadID, messageID, messageReply } = event;

  if (!body) return;

  const bodyTrimmed = body.trim().toLowerCase();
  if (bodyTrimmed.startsWith("توجي")) {
    const fakeArgs = body.trim().replace(/^توجي\s*/i, "").split(" ");
    module.exports.run({ api, event, args: fakeArgs });
  } else if (messageReply?.senderID === api.getCurrentUserID()) {
    module.exports.run({ api, event, args: [body] });
  }
};