function checkShortCut(nickname, uid, userName) {
	/\{userName\}/gi.test(nickname) ? nickname = nickname.replace(/\{userName\}/gi, userName) : null;
	/\{userID\}/gi.test(uid) ? nickname = nickname.replace(/\{userID\}/gi, uid) : null;
	return nickname;
}

module.exports = {
	config: {
		name: "تسمية-الجدد",
	aliases: ["تسميه", "تسمية الجدد"],
		version: "1.3",
		author: "sifo anter",
		cooldowns: 5,
		role: 1,
		description: {
			vi: "Tự đổi biệt danh cho thành viên mới vào nhóm chat",
			en: "Auto change nickname of new member",
			ar: "تغيير أسماء الأعضاء الجدد تلقائيا"
		},
		category: "إدارة المجموعة",
		guide: {
			vi: '   {pn} set <nickname>: dùng để cài đặt cấu hình để tự đổi biệt danh, với các shortcut có sẵn:'
				+ '\n   + {userName}: tên thành viên vào nhóm'
				+ '\n   + {userID}: id thành viên'
				+ '\n   Ví dụ:'
				+ '\n    {pn} set {userName} 🚀'
				+ '\n\n   {pn} [on | off]: dùng để bật/tắt tính năng này'
				+ '\n\n   {pn} [view | info]: hiển thị cấu hình hiện tại',
			en: '   {pn} set <nickname>: use to set config to auto change nickname, with some shortcuts:'
				+ '\n   + {userName}: name of new member'
				+ '\n   + {userID}: member id'
				+ '\n   Example:'
				+ '\n    {pn} set {userName} 🚀'
				+ '\n\n   {pn} [on | off]: use to turn on/off this feature'
				+ '\n\n   {pn} [view | info]: show current config',
			 ar: '   {pn} وضع <الكنية>: وضع اسم جديد مع اختصارات تالية:'
			    + '\n\n {userName} إسم العضو الجديد.'
			    + '\n\n مثال:'
			    + '\n\n {pn} وضع {userName} | جديد 💜'
			    + '\n {pn} تشغيل | ايقاف'
			    + '\n {pn} معلومات: رؤية معلومات هذا الأمر في المجموعة '
		}
	},

	langs: {
		vi: {
			missingConfig: "Vui lòng nhập cấu hình cần thiết",
			configSuccess: "Cấu hình đã được cài đặt thành công",
			currentConfig: "Cấu hình autoSetName hiện tại trong nhóm chat của bạn là:\n%1",
			notSetConfig: "Hiện tại nhóm bạn chưa cài đặt cấu hình autoSetName",
			syntaxError: "Sai cú pháp, chỉ có thể dùng \"{pn} on\" hoặc \"{pn} off\"",
			turnOnSuccess: "Tính năng autoSetName đã được bật",
			turnOffSuccess: "Tính năng autoSetName đã được tắt",
			error: "Đã có lỗi xảy ra khi sử dụng chức năng autoSetName, thử tắt tính năng liên kết mời trong nhóm và thử lại sau"
		},
		en: {
			missingConfig: "Please enter the required configuration",
			configSuccess: "The configuration has been set successfully",
			currentConfig: "The current autoSetName configuration in your chat group is:\n%1",
			notSetConfig: "Your group has not set the autoSetName configuration",
			syntaxError: "Syntax error, only \"{pn} on\" or \"{pn} off\" can be used",
			turnOnSuccess: "The autoSetName feature has been turned on",
			turnOffSuccess: "The autoSetName feature has been turned off",
			error: "An error occurred while using the autoSetName feature, try turning off the invite link feature in the group and try again later"
		},
		ar: {
			missingConfig: "أدخل الإعدادات الأمر.",
			configSuccess: "✅ تم تطبيق الإعدادات بنجاح",
			currentConfig: "📜 الإعدادات الحالية:\n%1",
			notSetConfig: "المجموعة لم تضبط إعدادات هذا الأمر ❎",
			syntaxError: "خطأ, أكتب \"{pn} تشغيل\" أو \"{pn} ايقاف\" فقط",
			turnOnSuccess: "تم تشغيل الأمر بنجاح ✅",
			turnOffSuccess: "❎ تم ايقاف الوضع بنجاح",
			error: "من فضلك أطفأ رابط الدعوة الى المجموعة ليقوم البوت يتسمية الأعضاء الجدد تلقائيا."
		}
	},

	onStart: async function ({ message, event, args, threadsData, getLang }) {
		switch (args[0]) {
			case "set":
			case "وضع":
			case "add":
			case "config": {
				if (args.length < 2)
					return message.reply(getLang("missingConfig"));
				const configAutoSetName = args.slice(1).join(" ");
				await threadsData.set(event.threadID, configAutoSetName, "data.autoSetName");
				return message.reply(getLang("configSuccess"));
			}
			case "view":
			case "معلومات":
			case "info": {
				const configAutoSetName = await threadsData.get(event.threadID, "data.autoSetName");
				return message.reply(configAutoSetName ? getLang("currentConfig", configAutoSetName) : getLang("notSetConfig"));
			}
			default: {
				let enableOrDisable;
				if (args[0] == "on" || args[0] == "تشغيل") enableOrDisable = "on";
				if (args[0] == "off" || args[0] == "ايقاف") enableOrDisable = "off";
				if (enableOrDisable !== "on" && enableOrDisable !== "off")
					return message.reply(getLang("syntaxError"));
				await threadsData.set(event.threadID, enableOrDisable === "on", "settings.enableAutoSetName");
				return message.reply(enableOrDisable == "on" ? getLang("turnOnSuccess") : getLang("turnOffSuccess"));
			}
		}
	},

	onEvent: async ({ message, event, api, threadsData, getLang }) => {
		if (event.logMessageType !== "log:subscribe")
			return;
		if (!await threadsData.get(event.threadID, "settings.enableAutoSetName"))
			return;
		const configAutoSetName = await threadsData.get(event.threadID, "data.autoSetName");

		return async function () {
			const addedParticipants = [...event.logMessageData.addedParticipants];

			for (const user of addedParticipants) {
				const { userFbId: uid, fullName: userName } = user;
				try {
					await api.changeNickname(checkShortCut(configAutoSetName, uid, userName), event.threadID, uid);
				}
				catch (e) {
					return message.reply(getLang("error"));
				}
			}
		};
	}
};
