const fs = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
	config: {
		name: "الأدمن",
		aliases: ["adonly", "onlyad", "onlyadmin", "للمشرفين", "ادمنفقط"],
		version: "1.5",
		author: "SIFOANTER",
		countDown: 5,
		role: 2,
		shortDescription: {
			ar: "تشغيل/إيقاف وضع الأدمن فقط لاستخدام البوت",
			en: "turn on/off only admin can use bot"
		},
		category: "إدارة البوت",
		guide: {
			ar: "   {pn} [تشغيل | إيقاف]: تفعيل أو تعطيل وضع الأدمن فقط"
				+ "\n   {pn} تنبيه [تشغيل | إيقاف]: تفعيل أو تعطيل تنبيهات المحاولات من غير الأدمن",
			en: "   {pn} [on | off]: turn on/off the mode only admin can use bot"
				+ "\n   {pn} noti [on | off]: turn on/off the notification when user is not admin use bot"
		}
	},

	langs: {
		ar: {
			turnedOn: "✅ | تم تفعيل وضع الأدمن فقط لاستخدام البوت",
			turnedOff: "❎ | تم تعطيل وضع الأدمن فقط لاستخدام البوت",
			turnedOnNoti: "✅ | تم تفعيل التنبيهات عندما يحاول غير الأدمن استخدام البوت",
			turnedOffNoti: "❎ | تم تعطيل التنبيهات لمحاولات غير الأدمن"
		},
		en: {
			turnedOn: "Turned on the mode only admin can use bot",
			turnedOff: "Turned off the mode only admin can use bot",
			turnedOnNoti: "Turned on the notification when user is not admin use bot",
			turnedOffNoti: "Turned off the notification when user is not admin use bot"
		}
	},

	onStart: function ({ args, message, getLang }) {
		let isSetNoti = false;
		let value;
		let indexGetVal = 0;

		const arg0 = args[0]?.toLowerCase();
		const arg1 = args[1]?.toLowerCase();

		if (["noti", "تنبيه"].includes(arg0)) {
			isSetNoti = true;
			indexGetVal = 1;
		}

		const val = args[indexGetVal]?.toLowerCase();
		if (["on", "تشغيل"].includes(val))
			value = true;
		else if (["off", "ايقاف", "إيقاف"].includes(val))
			value = false;
		else
			return message.SyntaxError();

		if (isSetNoti) {
			config.hideNotiMessage.adminOnly = !value;
			message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
		} else {
			config.adminOnly.enable = value;
			message.reply(getLang(value ? "turnedOn" : "turnedOff"));
		}

		fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
	}
};
