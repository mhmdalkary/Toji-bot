const axios = require("axios");

module.exports.config = {
  name: "توجي",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "محمد",
  description: "تحدث مع توجي بأسلوب مخصص",
  commandCategory: "ذكاء اصطناعي",
  usages: "[سؤال]",
  cooldowns: 2,
};

const API_KEY = "ضع_مفتاح_API_هنا";
const AGENT_ID = "ضع_ID_الوكيل_هنا";

// البرومبت المخصص – عدل هذا النص كما تريد
const PROMPT_STYLE = "❗️أجب كأنك توجي من أنمي جوجتسو كايسن، اجعل إجاباتك ذكية، مرحة أحيانًا، ولكن غامضة ومخيفة أحيانًا أخرى. استخدم اللغة العربية الفصحى ببعض اللهجة الشعبية الليبية عند اللزوم.";

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, messageReply, body, senderID, isGroup } = event;

  // تحقق إن فيه شيء يُسأل
  let userInput = args.join(" ").trim();

  // لو ما فيه شيء مكتوب، شوف إذا هو رد على رسالة
  if (!userInput && messageReply?.senderID !== api.getCurrentUserID()) {
    return api.sendMessage("👀 أكتب شي بعد 'توجي' أو رد على رسالته مباشرة.", threadID, messageID);
  }

  // التحقق من حالة الرد على رسالة من توجي
  if (!userInput && messageReply?.senderID === api.getCurrentUserID()) {
    userInput = messageReply.body;
  }

  // الدمج بين البرومبت والسؤال
  const fullPrompt = `${PROMPT_STYLE}\n\nالمستخدم: ${userInput}`;

  try {
    const res = await axios.post(
      "https://api.chipp.ai/v1/chat",
      {
        agentId: AGENT_ID,
        message: fullPrompt,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
      }
    );

    const reply = res.data?.message || "🤖 ما فهمتش، عاود صياغ السؤال.";

    api.sendMessage(reply, threadID, messageID);
  } catch (err) {
    console.error("❌ خطأ:", err.message);
    api.sendMessage("⚠️ حدث خطأ أثناء الاتصال بتوجي. جرب لاحقًا.", threadID, messageID);
  }
};

// دعم البادئة البديلة بدون نقطة
module.exports.handleEvent = async function({ api, event }) {
  const { body, threadID, messageID, messageReply } = event;

  if (!body) return;

  const bodyTrimmed = body.trim().toLowerCase();

  // لو بدأ بـ "توجي" وكمل بكلام
  if (bodyTrimmed.startsWith("توجي")) {
    const fakeArgs = bodyTrimmed.replace(/^توجي\s*/i, "").split(" ");
    module.exports.run({ api, event, args: fakeArgs });
  }

  // أو لو كانت رد على رسالة من البوت
  else if (messageReply?.senderID === api.getCurrentUserID()) {
    module.exports.run({ api, event, args: [body] });
  }
};