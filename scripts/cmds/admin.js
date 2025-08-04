const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "مشرفين",
		aliases: ["و", "مشرفين", "ادمن"],
		version: "1.6",
		author: "SIFOANTER",
		countDown: 5,
		role: 2,
		description: {
			ar: "إضافة، حذف أو تعديل صلاحيات الأدمن",
			en: "Add, remove, edit admin role"
		},
		category: "إدارة البوت",
		guide: {
			ar: '   {pn} [إضافة | add | -a] <uid | @tag>: إعطاء صلاحيات أدمن'
				+ '\n   {pn} [حذف | إزالة | remove | -r] <uid | @tag>: إزالة صلاحيات الأدمن'
				+ '\n   {pn} [قائمة | list | -l]: عرض قائمة الأدمنز',
			en: '   {pn} [add | -a] <uid | @tag>: Add admin role for user'
				+ '\n   {pn} [remove | -r] <uid | @tag>: Remove admin role of user'
				+ '\n   {pn} [list | -l]: List all admins'
		}
	},

	langs: {
		ar: {
			added: "✅ | تم إعطاء صلاحية الأدمن لـ %1 مستخدم:\n%2",
			alreadyAdmin: "\n⚠️ | %1 مستخدم لديه صلاحية الأدمن بالفعل:\n%2",
			missingIdAdd: "⚠️ | الرجاء إدخال UID أو منشن للمستخدم لإعطائه صلاحية الأدمن",
			removed: "✅ | تم إزالة صلاحية الأدمن عن %1 مستخدم:\n%2",
			notAdmin: "⚠️ | %1 مستخدم لا يملك صلاحية الأدمن:\n%2",
			missingIdRemove: "⚠️ | الرجاء إدخال UID أو منشن للمستخدم لإزالة صلاحية الأدمن عنه",
			listAdmin: "👑 | قائمة الأدمنز:\n%1"
		},
		en: {
			added: "✅ | Added admin role for %1 users:\n%2",
			alreadyAdmin: "\n⚠️ | %1 users already have admin role:\n%2",
			missingIdAdd: "⚠️ | Please enter ID or tag user to add admin role",
			removed: "✅ | Removed admin role of %1 users:\n%2",
			notAdmin: "⚠️ | %1 users don't have admin role:\n%2",
			missingIdRemove: "⚠️ | Please enter ID or tag user to remove admin role",
			listAdmin: "👑 | List of admins:\n%1"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		const cmd = args[0]?.toLowerCase();
		switch (cmd) {
			case "add":
			case "-a":
			case "إضافة": {
				if (args[1]) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);
					else if (event.messageReply)
						uids.push(event.messageReply.senderID);
					else
						uids = args.filter(arg => !isNaN(arg));
					const notAdminIds = [];
					const adminIds = [];
					for (const uid of uids) {
						if (config.adminBot.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}
					config.adminBot.push(...notAdminIds);
					const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
					return message.reply(
						(notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.filter(({ uid }) => notAdminIds.includes(uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
						+ (adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, getNames.filter(({ uid }) => adminIds.includes(uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
					);
				} else return message.reply(getLang("missingIdAdd"));
			}

			case "remove":
			case "-r":
			case "حذف":
			case "إزالة": {
				if (args[1]) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);
					else
						uids = args.filter(arg => !isNaN(arg));
					const notAdminIds = [];
					const adminIds = [];
					for (const uid of uids) {
						if (config.adminBot.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}
					for (const uid of adminIds)
						config.adminBot.splice(config.adminBot.indexOf(uid), 1);
					const getNames = await Promise.all(adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
					return message.reply(
						(adminIds.length > 0 ? getLang("removed", adminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
						+ (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
					);
				} else return message.reply(getLang("missingIdRemove"));
			}

			case "list":
			case "-l":
			case "قائمة": {
				const getNames = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
			}

			default:
				return message.SyntaxError();
		}
	}
};