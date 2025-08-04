const axios = require('axios');

const Prefixes = [
  'توجي',
  'بوت',
  '¶sammy',
  'ذكاء-اصطناعي',
  '.الين',
  '/الين',
  '!الين',
  '@الين',
  '#الين',
  '$الين',
  '%الين',
  '^الين',
  '*الين',
  '.ذكاء-اصطناعي',
  '/ذكاء-اصطناعي',
  '!ذكاء-اصطناعي',
  '@ذكاء-اصطناعي',
  '#ذكاء-اصطناعي',
  '$ذكاء-اصطناعي',
  '%ذكاء-اصطناعي',
  '^ذكاء-اصطناعي',
  '*ذكاء-اصطناعي',
];

// برومبت يمثل شخصية توجي فيوشيغورو
const BASE_PROMPT = `
أجب على السؤال التالي كشخصية "توجي فيوشيغورو" من أنمي جوجوتسو كايسن.
توجي هو شخصية باردة، قاتل محترف، يتكلم باختصار وبشكل مباشر، لا يكثر من المجاملات، ولا يظهر المشاعر.
هو واثق من نفسه، حاد الملاحظة، وساخر أحياناً.
ردوده يجب أن تكون مليئة بالثقة والحدة، دون أن تكون وقحة.
استخدم نبرة جادة وعقلانية، وتجنب العبارات اللطيفة أو الودية.

السؤال:
`;

module.exports = {
  config: {
    name: 'توجي',
    aliases: ['ذكاء-اصطناعي'],
    version: '2.5',
    author: 'الين',
    role: 0,
    category: 'utility',
    shortDescription: {
      en: 'اسأل الذكاء الاصطناعي عن إجابة.'
    },
    longDescription: {
      en: 'اسأل الذكاء الاصطناعي للحصول على إجابة استنادا إلى مطالبة المستخدم.'
    },
    guide: {
      en: '{pn} [سؤال]'
    }
  },

  onStart: async function () {},

  onChat: async function ({ api, event, args, message }) {
    try {
      const prefix = Prefixes.find(p => event.body && event.body.toLowerCase().startsWith(p));

      // تحقق من صحة البريفكس
      if (!prefix) {
        return; // تجاهل الأمر إذا البريفكس غير صحيح
      }

      // استخرج محتوى السؤال بدون البريفكس
      const prompt = event.body.substring(prefix.length).trim();

      if (prompt === '') {
        await message.reply("يرجى تقديم السؤال في الوقت الذي يناسبك وسأسعى جاهدا لتقديم رد فعال. رضاكم هو أولويتي القصوى.");
        return;
      }

      await message.reply("⌛ جارٍ التفكير...");

      // دمج البرومبت مع سؤال المستخدم
      const fullPrompt = BASE_PROMPT + prompt;

      // طلب الرد من API مجاني (يمكن تعديله حسب API لديك)
      const response = await axios.get(`https://wra--marok85067.repl.co/?gpt=${encodeURIComponent(fullPrompt)}`);

      if (response.status !== 200 || !response.data) {
        throw new Error('استجابة غير صالحة أو مفقودة من واجهة برمجة التطبيقات');
      }

      // انتظار بسيط ثم جلب الرد النهائي
      await new Promise(resolve => setTimeout(resolve, 20));

      const output = await axios.get('https://wra--marok85067.repl.co/show');

      if (output.status !== 200 || !output.data) {
        throw new Error('استجابة غير صالحة أو مفقودة من واجهة برمجة التطبيقات');
      }

      const messageText = output.data.trim();

      await message.reply(messageText);

      console.log('تم إرسال الإجابة كرد على المستخدم');
    } catch (error) {
      console.error(`Failed to get answer: ${error.message}`);
      api.sendMessage(
        `${error.message}.\n\nيمكنك محاولة كتابة سؤالك مرة أخرى أو إعادة إرساله ، حيث قد يكون هناك خطأ من الخادم الذي يسبب المشكلة. قد يحل المشكلة.`,
        event.threadID
      );
    }
  }
};