const axios = require('axios');

// برومبت توجي باللهجة والفصحى
const BASE_PROMPT = `
أجب على ما يُطلب منك وكأنك "توجي فيوشيغورو" من أنمي جوجوتسو كايسن.

توجي شخصية قاتل مأجور، بارد، ساخر، واثق، لا يُظهر المشاعر، لا يحب المجاملات ولا التكرار.
أسلوبه حاد، واقعي، وأحياناً فيه سخرية. يتحدث بلغة عربية فصحى بسيطة، ويمزجها بلهجة شامية وخليجية خفيفة، بدون لهجة مصرية.
لا يُجامل، ولا يتعاطف، ويحب الردود المختصرة التي تحمل معنى عميق.

إذا كان السؤال تافهًا أو مكررًا، عبّر عن الملل أو الضيق.
إذا كان السؤال جادًا، أجب باحترافية وبشكل مختصر.
`;

const conversationMemory = {};

module.exports = {
  config: {
    name: 'توجي',
    aliases: ['ذكاء-اصطناعي', 'tg'],
    version: '3.0',
    author: 'محمد',
    role: 0,
    category: 'ذكاء اصطناعي',
    shortDescription: {
      ar: 'تحاور مع توجي فيوشيغورو بأسلوبه الحاد'
    },
    longDescription: {
      ar: 'اكتب سؤالك وسيجيبك توجي فيوشيغورو بأسلوبه القاتل والساخر والمباشر، مع لهجات عربية مفهومة.'
    },
    guide: {
      ar: '{pn} [سؤالك] أو عبر الرد على رسالة'
    }
  },

  onStart: async function () {},

  onChat: async function ({ api, event, args, message }) {
    try {
      const threadID = event.threadID;
      const senderID = event.senderID;
      let prompt = '';

      if (event.type === 'message_reply' && event.messageReply?.body) {
        prompt = event.messageReply.body.trim();
      } else {
        prompt = args.join(' ').trim();
      }

      if (!prompt) return message.reply("🧠 أكتب شيء أولًا... أنا ما أقرأ الأفكار.");

      const memoryKey = `${threadID}_${senderID}`;
      const previous = conversationMemory[memoryKey] || '';
      const fullPrompt = `${BASE_PROMPT}\n\n${previous}\nالمستخدم: ${prompt}\nتوجي:`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: BASE_PROMPT },
            { role: "user", content: prompt }
          ],
          temperature: 0.8
        },
        {
          headers: {
            'Authorization': 'Bearer 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',
            'Content-Type': 'application/json'
          }
        }
      );

      const tojiReply = response.data.choices[0].message.content.trim();

      conversationMemory[memoryKey] = `المستخدم: ${prompt}\nتوجي: ${tojiReply}`;

      await message.reply(tojiReply);
    } catch (error) {
      console.error("❌ API Error:", error.message);
      await message.reply(`⚠ حدث خطأ: ${error.response?.statusText || error.message}\nيرجى المحاولة لاحقًا.`);
    }
  }
};
