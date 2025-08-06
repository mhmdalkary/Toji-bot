module.exports = {
  config: {
    name: "مستواي",
    aliases: ["rank", "xp"],
    version: "1.2",
    author: "محمد حسن",
    countDown: 5,
    role: 0,
    shortDescription: "عرض مستواك في المجموعة",
    longDescription: "يعرض ترتيبك، مستواك، ونقاط الخبرة في المجموعة بشكل نصي",
    category: "العاب",
    guide: "{pn}"
  },

  onStart: async function ({ message, event, usersData, threadsData }) {
    try {
      const userID = event.senderID;
      const threadID = event.threadID;

      // جلب بيانات المستخدم
      const userData = await usersData.get(userID);
      const userXp = userData.exp || 0;

      // حساب المستوى بطريقة واقعية
      const userLevel = Math.floor(0.15 * Math.sqrt(userXp));
      const currentLevelXp = Math.floor(Math.pow(userLevel / 0.15, 2));
      const nextLevelXp = Math.floor(Math.pow((userLevel + 1) / 0.15, 2));
      const progressPercent = Math.min(100, Math.max(0, ((userXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100));

      // جلب بيانات جميع أعضاء المجموعة وترتيبهم حسب الخبرة
      const threadData = await threadsData.get(threadID);
      const memberIDs = threadData.members || [];

      const allUsersData = await Promise.all(memberIDs.map(uid => usersData.get(uid)));
      const rankedUsers = allUsersData
        .filter(u => u && typeof u.exp === "number")
        .sort((a, b) => b.exp - a.exp);

      const userRank = rankedUsers.findIndex(u => u.id === userID) + 1;

      // بناء رسالة نصية لطيفة ومرتبة
      const progressBarLength = 20;
      const filledLength = Math.round((progressPercent / 100) * progressBarLength);
      const emptyLength = progressBarLength - filledLength;
      const progressBar = "█".repeat(filledLength) + "░".repeat(emptyLength);

      // رسالة المستوى
      const replyMessage =
        `🎖️ مرحبًا ${userData.name || "يا بطل"}!\n` +
        `📊 ترتيبك في المجموعة: #${userRank} من ${rankedUsers.length}\n` +
        `🌟 مستواك الحالي: ${userLevel}\n` +
        `✨ خبرتك: ${userXp} XP\n` +
        `🔋 تقدمك نحو المستوى القادم:\n` +
        `[${progressBar}] ${progressPercent.toFixed(1)}%\n\n` +
        `تابع تقدمك ولا تستسلم، فالطريق أمامك طويل ومليء بالتحديات! 🚀`;

      // إرسال الرسالة
      await message.reply(replyMessage);

    } catch (error) {
      console.error("خطأ في أمر مستواي:", error);
      await message.reply("❌ حدث خطأ أثناء تنفيذ أمر مستواي. حاول مرة أخرى لاحقًا.");
    }
  }
};
