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

module.exports = {
  config: {
    name: 'نيرو',
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
  onStart: async function() {},
  onChat: async function ({ api, event, args, message }) {
    try {
      const prefix = Prefixes.find(p => event.body && event.body.toLowerCase().startsWith(p));

      // Check if the prefix is valid
      if (!prefix) {
        return; // Invalid prefix, ignore the command
      }

      // Remove the prefix from the message body
      const prompt = event.body.substring(prefix.length).trim();

      // Check if prompt is empty
      if (prompt === '') {
        await message.reply("يرجى تقديم السؤال في الوقت الذي يناسبك وسأسعى جاهدا لتقديم رد فعال. رضاكم هو أولويتي القصوى.");
        return;
      }

      // Send a message indicating that the question is being answered
      await message.reply("");

      const response = await axios.get(`https://wra--marok85067.repl.co/?gpt=${encodeURIComponent(prompt)}`);

      if (response.status !== 200 || !response.data) {
        throw new Error('استجابة غير صالحة أو مفقودة من واجهة برمجة التطبيقات');
      }

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
  },
};