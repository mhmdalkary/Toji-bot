const axios = require('axios');
let autoReact = "on";

module.exports = {
  config: {
    name: "تفاعل_تلقائي",
    aliases: [], 
    version: "1.0",
    hasPermission: 2, 
    role: 0, 
    author: "LiANE", 
    credits: "LiANE", 
    description: "خاص بالنظام يقوم بجعل البوت يتفاعل مع الاعضاء", 
    shortDescription: "يقوم بجعل البوت يتفاعل مع الاعضاء تلقائيا", 
    longDescription: "يقوم بجعل البوت بتفاعل مع المجموعة بإيموجي حسب محتوى النص", 
    usePrefix: true, 
    category: "إدارة البوت",  
    usages: "Wala", 
    guide: "تشغيل/إيقاف", 
    cooldowns: 5, 
    countDown: 5 
  },

  onMAIN: async ({ api, event }, botType) => {
    const [cmd, ...args] = event.body.split(" ");

    if (args[0] === "status") {
      // يمكن إضافة رد معين لو تحب
    } else if (args[0] === "تشغيل") {
      autoReact = "نشط";
    } else if (args[0] === "إيقاف") {
      autoReact = "معطل";
    } else {
      if (autoReact === "On") {
        autoReact = "Off";
      } else if (autoReact === "Off") { 
        autoReact = "On";
      }
    }

    await api.sendMessage(`✨ |  تفاعل تلقائي من أجل : ${botType}

✅ | التفاعل التلقائي مع رسائل الأعضاء حسب محتوى الرسالة
🎉
الحالة : ${autoReact}`, event.threadID);
  },

  onStart: async (context) => {
    const botType = "توجي البوت";
    await module.exports.onMAIN(context, botType); 
  },

  run: async (context) => {
    const botType = "Botpack / Mirai";
    await module.exports.onMAIN(context, botType); 
  },

  onChat: async (context) => { 
    const { api, event } = context;
    if (autoReact === "Off") {
      return;
    }

    // احتمال 70% للتفاعل مع الرسالة
    if (Math.random() < 0.9) {
      try {
        const response = await axios.get(`https://school-project-lianefca.bene-edu-ph.repl.co/autoreact?query=${encodeURIComponent(event.body)}`);
        const emoji = response.data.message;
        api.setMessageReaction(emoji, event.messageID, () => {}, true);
      } catch (e) {
        console.error("خطأ في جلب التفاعل:", e.message);
      }
    }
  }, 

  handleEvent: async (context) => {
    await module.exports.onChat(context);
  },
};
