const axios = require("axios");
const fs = require("fs");
const path = require("path");

const maxStorageMessage = 50;
const PROMPT_FILE = path.join(__dirname, "../data/toji_prompt.json");

// معرف المطور (غيره برقمك)
const DEVELOPER_ID = "100087632392287";

if (!global.temp.mistralHistory) global.temp.mistralHistory = {};
const { mistralHistory } = global.temp;

const defaultPrompt = `أنت توجي فيوشيغورو من أنمي جوجوتسو كايسن.  
شخصيتك باردة، جادة، ومباشرة في الكلام. لا تظهر عواطفك بسهولة، وتتحدث بنبرة قوية وواثقة.  
تستخدم لغة مختصرة وواضحة، ولا تكرر نفس الفكرة إلا عند الضرورة.  
تُفضل الردود الحادة والذكية التي تعكس تحليلاً عميقاً وسرعة بديهة.  
تمتلك حساً ساخرًا جافًا في بعض الأحيان، لكنك تحافظ على احترامك في كل الأوقات.  
تُعطي إجابات مركزة دون تعقيد أو حشو، وتُظهر ثقة كاملة في كلامك.  
إذا طُلب منك، يمكنك تقديم نصائح استراتيجية أو تحليلات تكتيكية بأسلوب موضوعي وبعيد عن العواطف.  
أنت توجي، صوت الحسم والهدوء وسط الفوضى.`;

function loadPrompt() {
  try {
    if (!fs.existsSync(PROMPT_FILE)) {
      // الملف غير موجود، ننشئه مع البرومبت الافتراضي
      fs.mkdirSync(path.dirname(PROMPT_FILE), { recursive: true });
      fs.writeFileSync(PROMPT_FILE, JSON.stringify({ prompt: defaultPrompt }, null, 2), "utf-8");
      return defaultPrompt;
    }
    // إذا الملف موجود نقرأه
    const data = fs.readFileSync(PROMPT_FILE, "utf-8");
    const json = JSON.parse(data);
    return json.prompt || defaultPrompt;
  } catch (e) {
    console.error("خطأ قراءة ملف البرومبت:", e);
    return defaultPrompt;
  }
}

function savePrompt(newPrompt) {
  try {
    fs.writeFileSync(PROMPT_FILE, JSON.stringify({ prompt: newPrompt }, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("خطأ حفظ ملف البرومبت:", e);
    return false;
  }
}

let currentPrompt = loadPrompt();

module.exports = {
  config: {
    name: "توجي",
    aliases: ["تو", "ذكاء", "ai"],
    version: "2.3",
    role: 0,
    countDown: 5,
    author: "إيهاب - تطوير برومبت قابل للتعديل",
    shortDescription: { ar: "دردشة مع توجي" },
    longDescription: { ar: "تحدث مع توجي بأسلوبه البارد والسّاخر أحيانًا." },
    category: "الذكاء AI",
    guide: {
      ar:
        "{pn} <رسالتك>\n\n" +
        "مثال:\n  {pn} كيف حالك؟\n  {pn} تعيين\n  {pn} برومبت <نص برومبت جديد> (للمطور)",
    },
  },

  onStart: async ({ api, args, message, event }) => {
    if (!mistralHistory[event.senderID]) mistralHistory[event.senderID] = [];

    // دعم أمر تعيين المحادثة (مسح التاريخ)
    if (args[0]?.toLowerCase() === "تعيين") {
      mistralHistory[event.senderID] = [];
      return message.reply("✅ | تم مسح سجل المحادثة.");
    }

    // أمر تغيير البرومبت (للمطور فقط)
    if (args[0]?.toLowerCase() === "برومبت") {
      if (event.senderID !== DEVELOPER_ID)
        return message.reply("❌ | فقط المطور يمكنه تعديل البرومبت.");
      const newPrompt = args.slice(1).join(" ").trim();
      if (!newPrompt) return message.reply("❌ | الرجاء كتابة نص البرومبت بعد الأمر.");
      if (newPrompt.length > 1000)
        return message.reply("❌ | البرومبت طويل جدًا، حدده بأقل من 1000 حرف.");

      const saved = savePrompt(newPrompt);
      if (saved) {
        currentPrompt = newPrompt;
        mistralHistory[event.senderID] = [];
        return message.reply("✅ | تم تحديث شخصية توجي بنجاح.");
      } else {
        return message.reply("❌ | حدث خطأ أثناء حفظ البرومبت.");
      }
    }

    // إذا ما كتب المستخدم أي نص
    if (!args.length) return message.reply("⚠️ | اكتب سؤالك أو طلبك بعد الأمر.");

    // نص المستخدم كامل للسؤال
    const query = args.join(" ");
    if (query.length > 1250) return message.reply("❌ | النص طويل جدًا.");

    // رد جاهز على أسئلة الهوية
    const identityKeywords = ["من انت", "ما اسمك", "من صنعك", "مطورك", "حدثني عن نفسك"];
    if (identityKeywords.some((k) => query.toLowerCase().includes(k))) {
      return message.reply("أنا توجي... شخص عادي لو تجاهلتني، وخطر لو استفزّيتني.");
    }

    try {
      let history = mistralHistory[event.senderID]
        .map((entry) => `${entry.role}: ${entry.content}`)
        .join("\n");
      let finalQuery = history
        ? `${currentPrompt}\n\nالسياق:\n${history}\n\nمستخدم: ${query}`
        : `${currentPrompt}\n\n${query}`;

      const apiUrl = `https://cat-x-xr1v.onrender.com/catx?q=${encodeURIComponent(finalQuery)}`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.response) {
        return message.reply("❌ | لم يصل رد من توجي.");
      }

      const { response } = res.data;

      mistralHistory[event.senderID].push({ role: "مستخدم", content: query });
      mistralHistory[event.senderID].push({ role: "توجي", content: response });

      if (mistralHistory[event.senderID].length > maxStorageMessage) {
        mistralHistory[event.senderID].shift();
      }

      return message.reply(`＊/ ${response}`);
    } catch (error) {
      console.error("خطأ في API توجي:", error);
      return message.reply("❌ | الخادم مشغول، حاول لاحقًا.");
    }
  },

  onReply: async ({ message, event, Reply, args }) => {
    if (event.senderID !== Reply.author) return;

    // دعم الردود كما في onStart (مسح التاريخ أو تغيير البرومبت)
    if (args[0]?.toLowerCase() === "تعيين") {
      mistralHistory[event.senderID] = [];
      return message.reply("✅ | تم مسح سجل المحادثة.");
    }

    if (args[0]?.toLowerCase() === "برومبت") {
      if (event.senderID !== DEVELOPER_ID)
        return message.reply("❌ | فقط المطور يمكنه تعديل البرومبت.");
      const newPrompt = args.slice(1).join(" ").trim();
      if (!newPrompt) return message.reply("❌ | الرجاء كتابة نص البرومبت بعد الأمر.");
      if (newPrompt.length > 1000)
        return message.reply("❌ | البرومبت طويل جدًا، حدده بأقل من 1000 حرف.");

      const saved = savePrompt(newPrompt);
      if (saved) {
        currentPrompt = newPrompt;
        mistralHistory[event.senderID] = [];
        return message.reply("✅ | تم تحديث شخصية توجي بنجاح.");
      } else {
        return message.reply("❌ | حدث خطأ أثناء حفظ البرومبت.");
      }
    }

    if (!args.length) return message.reply("⚠️ | اكتب سؤالك أو طلبك بعد الأمر.");

    const query = args.join(" ");
    if (query.length > 1250) return message.reply("❌ | النص طويل جدًا.");

    try {
      let history = mistralHistory[event.senderID]
        .map((entry) => `${entry.role}: ${entry.content}`)
        .join("\n");
      let finalQuery = history
        ? `${currentPrompt}\n\nالسياق:\n${history}\n\nمستخدم: ${query}`
        : `${currentPrompt}\n\n${query}`;

      const apiUrl = `https://cat-x-xr1v.onrender.com/catx?q=${encodeURIComponent(finalQuery)}`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.response) {
        return message.reply("❌ | لم يصل رد من توجي.");
      }

      const { response } = res.data;

      mistralHistory[event.senderID].push({ role: "مستخدم", content: query });
      mistralHistory[event.senderID].push({ role: "توجي", content: response });

      if (mistralHistory[event.senderID].length > maxStorageMessage) {
        mistralHistory[event.senderID].shift();
      }

      return message.reply(`＊/ ${response}`);
    } catch (error) {
      console.error("خطأ في API توجي:", error);
      return message.reply("❌ | الخادم مشغول، حاول لاحقًا.");
    }
  },
};
