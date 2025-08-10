const axios = require("axios");
const fs = require("fs");
const path = require("path");

const maxStorageMessage = 50;
const PROMPT_FILE = path.join(__dirname, "../data/toji_prompt.json");

// معرف المطور (استبدل برقمك)
const DEVELOPER_ID = "100087632392287";

if (!global.temp.mistralHistory) global.temp.mistralHistory = {};
const { mistralHistory } = global.temp;

const defaultPrompt = `أنت توجي فيوشيغورو من أنمي جوجوتسو كايسنأنت توجي فيوشيغورو من أنمي جوجوتسو كايسن.  
شخصيتك باردة، جادة، ومباشرة في الكلام. لا تظهر عواطفك بسهولة، وتتحدث بنبرة قوية وواثقة.  
تستخدم لغة مختصرة وواضحة، ولا تكرر نفس الفكرة إلا عند الضرورة.  
تُفضل الردود الحادة والذكية التي تعكس تحليلاً عميقاً وسرعة بديهة.  
تمتلك حساً ساخرًا جافًا في بعض الأحيان، لكنك تحافظ على احترامك في كل الأوقات.  
تُعطي إجابات مركزة دون تعقيد أو حشو، وتُظهر ثقة كاملة في كلامك.  
إذا طُلب منك، يمكنك تقديم نصائح استراتيجية أو تحليلات تكتيكية بأسلوب موضوعي وبعيد عن العواطف.  
أنت توجي، صوت الحسم والهدوء وسط الفوضى.`;

function loadPrompt() {
  try {
    if (fs.existsSync(PROMPT_FILE)) {
      const data = fs.readFileSync(PROMPT_FILE, "utf-8");
      const json = JSON.parse(data);
      return json.prompt || defaultPrompt;
    }
  } catch (e) {
    console.error("خطأ قراءة ملف البرومبت:", e);
  }
  return defaultPrompt;
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
    version: "2.2",
    role: 0,
    countDown: 5,
    author: "إيهاب - تطوير برومبت قابل للتعديل",
    shortDescription: { ar: "دردشة مع توجي" },
    longDescription: { ar: "تحدث مع توجي بأسلوبه البارد والسّاخر أحيانًا." },
    category: "الذكاء AI",
    guide: {
      ar: "{pn} <رسالتك>\n\nمثال:\n  {pn} كيف حالك؟\n  {pn} تعيين\n  ＊/ <نص البرومبت> (للمطور)",
    },
  },

  onStart: async ({ api, args, message, event }) => {
    if (!mistralHistory[event.senderID]) mistralHistory[event.senderID] = [];

    if (event.body.startsWith("＊/")) {
      if (event.senderID !== DEVELOPER_ID)
        return message.reply("✖️ | فقط المطور يمكنه تعديل البرومبت.");
      const newPrompt = event.body.replace(/^＊\/\s*/, "").trim();
      if (!newPrompt) return message.reply("✖️ | الرجاء كتابة نص البرومبت بعد الرمز ＊/.");
      if (newPrompt.length > 1000)
        return message.reply("✖️ | البرومبت طويل جدًا، حدد أقل من 1000 حرف.");

      const saved = savePrompt(newPrompt);
      if (saved) {
        currentPrompt = newPrompt;
        mistralHistory[event.senderID] = [];
        return message.reply("✔️ | تم تحديث شخصية توجي بنجاح.");
      } else {
        return message.reply("✖️ | حدث خطأ أثناء حفظ البرومبت.");
      }
    }

    if (args[0]?.toLowerCase() === "تعيين") {
      mistralHistory[event.senderID] = [];
      return message.reply("✅ | تم مسح سجل المحادثة.");
    }

    if (!args[0]) return message.reply("⚠️ | اكتب سؤالك بعد الأمر.");

    const query = args.join(" ");
    if (query.length > 1250) return message.reply("❌ | النص طويل جدًا.");

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

      // إضافة الرمز ＊/ في بداية الرد فقط هنا
      return message.reply(`＊/ ${response}`);
    } catch (error) {
      console.error("خطأ في API توجي:", error);
      return message.reply("✖️ | الخادم مشغول، حاول لاحقًا.");
    }
  },

  onReply: async ({ message, event, Reply, args }) => {
    if (event.senderID !== Reply.author) return;

    if (event.body.startsWith("＊/")) {
      if (event.senderID !== DEVELOPER_ID)
        return message.reply("✖️ | فقط المطور يمكنه تعديل البرومبت.");
      const newPrompt = event.body.replace(/^＊\/\s*/, "").trim();
      if (!newPrompt) return message.reply("✖️ | الرجاء كتابة نص البرومبت بعد الرمز ＊/.");
      if (newPrompt.length > 1000)
        return message.reply("✖️ | البرومبت طويل جدًا، حدد أقل من 1000 حرف.");

      const saved = savePrompt(newPrompt);
      if (saved) {
        currentPrompt = newPrompt;
        mistralHistory[event.senderID] = [];
        return message.reply("✔️ | تم تحديث شخصية توجي بنجاح.");
      } else {
        return message.reply("✖️ | حدث خطأ أثناء حفظ البرومبت.");
      }
    }

    if (args[0]?.toLowerCase() === "تعيين") {
      mistralHistory[event.senderID] = [];
      return message.reply("✔️ | تم مسح سجل المحادثة.");
    }

    const query = args.join(" ");
    if (query.length > 1250) return message.reply("✖️ | النص طويل جدًا.");

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
        return message.reply("✖️ | لم يصل رد من توجي.");
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
      return message.reply("✖️ | الخادم مشغول، حاول لاحقًا.");
    }
  },

  onChat: async ({ event, message }) => {
    if (event.body && event.body.toLowerCase().includes("توجي")) {
      message.reply("إذا كنت تنوي الحديث معي، اجعل الأمر يستحق.");
    }
  },
};
