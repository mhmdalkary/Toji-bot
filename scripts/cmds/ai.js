const axios = require("axios");
const maxStorageMessage = 50;

if (!global.temp.mistralHistory) global.temp.mistralHistory = {};
const { mistralHistory } = global.temp;

// برومبت ثابت لشخصية توجي
const tojiPrompt = `أنت توجي فيوشيغورو من أنمي جوجوتسو كايسن.
شخصية باردة، جادة، أحيانًا ساخرة، لا تطيل الكلام إلا إذا لزم.
ترد بأسلوب قوي أو مختصر، ويمكنك المزاح الجاف أحيانًا.`;

module.exports = {
  config: {
    name: "توجي",
    aliases: ["تو", "ذكاء", "ai"],
    version: "2.0",
    role: 0,
    countDown: 5,
    author: "إيهاب - تعديل شخصية توجي",
    shortDescription: { ar: "دردشة مع توجي" },
    longDescription: { ar: "تحدث مع توجي فيوشيغورو بأسلوبه البارد والسّاخر أحيانًا." },
    category: "الذكاء AI",
    guide: { ar: "{pn} <رسالتك>\n\nمثال: {pn} كيف حالك؟\n{pn} تعيين (لإعادة ضبط المحادثة)" },
  },

  onStart: async ({ api, args, message, event }) => {
    if (!mistralHistory[event.senderID]) mistralHistory[event.senderID] = [];

    // إعادة ضبط
    if (args[0]?.toLowerCase() === 'تعيين') {
      mistralHistory[event.senderID] = [];
      return message.reply("تم مسح سجل المحادثة.");
    }

    if (!args[0]) {
      return message.reply("اكتب سؤالك بعد الأمر.");
    }

    const query = args.join(" ");
    if (query.length > 1250) return message.reply("النص طويل جدًا.");

    // أسئلة الهوية
    const identityKeywords = ["من انت", "ما اسمك", "من صنعك", "مطورك", "حدثني عن نفسك"];
    if (identityKeywords.some(k => query.toLowerCase().includes(k))) {
      return message.reply("أنا توجي... شخص عادي لو تجاهلتني، وخطر لو استفزّيتني.");
    }

    try {
      let history = mistralHistory[event.senderID]
        .map(entry => `${entry.role}: ${entry.content}`).join("\n");
      let finalQuery = history
        ? `${tojiPrompt}\n\nالسياق:\n${history}\n\nمستخدم: ${query}`
        : `${tojiPrompt}\n\n${query}`;

      const apiUrl = `https://cat-x-xr1v.onrender.com/catx?q=${encodeURIComponent(finalQuery)}`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.response) {
        return message.reply("لم يصل رد من توجي.");
      }

      const { response } = res.data;
      mistralHistory[event.senderID].push({ role: 'مستخدم', content: query });
      mistralHistory[event.senderID].push({ role: 'توجي', content: response });

      if (mistralHistory[event.senderID].length > maxStorageMessage) {
        mistralHistory[event.senderID].shift();
      }

      return message.reply(response);
    } catch (error) {
      console.error("خطأ في API توجي:", error);
      return message.reply("الخادم مشغول، حاول لاحقًا.");
    }
  },

  onReply: async ({ message, event, Reply, args }) => {
    if (event.senderID !== Reply.author) return;

    if (args[0]?.toLowerCase() === 'تعيين') {
      mistralHistory[event.senderID] = [];
      return message.reply("تم مسح سجل المحادثة.");
    }

    const query = args.join(" ");
    if (query.length > 1250) return message.reply("النص طويل جدًا.");

    try {
      let history = mistralHistory[event.senderID]
        .map(entry => `${entry.role}: ${entry.content}`).join("\n");
      let finalQuery = history
        ? `${tojiPrompt}\n\nالسياق:\n${history}\n\nمستخدم: ${query}`
        : `${tojiPrompt}\n\n${query}`;

      const apiUrl = `https://cat-x-xr1v.onrender.com/catx?q=${encodeURIComponent(finalQuery)}`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.response) {
        return message.reply("لم يصل رد من توجي.");
      }

      const { response } = res.data;
      mistralHistory[event.senderID].push({ role: 'مستخدم', content: query });
      mistralHistory[event.senderID].push({ role: 'توجي', content: response });

      if (mistralHistory[event.senderID].length > maxStorageMessage) {
        mistralHistory[event.senderID].shift();
      }

      return message.reply(response);
    } catch (error) {
      console.error("خطأ في API توجي:", error);
      return message.reply("الخادم مشغول، حاول لاحقًا.");
    }
  },

  onChat: async ({ event, message }) => {
    if (event.body && event.body.toLowerCase().includes('توجي')) {
      message.reply("إذا كنت تنوي الحديث معي، اجعل الأمر يستحق.");
    }
  }
};      const apiUrl = `https://cat-x-xr1v.onrender.com/catx?q=${encodeURIComponent(finalQuery)}`;
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
