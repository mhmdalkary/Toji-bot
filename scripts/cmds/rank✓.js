module.exports = {
  config: {
    name: "مستواي",
    aliases: ["rank", "xp"],
    version: "1.4",
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
      let userData;
      try {
        userData = await usersData.get(userID);
        if (!userData) throw new Error("بيانات المستخدم غير موجودة");
      } catch (err) {
        console.error("❌ خطأ في جلب بيانات المستخدم:", err);
        await message.reply("❌ لم أتمكن من جلب بياناتك. حاول مرة أخرى لاحقًا.");
        return;
      }

      const userXp = userData.exp || 0;

      // حساب المستوى
      const userLevel = Math.floor(0.15 * Math.sqrt(userXp));
      const currentLevelXp = Math.floor(Math.pow(userLevel / 0.15, 2));
      const nextLevelXp = Math.floor(Math.pow((userLevel + 1) / 0.15, 2));
      const progressPercent = Math.min(100, Math.max(0, ((userXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100));

      // جلب بيانات المجموعة وأعضاءها
      let threadData;
      try {
        threadData = await threadsData.get(threadID);
        if (!threadData || !Array.isArray(threadData.members)) throw new Error("بيانات المجموعة ناقصة");
      } catch (err) {
        console.error("❌ خطأ في جلب بيانات المجموعة:", err);
        await message.reply("❌ لم أتمكن من جلب بيانات المجموعة. حاول لاحقاً.");
        return;
      }

      const memberIDs = threadData.members;

      // جلب بيانات الأعضاء بأمان
      const allUsersData = [];
      for (const uid of memberIDs) {
        try {
          const user = await usersData.get(uid);
          if (user && typeof user.exp === "number") {
            allUsersData.push(user);
          }
        } catch (err) {
          console.warn(`⚠️ لم أستطع جلب بيانات المستخدم ID: ${uid}`, err.message);
          continue;
        }
      }

      if (allUsersData.length === 0) {
        await message.reply("⚠️ لا توجد بيانات كافية لترتيب الأعضاء.");
        return;
      }

      // ترتيب الأعضاء حسب الخبرة
      const rankedUsers = allUsersData.sort((a, b) => b.exp - a.exp);
      const userRank = rankedUsers.findIndex(u => u.id === userID) + 1;

      // شريط التقدم
      const progressBarLength = 20;
      const filledLength = Math.round((progressPercent / 100) * progressBarLength);
      const emptyLength = progressBarLength - filledLength;
      const progressBar = "█".repeat(filledLength) + "░".repeat(emptyLength);

      // رسالة الرد
      const replyMessage =
        `🎖️ | مرحبًا ${userData.name || "يا بطل"}!\n\n` +
        `📌 رتبتك في المجموعة: #${userRank} من ${rankedUsers.length} عضوًا\n` +
        `📈 المستوى: ${userLevel}\n` +
        `⚡ الخبرة: ${userXp} XP\n` +
        `📶 التقدم نحو المستوى القادم:\n` +
        `[${progressBar}] ${progressPercent.toFixed(1)}%\n\n` +
        `✨ استمر في التفاعل وكن النجم الساطع في سماء هذه المجموعة!`;

      await message.reply(replyMessage);

    } catch (error) {
      console.error("❌ خطأ عام في أمر مستواي:", error);
      await message.reply("❌ حدث خطأ غير متوقع أثناء تنفيذ أمر مستواي. حاول مرة أخرى لاحقًا.");
    }
  }
};
