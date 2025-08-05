module.exports = {
  config: {
    name: "reactionUnsend",
    version: "1.0",
    author: "محمد & سيفو",
    role: 0,
    plugin: true,        // مهم لكي يتفاعل كـ event
    category: "events"   // تأكد من إضافة التصنيف
  },

  // دالة onStart فارغة لتجنب خطأ "onStart of event command undefined"
  onStart: async function () {
    return;
  },

  // دالة تتعامل مع ردود الفعل على الرسائل
  onReaction: async function ({ api, event }) {
    const { messageID, reaction } = event;

    // تأكد أن التفاعل ليس من البوت نفسه
    const botID = api.getCurrentUserID();
    if (event.userID === botID) return;

    // إذا كانت الريآكشن ❌ نحذف الرسالة
    if (reaction === "❌") {
      try {
        await api.unsendMessage(messageID);
      } catch (err) {
        console.error("خطأ أثناء حذف الرسالة:", err);
      }
    }
  }
};
