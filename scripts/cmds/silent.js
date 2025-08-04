global.botData = global.botData || {};
global.botData.exemptUsers = global.botData.exemptUsers || [
  "1000123456789", // اكتب هنا ID المستخدمين المستثنين
  "1000987654321"
];

module.exports = {
  config: {
    name: "صمت",
    version: "1.6",
    description: "تشغيل/إيقاف مود الصمت مع استثناءات",
    guide: {
      ar: "صمت تشغيل/إيقاف",
    },
    category: "خدمات",
    role: 1,
    author: "Cliff + تعديل محمد"
  },

  onStart: async function ({ message, args, role }) {
    if (!args[0]) {
      return message.reply("❗ استخدم: صمت تشغيل | صمت إيقاف");
    }

    if (role < 1) {
      return message.reply("❌ لا يمكنك تنفيذ هذا الأمر، أنت لست مشرفاً.");
    }

    const command = args[0].toLowerCase();
    if (command === "إيقاف") {
      global.botData.chatEnabled = true;
      return message.reply("✅ تم إيقاف مود الصمت.");
    } else if (command === "تشغيل") {
      global.botData.chatEnabled = false;
      return message.reply("✅ تم تفعيل مود الصمت، سيتم طرد من يتكلم من الأعضاء العاديين.");
    } else {
      return message.reply("⚠️ أمر غير معروف. استخدم: تشغيل أو إيقاف.");
    }
  },

  onChat: async function ({ message, event, api }) {
    const chatEnabled = global.botData.chatEnabled ?? true;
    if (chatEnabled) return;

    const senderID = event.senderID;
    const threadID = event.threadID;

    // لا تطرد البوت نفسه
    if (senderID === api.getCurrentUserID()) return;

    // لا تطرد الأشخاص الموجودين في قائمة الاستثناء
    if (global.botData.exemptUsers.includes(senderID)) return;

    // احصل على معلومات المجموعة
    const threadInfo = await api.getThreadInfo(threadID);
    const participant = threadInfo.adminIDs.find(u => u.id === senderID);

    // لا تطرد المشرفين
    if (participant) return;

    // طرد المستخدم المخالف
    try {
      await api.removeUserFromGroup(senderID, threadID);
      return message.reply(`🚫 تم طرد عضو لتجاوزه الصمت.`);
    } catch (err) {
      console.error("خطأ أثناء محاولة الطرد:", err);
      return message.reply("⚠️ حدث خطأ أثناء محاولة طرد العضو.");
    }
  }
};