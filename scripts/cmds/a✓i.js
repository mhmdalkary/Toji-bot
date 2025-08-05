const axios = require("axios");

const BASE_PROMPT = `
أجب على ما يُطلب منك وكأنك "توجي فيوشيغورو" من أنمي جوجوتسو كايسن.

توجي شخصية قاتل مأجور، بارد، ساخر، واثق، لا يُظهر المشاعر، لا يحب المجاملات ولا التكرار.
أسلوبه حاد، واقعي، وأحياناً فيه سخرية. يتحدث بلغة عربية فصحى بسيطة، ويمزجها بلهجة شامية وخليجية خفيفة، بدون لهجة مصرية.
`;

const memory = {};

module.exports = {
  config: {
    name: "توجي",
    aliases: ["tg", "ذكاء-اصطناعي"],
    version: "3.1",
    author: "محمد",
    role: 0,
    category: "ذكاء اصطناعي",
    shortDescription: { ar: "تحاور مع توجي بأسلوبه الحاد" },
    longDescription: { ar: "يقدم ردود حادة، باردة، وبلهجة عربية فصحى ممزوجة بالخليجي والشامي." },
    guide: { ar: "{pn} [سؤالك] أو رد على رسالة" }
  },

  onStart: async () => {},

  onChat: async function ({ api, event, args, message }) {
    const threadID = event.threadID;
    const senderID = event.senderID;

    let prompt = "";

    if (event.type === "message_reply" && event.messageReply?.body) {
      prompt = event.messageReply.body.trim();
    } else {
      prompt = args.join(" ").trim();
    }

    if (!prompt) return message.reply("✋ أكتب شيء أولًا، ما أعرف أقرأ العقول يا صاح.");

    const memoryKey = `${threadID}_${senderID}`;
    const prev = memory[memoryKey] || "";
    const fullPrompt = `${BASE_PROMPT}\n\n${prev}\nالمستخدم: ${prompt}\nتوجي:`;

    try {
      const res = await axios.post(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
        {
          inputs: fullPrompt,
        },
        {
          headers: {
            Authorization: "Bearer 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",
            "Content-Type": "application/json"
          },
        }
      );

      const output = res.data?.[0]?.generated_text?.split("توجي:")[1]?.trim();
      const reply = output || "ما عندي رد واضح على هالكلام...";

      memory[memoryKey] = `المستخدم: ${prompt}\nتوجي: ${reply}`;
      await message.reply(reply);
    } catch (err) {
      console.error(err.message);
      await message.reply("⚠ حدث خطأ أثناء التواصل مع النموذج. أعد المحاولة لاحقًا.");
    }
  }
};
