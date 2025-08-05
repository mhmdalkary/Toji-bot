const fs = require("fs-extra");
const Canvas = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "مستواي",
    aliases: ["rank", "xp"],
    version: "1.0",
    author: "مطور مطور",
    countDown: 5,
    role: 0,
    shortDescription: "عرض مستواك في المجموعة",
    longDescription: "يعرض ترتيبك، مستواك، ونقاط الخبرة في المجموعة",
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
      const userLevel = Math.floor(0.1 * Math.sqrt(userXp));
      const currentLevelXp = Math.floor(Math.pow(userLevel / 0.1, 2));
      const nextLevelXp = Math.floor(Math.pow((userLevel + 1) / 0.1, 2));
      const progress = ((userXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

      // جلب جميع المستخدمين في المجموعة
      const allThreadData = await threadsData.get(threadID);
      const memberIDs = allThreadData.members || [];

      // جلب بيانات جميع الأعضاء
      const allUsersData = await Promise.all(memberIDs.map(uid => usersData.get(uid)));
      const rankedUsers = allUsersData
        .filter(user => user && typeof user.exp === "number")
        .sort((a, b) => b.exp - a.exp);

      const userRank = rankedUsers.findIndex(user => user.id == userID) + 1;

      // إنشاء صورة الرتبة
      const canvas = Canvas.createCanvas(800, 250);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#23272A";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "30px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`الاسم: ${userData.name}`, 50, 60);
      ctx.fillText(`الرتبة: ${userRank} / ${rankedUsers.length}`, 50, 110);
      ctx.fillText(`المستوى: ${userLevel}`, 50, 160);
      ctx.fillText(`الخبرة: ${userXp} XP`, 50, 210);

      // شريط التقدم
      const barWidth = 600;
      const barHeight = 25;
      const x = 150;
      const y = 200;
      ctx.fillStyle = "#555";
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.fillStyle = "#00ff99";
      ctx.fillRect(x, y, (barWidth * progress) / 100, barHeight);

      // حفظ الصورة مؤقتًا
      const filePath = path.join(__dirname, "tmp", `${userID}_rank.png`);
      await fs.ensureDir(path.dirname(filePath));
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      // إرسال الرد
      message.reply({
        body: `🎖 | مستواك الحالي في المجموعة`,
        attachment: fs.createReadStream(filePath)
      }, () => fs.unlinkSync(filePath));
    } catch (err) {
      console.error(err);
      message.reply("❌ | حدث خطأ أثناء تنفيذ أمر مستواك.");
    }
  }
};
