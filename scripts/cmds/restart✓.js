/*const fs = require("fs-extra");

module.exports = {
	config: {
		name: "ريلوود",
		version: "1.0",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		shortDescription: {
			vi: "Khởi động lại bot",
			en: "💢إعادة تشغيل البوت"
		},
		longDescription: {
			vi: "Khởi động lại bot",
			en: "ريلود فقط لمطور عنترة"
		},
		category: "Owner",
		guide: {
			vi: "   {pn}: Khởi động lại bot",
			en: "   ريلود : إعادة تشغيل"
		}
	},

	langs: {
		vi: {
			restartting: "🔄 | Đang khởi động lại bot..."
		},
		en: {
			restartting: "🔄 | إعادة تشغيل البوت"
		}
	},

	onLoad: function ({ api }) {
		const pathFile = `${__dirname}/tmp/restart.txt`;
		if (fs.existsSync(pathFile)) {
			const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
			api.sendMessage(`✅ | تم إعادة تشغيل البوت\n⏰ | Time: ${(Date.now() - time) / 1000}s`, tid);
			fs.unlinkSync(pathFile);
		}
	},

	onStart: async function ({ message, event, getLang }) {
		const pathFile = `${__dirname}/tmp/restart.txt`;
		fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);
		await message.reply(getLang("restartting"));
		process.exit(2);
	}
};*/