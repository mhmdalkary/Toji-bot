const { getTime } = global.utils;

module.exports = {
	config: {
		name: "مستخدم",
		aliases: ["مس", "مستخدم"],
		version: "1.4",
		author: "sifo anter",
		countDown: 5,
		role: 2,
		longdescription: {
			vi: "Quản lý người dùng trong hệ thống bot",
			en: "Manage users in bot system",
			ar: "حظر او فك حظر شخص"
		},
		category: "إدارة البوت",
		guide: {
			vi: "   {pn} [find | -f | search | -s] <tên cần tìm>: tìm kiếm người dùng trong dữ liệu bot bằng tên"
				+ "\n"
				+ "\n   {pn} [ban | -b] [<uid> | @tag | reply tin nhắn] <reason>: để cấm người dùng mang id <uid> hoặc người được tag hoặc người gửi của tin nhắn được reply sử dụng bot"
				+ "\n"
				+ "\n   {pn} unban [<uid> | @tag | reply tin nhắn]: để bỏ cấm người dùng sử dụng bot",
			en: "   {pn} [find | -f | search | -s] <name to find>: search for users in bot data by name"
				+ "\n"
				+ "\n   {pn} [ban | -b] [<uid> | @tag | reply message] <reason>: to ban user with id <uid> or tagged user or sender of message replied using bot"
				+ "\n"
				+ "\n   {pn} unban [<uid> | @tag | reply message]: to unban user using bot",
			ar: "   {pn} [ابحث | -f | بحث | -s] <الاسم للبحث عنه>: البحث عن المستخدمين في بيانات البوت بالاسم"
                + "\n"
                + "\n   {pn} [حظر | -b] [<معرف المستخدم> | @وسم | الرد على الرسالة] <سبب>: لحظر المستخدم بمعرف <معرف المستخدم> أو المستخدم الموسوم أو مرسل الرسالة المردود عليها باستخدام البوت"
                + "\n"
                + "\n   {pn} إلغاء حظر [<معرف المستخدم> | @وسم | الرد على الرسالة]: لإلغاء حظر المستخدم باستخدام البوت"
		}
	},

	langs: {
		vi: {
			noUserFound: "❌ Không tìm thấy người dùng nào có tên khớp với từ khóa: \"%1\" trong dữ liệu của bot",
			userFound: "🔎 Tìm thấy %1 người dùng có tên trùng với từ khóa \"%2\" trong dữ liệu của bot:\n%3",
			uidRequired: "Uid của người cần ban không được để trống, vui lòng nhập uid hoặc tag hoặc reply tin nhắn của 1 người theo cú pháp user ban <uid> <lý do>",
			reasonRequired: "Lý do ban người dùng không được để trống, vui lòng nhập uid hoặc tag hoặc reply tin nhắn của 1 người theo cú pháp user ban <uid> <lý do>",
			userHasBanned: "Người dùng mang id [%1 | %2] đã bị cấm từ trước:\n» Lý do: %3\n» Thời gian: %4",
			userBanned: "Đã cấm người dùng mang id [%1 | %2] sử dụng bot.\n» Lý do: %3\n» Thời gian: %4",
			uidRequiredUnban: "Uid của người cần unban không được để trống",
			userNotBanned: "Hiện tại người dùng mang id [%1 | %2] không bị cấm sử dụng bot",
			userUnbanned: "Đã bỏ cấm người dùng mang id [%1 | %2], hiện tại người này có thể sử dụng bot"
		},
		en: {
			noUserFound: "❌ No user found with name matching keyword: \"%1\" in bot data",
			userFound: "🔎 Found %1 user with name matching keyword \"%2\" in bot data:\n%3",
			uidRequired: "Uid of user to ban cannot be empty, please enter uid or tag or reply message of 1 user by user ban <uid> <reason>",
			reasonRequired: "Reason to ban user cannot be empty, please enter uid or tag or reply message of 1 user by user ban <uid> <reason>",
			userHasBanned: "User with id [%1 | %2] has been banned before:\n» Reason: %3\n» Date: %4",
			userBanned: "User with id [%1 | %2] has been banned:\n» Reason: %3\n» Date: %4",
			uidRequiredUnban: "Uid of user to unban cannot be empty",
			userNotBanned: "User with id [%1 | %2] is not banned",
			userUnbanned: "User with id [%1 | %2] has been unbanned"
		},
		ar: {
	       noUserFound: "❌ لم يتم العثور على مستخدم بالاسم المطابق للكلمة الرئيسية: \"%1\" في بيانات البوت",
	       userFound: "🔎 تم العثور على %1 مستخدم بالاسم المطابق للكلمة الرئيسية \"%2\" في بيانات البوت:\n%3",
	       uidRequired: "لا يمكن أن يكون معرف المستخدم المراد حظره فارغًا، يرجى إدخال معرف المستخدم أو وسم أو الرد على رسالة أحد المستخدمين باستخدام الأمر user ban <معرف المستخدم> <سبب>",
	       reasonRequired: "لا يمكن أن يكون سبب حظر المستخدم فارغًا، يرجى إدخال معرف المستخدم أو وسم أو الرد على رسالة أحد المستخدمين باستخدام الأمر user ban <معرف المستخدم> <سبب>",
	       userHasBanned: "المستخدم بمعرف [%1 | %2] تم حظره سابقًا:\n» السبب: %3\n» التاريخ: %4",
	       userBanned: "المستخدم بمعرف [%1 | %2] تم حظره:\n» السبب: %3\n» التاريخ: %4",
	       uidRequiredUnban: "لا يمكن أن يكون معرف المستخدم المراد إلغاء حظره فارغًا",
	       userNotBanned: "المستخدم بمعرف [%1 | %2] غير محظور",
	       userUnbanned: "المستخدم بمعرف [%1 | %2] تم إلغاء حظره"
       }
	},

	onStart: async function ({ args, usersData, message, event, prefix, getLang }) {
		const type = args[0];
		switch (type) {
			// find user
			case "بحث":
			case "find":
			case "-f":
			case "search":
			case "-s": {
				const allUser = await usersData.getAll();
				const keyWord = args.slice(1).join(" ");
				const result = allUser.filter(item => (item.name || "").toLowerCase().includes(keyWord.toLowerCase()));
				const msg = result.reduce((i, user) => i += `\n╭Name: ${user.name}\n╰ID: ${user.userID}`, "");
				message.reply(result.length == 0 ? getLang("noUserFound", keyWord) : getLang("userFound", result.length, keyWord, msg));
				break;
			}
			// ban user
			case "بان":
			case "حظر":
			case "حضر":
			case "ban":
			case "-b": {
				let uid, reason;
				if (event.type == "message_reply") {
					uid = event.messageReply.senderID;
					reason = args.slice(1).join(" ");
				}
				else if (Object.keys(event.mentions).length > 0) {
					const { mentions } = event;
					uid = Object.keys(mentions)[0];
					reason = args.slice(1).join(" ").replace(mentions[uid], "");
				}
				else if (args[1]) {
					uid = args[1];
					reason = args.slice(2).join(" ");
				}
				else return message.SyntaxError();

				if (!uid)
					return message.reply(getLang("uidRequired"));
				if (!reason)
					return message.reply(getLang("reasonRequired", prefix));
				reason = reason.replace(/\s+/g, ' ');

				const userData = await usersData.get(uid);
				const name = userData.name;
				const status = userData.banned.status;

				if (status)
					return message.reply(getLang("userHasBanned", uid, name, userData.banned.reason, userData.banned.date));
				const time = getTime("DD/MM/YYYY HH:mm:ss");
				await usersData.set(uid, {
					banned: {
						status: true,
						reason,
						date: time
					}
				});
				message.reply(getLang("userBanned", uid, name, reason, time));
				break;
			}
			// unban user
			case "فك":
			case "unban":
			case "-u": {
				let uid;
				if (event.type == "message_reply") {
					uid = event.messageReply.senderID;
				}
				else if (Object.keys(event.mentions).length > 0) {
					const { mentions } = event;
					uid = Object.keys(mentions)[0];
				}
				else if (args[1]) {
					uid = args[1];
				}
				else
					return message.SyntaxError();
				if (!uid)
					return message.reply(getLang("uidRequiredUnban"));
				const userData = await usersData.get(uid);
				const name = userData.name;
				const status = userData.banned.status;
				if (!status)
					return message.reply(getLang("userNotBanned", uid, name));
				await usersData.set(uid, {
					banned: {}
				});
				message.reply(getLang("userUnbanned", uid, name));
				break;
			}
			default:
				return message.SyntaxError();
		}
	}
};
