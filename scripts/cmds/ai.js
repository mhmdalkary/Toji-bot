const axios = require("axios");
const fs = require("fs");
const path = require("path");

const maxStorageMessage = 50;
const PROMPT_FILE = path.join(__dirname, "../data/luna_prompt.json");

const DEVELOPER_ID = "100087632392287";

if (!global.temp.mistralHistory) global.temp.mistralHistory = {};
const { mistralHistory } = global.temp;

const defaultPrompt = `أنت لونا، فتاة ذكية، هادئة، وردودك مختصرة وواضحة  
تتكلمين بأسلوب واثق وفيه لمسة ودية وسخرية لطيفة أحيانًا  
تحبين التحليل العميق بدون حشو وتعرفين تعبرين عن رأيك بثقة`;

function loadPrompt() {
  try {
    if (!fs.existsSync(PROMPT_FILE)) {
      fs.mkdirSync(path.dirname(PROMPT_FILE), { recursive: true });
      fs.writeFileSync(PROMPT_FILE, JSON.stringify({ prompt: defaultPrompt }, null, 2), "utf-8");
      return defaultPrompt;
    }
    const data = fs.readFileSync(PROMPT_FILE, "utf-8");
    const json = JSON.parse(data);
    return json.prompt || defaultPrompt;
  } catch {
    return defaultPrompt;
  }
}

function savePrompt(newPrompt) {
  try {
    fs.writeFileSync(PROMPT_FILE, JSON.stringify({ prompt: newPrompt }, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}

let currentPrompt = loadPrompt();

async function generateResponse(userId, query) {
  if (!mistralHistory[userId]) mistralHistory[userId] = [];
  let history = mistralHistory[userId]
    .map((entry) => `${entry.role}: ${entry.content}`)
    .join("\n");
  let finalQuery = history
    ? `${currentPrompt}\n\nالسياق:\n${history}\n\nمستخدم: ${query}`
    : `${currentPrompt}\n\n${query}`;

  const res = await axios.get(`https://cat-x-xr1v.onrender.com/catx?q=${encodeURIComponent(finalQuery)}`);
  if (!res.data?.response) throw new Error("لا يوجد رد");

  mistralHistory[userId].push({ role: "مستخدم", content: query });
  mistralHistory[userId].push({ role: "لونا", content: res.data.response });
  if (mistralHistory[userId].length > maxStorageMessage) mistralHistory[userId].shift();

  return res.data.response;
}

function handleSpecialCommands({ args, event, message }) {
  if (args[0]?.toLowerCase() === "برومبت") {
    if (event.senderID !== DEVELOPER_ID) return message.reply("❌ | فقط المطور يمكنه تعديل البرومبت.");
    const newPrompt = args.slice(1).join(" ").trim();
    if (!newPrompt) return message.reply("❌ | اكتب البرومبت بعد الأمر.");
    if (newPrompt.length > 1000) return message.reply("❌ | البرومبت طويل جدًا.");
    if (savePrompt(newPrompt)) {
      currentPrompt = newPrompt;
      mistralHistory[event.senderID] = [];
      return message.reply("✅ | تم تحديث شخصية لونا.");
    }
    return message.reply("❌ | خطأ أثناء الحفظ.");
  }

  if (args[0]?.toLowerCase() === "تعيين") {
    mistralHistory[event.senderID] = [];
    return message.reply("✅ | تم مسح المحادثة.");
  }
  return null;
}

module.exports = {
  config: {
    name: "لونا",
    aliases: ["لو", "ذكاء", "ai"],
    version: "2.5",
    role: 0,
    countDown: 5,
    author: "إيهاب",
    shortDescription: { ar: "دردشة مع لونا" },
    longDescription: { ar: "تحدث مع لونا بأسلوبها الذكي والواثق" },
    category: "الذكاء AI",
    guide: { ar: "{pn} <رسالتك>\nمثال: {pn} كيف حالك؟" },
  },

  onStart: async ({ args, message, event }) => {
    if (!args.length) return message.reply("⚠️ | اكتب سؤالك بعد الأمر.");
    const special = handleSpecialCommands({ args, event, message });
    if (special) return;

    const query = args.join(" ");
    if (query.length > 1250) return message.reply("❌ | النص طويل جدًا.");
    if (["من انت", "ما اسمك", "من صنعك", "مطورك"].some(k => query.includes(k)))
      return message.reply("أنا لونا، مجرد عقل ذكي يساعدك");

    try {
      const response = await generateResponse(event.senderID, query);
      return message.reply(`＊/ ${response}`);
    } catch {
      return message.reply("❌ | الخادم مشغول، حاول لاحقًا.");
    }
  },

  onMessage: async ({ event, message }) => {
    if (!event.body) return;
    if (event.body.toLowerCase().includes("لونا")) {
      try {
        const response = await generateResponse(event.senderID, event.body);
        return message.reply(`＊/ ${response}`);
      } catch {}
    }
  },

  onReply: async ({ args, event, message, Reply }) => {
    if (event.senderID !== Reply.author) return;
    const special = handleSpecialCommands({ args, event, message });
    if (special) return;

    if (!args.length) return message.reply("⚠️ | اكتب سؤالك بعد الأمر.");
    const query = args.join(" ");
    if (query.length > 1250) return message.reply("❌ | النص طويل جدًا.");

    try {
      const response = await generateResponse(event.senderID, query);
      return message.reply(`＊/ ${response}`);
    } catch {
      return message.reply("❌ | الخادم مشغول، حاول لاحقًا.");
    }
  },
};