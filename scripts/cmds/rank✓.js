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
        ` ترتيبك في المجموعة: #${userRank} من ${rankedUsers.length}\n` +
        ` مستواك الحالي: ${userLevel}\n` +
        ` خبرتك: ${userXp} XP\n` +
        ` تقدمك نحو المستوى القادم:\n` +
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
      const allUsersData = await Promise.all(memberIDs.map(uid => usersData.get(uid)));
      const rankedUsers = allUsersData
        .filter(u => u && typeof u.exp === "number")
        .sort((a, b) => b.exp - a.exp);

      const userRank = rankedUsers.findIndex(u => u.id === userID) + 1;

      // إعداد كانفاس
      const width = 800;
      const height = 250;
      const canvas = Canvas.createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // تدرج لوني كخلفية
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0f2027");
      gradient.addColorStop(0.5, "#203a43");
      gradient.addColorStop(1, "#2c5364");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // إعداد الخطوط
      ctx.font = "bold 30px Tahoma, Arial, sans-serif";
      ctx.fillStyle = "#fff";
      ctx.textBaseline = "top";

      // كتابة الاسم
      ctx.fillText(`الاسم: ${userData.name || "مجهول"}`, 50, 30);

      // كتابة الرتبة
      ctx.fillText(`الرتبة: ${userRank} من ${rankedUsers.length}`, 50, 80);

      // كتابة المستوى
      ctx.fillText(`المستوى: ${userLevel}`, 50, 130);

      // كتابة الخبرة
      ctx.fillText(`الخبرة: ${userXp} XP`, 50, 180);

      // رسم شريط التقدم
      const barX = 300;
      const barY = 190;
      const barWidth = 450;
      const barHeight = 30;

      // خلفية الشريط
      ctx.fillStyle = "#555";
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // التقدم الحالي
      ctx.fillStyle = "#00ff99";
      ctx.fillRect(barX, barY, (barWidth * progress) / 100, barHeight);

      // كتابة النسبة %
      ctx.font = "bold 25px Tahoma, Arial, sans-serif";
      ctx.fillStyle = "#fff";
      ctx.fillText(`${progress.toFixed(1)}%`, barX + barWidth + 10, barY);

      // محاولة جلب صورة البروفايل وعرضها (إن وجدت)
      try {
        const userPicURL = await api.getUserAvatarURL(userID); // فرضا موجودة
        const avatar = await Canvas.loadImage(userPicURL);
        const avatarSize = 120;
        // دائرة صورة البروفايل
        ctx.save();
        ctx.beginPath();
        ctx.arc(width - avatarSize / 2 - 40, height / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, width - avatarSize - 40, height / 2 - avatarSize / 2, avatarSize, avatarSize);
        ctx.restore();
      } catch {
        // لا تفعل شيء لو فشل تحميل الصورة
      }

      // حفظ الصورة مؤقتاً
      const filePath = path.join(__dirname, "tmp", `${userID}_rank.png`);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, canvas.toBuffer("image/png"));

      // إرسال الصورة والرد
      await message.reply({
        body: `🎖 | مستواك الحالي في المجموعة\nرتبتك #${userRank} من ${rankedUsers.length}`,
        attachment: fs.createReadStream(filePath)
      });

      // حذف الملف المؤقت بأمان
      fs.unlink(filePath).catch(() => {});
    } catch (error) {
      console.error("خطأ في أمر مستواي:", error);
      await message.reply("❌ حدث خطأ أثناء تنفيذ أمر مستواي. حاول مرة أخرى لاحقًا.");
    }
  }
};
