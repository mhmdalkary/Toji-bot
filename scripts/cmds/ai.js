const axios = require("axios");
const maxStorageMessage = 50;

if (!global.temp.mistralHistory) global.temp.mistralHistory = {};
const { mistralHistory } = global.temp;

module.exports = {
  config: {
    name: "كاتلر",
    aliases: ["تجربة","حبي","قطتي"],
    version: "2.0",
    role: 0,
    countDown: 5,
    author: "𝙸𝙷𝙰𝙱", //Don’t remove author credit 
    shortDescription: { en: "الدردشة مع الذكاء الاصطناعي Astr-a" },
    longDescription: { 
      ar: "اسأل أي شيء من Astr-a Ai مع ذاكرة المحادثة، ودعم الردود، وشخصية مخصصة.\n\n😺| ميزة Astr-a:\n- ذكاء اصطناعي متقدم مع ذاكرة\n- شخصية كيوته رائعة\n- ردود سريعة وذكية\n- أنشأه IHAB - إيهاب \n- اكتب 'كاتلر تعيين' لإعادة تعيين المحادثة." 
    },
    category: "الذكاء AI",
    guide: { 
      ar: "{pn} <رسالتك>\n\nأمثلة:\n  {pn} ما هو القط؟\n  {pn} /كاتلر تعيين (لإعادة تعيين المحادثة)" 
    },
  },

  onStart: async ({ api, args, message, event }) => {
    if (!mistralHistory[event.senderID]) mistralHistory[event.senderID] = [];
    
    // Handle clear command
    if (args[0]?.toLowerCase() === 'كاتلر' && args[1]?.toLowerCase() === 'تعيين') {
      mistralHistory[event.senderID] = [];
      return message.reply("😺| تم مسح سجل محادثة Astr-a بنجاح!");
    }

    if (!args[0]) {
      return message.reply("⚠️ | يرجى إدخال سؤال لطرحه على .\n\n✍🏻| اكتب 'كاتلر تعيين' لإعادة تعيين المحادثة.");
    }

    const query = args.join(" ");
    if (query.length > 1250) return message.reply("❌ | النص الخاص بك طويل جداً. يرجى أن يكون تحت 1250 حرفاً.");

    // Check if the message is about AI's identity
    const identityKeywords = [
      "من انت","ما اسمك","هل انت كاتلر","من انشأك","من صنعك","حدثني عن نفسك","اسمك","مؤسسك","من هو مطورك","من مطورك","صانعك","مطورك",
    ];

    if (identityKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
      return message.reply(
        "• ميـاو 😺 أنا نموذج ASTR-A AI •\n\n " +
 "أنا ذكاء اصطناعي ذكي وجذاب، مصمم لمساعدتك في أي أسئلة " +
 "أنا •• مُنشَأ من قبل ايهاب **، مطور بارع! 😺\n\n" +
 "يمكنني **التفكير والتحدث والمساعدة**—لكنني أيضاً أحب **النوم، مطاردة الفئران الافتراضية، وشرب الحليب**! 🍼🐭\n\n" +
 "• أنا نموذج: Astr-a2.1.1\n" +
 "• المهارات: الإجابة على الأسئلة، البرمجة، الدردشة، كونّي لطيفًا!\n\n" +
 "اكتب 'كاتلر تعيين' لإعادة ضبط محادثتنا."
      );
    }

    try {
      // Format chat history for context-aware responses
      let history = mistralHistory[event.senderID].map(entry => `${entry.role}: ${entry.content}`).join("\n");
      let finalQuery = history ? `السياق:\n${history}\n\nمستخدم: ${query}` : query;

      // Call CAT-X API
      const apiUrl = `https://cat-x-xr1v.onrender.com/catx?q=${encodeURIComponent(finalQuery)}`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.response) {
        return message.reply("❌ | لم يتم استلام استجابة صالحة من Astr-a. قد تكون واجهة البرمجة معطلة.");
      }

      const { response, model, version } = res.data;
      let catxResponse = response;

      // Store conversation history
      mistralHistory[event.senderID].push({ role: 'User', content: query });
      mistralHistory[event.senderID].push({ role: 'ASTR-A', content: catxResponse });

      if (mistralHistory[event.senderID].length > maxStorageMessage) {
        mistralHistory[event.senderID].shift();
      }

      return message.reply({
        body: `🐱 ⌯ كاتلر (${model} v${version})**\n\n${catxResponse}\n\n`,
        attachment: null
      });
    } catch (error) {
      console.error("خطأ في واجهة برمجة تطبيقات Astr-a:", error);
      return message.reply("❌ | فشل في جلب الاستجابة من Astr-a. قد يكون الخادم مشغولاً. يرجى المحاولة لاحقًا.");
    }
  },

  onReply: async ({ api, message, event, Reply, args }) => {
    if (event.senderID !== Reply.author) return;

    // Handle clear command in reply
    if (args[0]?.toLowerCase() === 'كاتلر' && args[1]?.toLowerCase() === 'تعيين') {
      mistralHistory[event.senderID] = [];
      return message.reply("🤖 | تم مسح سجل محادثة Astr-a بنجاح!");
    }

    const query = args.join(" ");
    if (query.length > 1250) return message.reply("❌ | النص الخاص بك طويل جداً. يرجى تقصيره إلى أقل من 1250 حرفاً.");

    // Check if the reply is about AI's identity
    const identityKeywords = [
      "من انت","ما اسمك","هل انت كاتلر","من انشأك","من صنعك","حدثني عن نفسك","اسمك","مؤسسك","من هو مطورك","من مطورك","صانعك","مطورك",
    ];

    if (identityKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
      return message.reply(
        "• ميـاو 😺 أنا نموذج ASTR-A AI •\n\n " +
 "أنا ذكاء اصطناعي ذكي وجذاب، مصمم لمساعدتك في أي أسئلة " +
 "أنا •• مُنشَأ من قبل ايهاب **، مطور بارع! 😺\n\n" +
 "يمكنني **التفكير والتحدث والمساعدة**—لكنني أيضاً أحب **النوم، مطاردة الفئران الافتراضية، وشرب الحليب**! 🍼🐭\n\n" +
 "• أنا نموذج: Astr-a2.1.1\n" +
 "• المهارات: الإجابة على الأسئلة، البرمجة، الدردشة، كونّي لطيفًا!\n\n" +
 "اكتب 'كاتلر تعيين' لإعادة ضبط محادثتنا."
      );
    }

    try {
      // Format chat history for follow-up response
      let history = mistralHistory[event.senderID].map(entry => `${entry.role}: ${entry.content}`).join("\n");
      let finalQuery = history ? `السيا:\n${history}\n\nمستخدم: ${query}` : query;

      // Call CAT-X API
      const apiUrl = `https://cat-x-xr1v.onrender.com/catx?q=${encodeURIComponent(finalQuery)}`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.response) {
        return message.reply("❌ | لم يتم استلام استجابة صالحة من Astr-a. قد تكون واجهة البرمجة معطلة.");
      }

      const { response, model, version } = res.data;
      let catxResponse = response;

      // Store conversation history
      mistralHistory[event.senderID].push({ role: 'مستخدم', content: query });
      mistralHistory[event.senderID].push({ role: 'ASTR-A', content: catxResponse });

      if (mistralHistory[event.senderID].length > maxStorageMessage) {
        mistralHistory[event.senderID].shift();
      }

      return message.reply({
        body: `🐱 ⌯ أسترا(${model} v${version})**\n\n${catxResponse}\n\n`,
        attachment: null
      });
    } catch (error) {
      console.error("خطأ في واجهة برمجة تطبيقات Astr-a.:", error);
      return message.reply("❌ | فشل في الحصول على رد من Astr-a. قد يكون الخادم مشغولاً. يرجى المحاولة لاحقًا.");
    }
  },

  onChat: async ({ event, message }) => {
    // Handle when someone mentions the bot in a chat
    if (event.body && event.body.toLowerCase().includes('🙂')) {
      message.reply("😺| مياو! مرحبًا! اكتب 'كاتلر' متبوعًا بسؤالك للدردشة معي!");
    }
  }
};