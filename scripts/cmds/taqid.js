module.exports = {
	config: {
		name: "تقييد",
		aliases: ["تقييد", "adminbox", "البوت"],
		version: "1.1",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		shortDescription: {
			vi: "bật/tắt chỉ admin box sử dụng bot",
			ar: "طفي وشغل البوت في المجموعة"
		},
		longDescription: {
			vi: "bật/tắt chế độ chỉ quản trị của viên nhóm mới có thể sử dụng bot",
			ar: "تشغيل وضع أدمن المجموعة فقط"
		},
		category: "إدارة المجموعة",
		guide: {
			ar: "   البوت [تشغيل | إيقاف]"
		}
	},

	langs: {
		vi: {
			turnedOn: "Đã bật chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot",
			turnedOff: "Đã tắt chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot",
			syntaxError: "Sai cú pháp, chỉ có thể dùng {pn} on hoặc {pn} off"
		},
		ar: {
			turnedOn: "تم إطفاء البوت ولن يستعمله الأعضاء 😌",
			turnedOff: "تم تشغيل البوت 🙂❤️",
			syntaxError: "أكتب البوت تشغيل/ايقاف فقط ✓"
		}
	},

	onStart: async function ({ args, message, event, threadsData, getLang }) {
		if (args[0] == "ايقاف") {
			await threadsData.set(event.threadID, true, "data.onlyAdminBox");
			message.reply(getLang("turnedOn"));
		}
		else if (args[0] == "تشغيل") {
			await threadsData.set(event.threadID, false, "data.onlyAdminBox");
			message.reply(getLang("turnedOff"));
		}
		else
			return message.reply(getLang("syntaxError"));
	}
};
