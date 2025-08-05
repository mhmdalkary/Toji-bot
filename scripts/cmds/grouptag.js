module.exports = {
	config: {
		name: "جروب_تاغ",
		aliases: ["جروب.تاغ", "تاغ_جروب"],
		version: "1.5",
		author: "Sifo Anter",
		countDown: 5,
		role: 0,
		description: {
			ar: "إدارة مجموعات التاغ داخل الدردشة."
		},
		category: "أدوات",
		guide: {
			ar: 
				"{pn} إضافة <اسم_المجموعة> <@تاغ_الأعضاء>: لإنشاء مجموعة جديدة أو إضافة أعضاء إلى مجموعة موجودة.\n" +
				"مثال:\n" +
				"  {pn} إضافة الفريق1 @عضو1 @عضو2\n\n" +
				
				"{pn} حذف <اسم_المجموعة> <@تاغ_الأعضاء>: لحذف أعضاء معينين من المجموعة.\n" +
				"مثال:\n" +
				"  {pn} حذف الفريق1 @عضو1 @عضو2\n\n" +

				"{pn} إزالة <اسم_المجموعة>: لحذف المجموعة بالكامل.\n" +
				"مثال:\n" +
				"  {pn} إزالة الفريق1\n\n" +

				"{pn} تاغ <اسم_المجموعة>: للإشارة إلى جميع أعضاء المجموعة.\n\n" +

				"{pn} إعادة_تسمية <الاسم_القديم> | <الاسم_الجديد>: لتغيير اسم المجموعة.\n\n" +

				"{pn} [قائمة | الكل]: لعرض جميع المجموعات المسجلة في الدردشة.\n\n" +

				"{pn} معلومات <اسم_المجموعة>: لعرض معلومات مجموعة معينة."
		}
	},

	langs: {
		ar: {
			noGroupTagName: "❌ | يرجى إدخال اسم المجموعة.",
			noMention: "❌ | لم تقم بالإشارة إلى أي عضو لإضافته إلى المجموعة.",
			addedSuccess: "✅ | تمت إضافة الأعضاء التالية أسماؤهم إلى المجموعة \"%1\":\n%2",
			addedSuccess2: "✅ | تم إنشاء المجموعة \"%1\" وإضافة الأعضاء:\n%2",
			existedInGroupTag: "⚠️ | الأعضاء التاليون موجودون بالفعل في المجموعة \"%2\":\n%1",
			notExistedInGroupTag: "⚠️ | الأعضاء التاليون غير موجودين في المجموعة \"%2\":\n%1",
			noExistedGroupTag: "❌ | المجموعة \"%1\" غير موجودة في هذه الدردشة.",
			noExistedGroupTag2: "❌ | لا توجد أي مجموعة مسجلة في هذه الدردشة.",
			noMentionDel: "❌ | يرجى الإشارة إلى الأعضاء الذين تريد حذفهم من المجموعة \"%1\".",
			deletedSuccess: "✅ | تم حذف الأعضاء التالية أسماؤهم من المجموعة \"%2\":\n%1",
			deletedSuccess2: "✅ | تم حذف المجموعة \"%1\" بالكامل.",
			tagged: "📢 | تمت الإشارة إلى أعضاء المجموعة \"%1\":\n%2",
			noGroupTagName2: "❌ | يرجى إدخال الاسم القديم للمجموعة والاسم الجديد مفصولين بـ \"|\".",
			renamedSuccess: "✅ | تم تغيير اسم المجموعة من \"%1\" إلى \"%2\".",
			infoGroupTag: "📑 | اسم المجموعة: %1\n👥 | عدد الأعضاء: %2\n👨‍👩‍👧‍👦 | قائمة الأعضاء:\n %3"
		}
	},

	onStart: async function ({ message, event, args, threadsData, getLang }) {
		const { threadID, mentions } = event;
		for (const uid in mentions)
			mentions[uid] = mentions[uid].replace("@", "");
		const groupTags = await threadsData.get(threadID, "data.groupTags", []);

		switch (args[0]) {
			case "إضافة": {
				const mentionsID = Object.keys(event.mentions);
				const content = args.slice(1).join(" ");
				const groupTagName = content.split("@")[0].trim();

				if (!groupTagName) return message.reply(getLang("noGroupTagName"));
				if (mentionsID.length === 0) return message.reply(getLang("noMention"));

				const oldGroupTag = groupTags.find(tag => tag.name.toLowerCase() === groupTagName.toLowerCase());
				if (oldGroupTag) {
					const usersIDExist = [];
					const usersIDNotExist = [];
					for (const uid of mentionsID) {
						if (oldGroupTag.users[uid]) {
							usersIDExist.push(uid);
						} else {
							oldGroupTag.users[uid] = mentions[uid];
							usersIDNotExist.push(uid);
						}
					}
					await threadsData.set(threadID, groupTags, "data.groupTags");

					let msg = "";
					if (usersIDNotExist.length > 0)
						msg += getLang("addedSuccess", oldGroupTag.name, usersIDNotExist.map(uid => mentions[uid]).join("\n")) + "\n";
					if (usersIDExist.length > 0)
						msg += getLang("existedInGroupTag", usersIDExist.map(uid => mentions[uid]).join("\n"), oldGroupTag.name);
					message.reply(msg);
				} else {
					const newGroupTag = { name: groupTagName, users: mentions };
					groupTags.push(newGroupTag);
					await threadsData.set(threadID, groupTags, "data.groupTags");
					message.reply(getLang("addedSuccess2", groupTagName, Object.values(mentions).join("\n")));
				}
				break;
			}

			case "قائمة":
			case "الكل": {
				const msg = groupTags.map(group => `📌 ${group.name}:\n ${Object.values(group.users).join("\n ")}`).join("\n\n");
				message.reply(msg || getLang("noExistedGroupTag2"));
				break;
			}

			case "معلومات": {
				const groupTagName = args.slice(1).join(" ");
				if (!groupTagName) return message.reply(getLang("noGroupTagName"));
				const groupTag = groupTags.find(tag => tag.name.toLowerCase() === groupTagName.toLowerCase());
				if (!groupTag) return message.reply(getLang("noExistedGroupTag", groupTagName));
				return message.reply(getLang("infoGroupTag", groupTag.name, Object.keys(groupTag.users).length, Object.values(groupTag.users).join("\n")));
			}

			case "إزالة": {
				const groupTagName = args.slice(1).join(" ").trim();
				const index = groupTags.findIndex(group => group.name.toLowerCase() === groupTagName.toLowerCase());
				if (index === -1) return message.reply(getLang("noExistedGroupTag", groupTagName));
				groupTags.splice(index, 1);
				await threadsData.set(threadID, groupTags, "data.groupTags");
				message.reply(getLang("deletedSuccess2", groupTagName));
				break;
			}

			case "إعادة_تسمية": {
				const [oldName, newName] = args.slice(1).join(" ").split("|").map(str => str.trim());
				if (!oldName || !newName) return message.reply(getLang("noGroupTagName2"));
				const oldGroupTag = groupTags.find(tag => tag.name.toLowerCase() === oldName.toLowerCase());
				if (!oldGroupTag) return message.reply(getLang("noExistedGroupTag", oldName));
				oldGroupTag.name = newName;
				await threadsData.set(threadID, groupTags, "data.groupTags");
				message.reply(getLang("renamedSuccess", oldName, newName));
				break;
			}

			case "تاغ": {
				const groupTagName = args.slice(1).join(" ").trim();
				if (!groupTagName) return message.reply(getLang("noGroupTagName"));
				const groupTag = groupTags.find(tag => tag.name.toLowerCase() === groupTagName.toLowerCase());
				if (!groupTag) return message.reply(getLang("noExistedGroupTag", groupTagName));
				const mentions = Object.keys(groupTag.users).map(uid => ({ id: uid, tag: groupTag.users[uid] }));
				message.reply({ body: getLang("tagged", groupTag.name, Object.values(groupTag.users).join("\n")), mentions });
				break;
			}
		}
	}
};
