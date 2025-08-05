const fs = require("fs-extra");

module.exports = {
	config: {
		name: "تحميل-الكونفيغ",
		aliases: ["تحميل الكونفيغ", "loadcf"],
		version: "1.4",
		author: "sifo anter",
		countDown: 5,
		role: 2,
		shortDescription: {
			vi: "Load lại config của bot",
			en: "Reload config of bot",
			ar: "إعادة تحميل الكونفيغ"
		},
		category: "إدارة البوت",
		guide: "{pn}"
	},

	langs: {
		vi: {
			success: "Config đã được load lại thành công"
		},
		en: {
			success: "Config has been reloaded successfully"
		},
		ar: {
		    success: "تم إعادة تحميل الكونفيغ بنجاح"
		}
	},

	onStart: async function ({ message, getLang }) {
		global.GoatBot.config = fs.readJsonSync(global.client.dirConfig);
		global.GoatBot.configCommands = fs.readJsonSync(global.client.dirConfigCommands);
		message.reply(getLang("success"));
	}
};
