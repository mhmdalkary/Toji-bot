const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "ريستارت",
        aliases: ["ريلوود"],
        version: "1.1",
        author: "sifo anter",
        countDown: 5,
        role: 2,
        description: {
            vi: "Khởi động lại bot",
            en: "Restart bot",
            ar: "إعادة تشغيل البوت"
        },
        category: "Owner",
        guide: {
            vi: "   {pn}: Khởi động lại bot",
            en: "   {pn}: Restart bot",
            ar: "   {pn}: يعيد التشغيل"
        }
    },

    langs: {
        vi: {
            restartting: "🔄 | Đang khởi động lại bot..."
        },
        en: {
            restartting: "🔄 | Restarting bot..."
        },
        ar: {
            restartting: "🔁  | OKY  [يتم اعادة تشغيل البوت....] 😊"
        }
    },

    onLoad: function ({ api }) {
        const tmpDir = path.join(__dirname, "tmp");
        const pathFile = path.join(tmpDir, "restart.txt");

        if (fs.existsSync(pathFile)) {
            const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
            api.sendMessage(`✅ | Bot restarted (تم)\n⏰ | Time (الوقت): ${(Date.now() - time) / 1000}s`, tid);
            fs.unlinkSync(pathFile);
        }
    },

    onStart: async function ({ message, event, getLang }) {
        const tmpDir = path.join(__dirname, "tmp");
        const pathFile = path.join(tmpDir, "restart.txt");

        // تأكد من وجود المجلد
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);
        await message.reply(getLang("restartting"));
        process.exit(2);
    }
};