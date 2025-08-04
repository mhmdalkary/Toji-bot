const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "مستواي",
    aliases: ["rank", "xp"],
    version: "1.1",
    author: "تعديل: محمد حسن",
    countDown: 5,
    role: 0,
    shortDescription: "عرض مستواك",
    longDescription: "يعرض بطاقة تحتوي على مستواك، XP، والترتيب داخل المجموعة",
    category: "مستوى",
    guide: "{pn}"
  },

  onStart: async function ({ event, usersData, message }) {
    const uid = event.senderID;
    const userData = await usersData.get(uid);
    const allUsersRaw = await usersData.getAll(["exp", "level"]);

    // تصفية المستخدمين الذين لديهم XP
    const allUsers = Object.entries(allUsersRaw)
      .filter(([_, data]) => data?.exp !== undefined)
      .map(([userID, data]) => ({
        userID,
        exp: data.exp || 0,
        level: data.level || 1
      }));

    // ترتيب المستخدمين حسب XP
    allUsers.sort((a, b) => b.exp - a.exp);

    const rank = allUsers.findIndex(u => u.userID === uid) + 1;
    const { exp = 0, level = 1 } = userData;

    const nextLevelXP = level * 500;
    const currentXP = exp;
    const percent = Math.min(currentXP / nextLevelXP, 1);

    // إنشاء البطاقة
    const width = 700, height = 220;
    const canvas = Canvas.createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // خلفية
    ctx.fillStyle = "#1e1e2f";
    ctx.fillRect(0, 0, width, height);

    // شريط التقدم
    ctx.fillStyle = "#444";
    ctx.fillRect(50, 160, 600, 25);

    ctx.fillStyle = "#00ff99";
    ctx.fillRect(50, 160, 600 * percent, 25);

    // نصوص
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px Arial";
    ctx.fillText(`المستوى: ${level}`, 50, 50);
    ctx.fillText(`الترتيب: #${rank}`, 50, 85);
    ctx.fillText(`XP: ${currentXP} / ${nextLevelXP}`, 50, 125);

    // صورة الملف الشخصي
    try {
      const avatarURL = `https://graph.facebook.com/${uid}/picture?width=150&height=150`;
      const avatar = await Canvas.loadImage(avatarURL);
      ctx.beginPath();
      ctx.arc(600, 80, 60, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 540, 20, 120, 120);
    } catch (e) {
      console.error("فشل تحميل صورة الحساب:", e);
    }

    const buffer = canvas.toBuffer();
    const imgPath = path.join(__dirname, "tmp", `${uid}_rank.png`);
    fs.ensureDirSync(path.dirname(imgPath));
    fs.writeFileSync(imgPath, buffer);

    await message.reply({
      body: `🎖 | هذا هو مستواك يا بطل!`,
      attachment: fs.createReadStream(imgPath)
    });

    fs.unlinkSync(imgPath);
  }
};
