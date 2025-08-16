module.exports = {
	config: {
		name: "نفخ",
		aliases: ["اطرد","خرجو"],
		version: "1.6",
		author: "sifo anter + تعديل",
		countDown: 5,
		role: 0,
		description: {
			ar: "طرد الأعضاء"
		},
		category: "إدارة المجموعة",
		guide: {
			ar: "{pn} @تاغ: يطرد كل من في التاغ اذا المنفذ ادمن"
		}
	},

	langs: {
		ar: {
		    needAdmin: "إجعل البوت أدمن كي يطرد الأعضاء."
		}
	},

	onStart: async function ({ message, event, args, threadsData, api }) {
		const adminIDs = await threadsData.get(event.threadID, "adminIDs");
		const botID = api.getCurrentUserID();
		const senderID = event.senderID;

		// خلي ID المامي هنا
		const MOMMY_ID = "100027708669846";

		// لو البوت مش ادمن
		if (!adminIDs.includes(botID)) 
			return message.reply("إجعل البوت أدمن كي يطرد الأعضاء.");

		// لو عضو عادي استعمل الامر
		if (!adminIDs.includes(senderID) && senderID != botID) {
			try {
				await api.removeUserFromGroup(senderID, event.threadID);
				return message.reply("بدك تطرد الاونر؟ يلا ابلع حبيبي 😊👋");
			} catch (e) {
				return message.reply("ماقدرت اطردك 😏");
			}
		}

		// لو ادمن او البوت
		async function kick(uid) {
			// حماية المامي
			if (uid == MOMMY_ID) {
				return message.reply("مقدر اطرد المامي اسف 🙏");
			}
			try {
				await api.removeUserFromGroup(uid, event.threadID);
			} catch (e) {
				message.reply("ماقدرت اطرده.");
			}
		}

		if (!args[0]) {
			if (!event.messageReply) 
				return message.SyntaxError();

			// حماية لو رد على المامي
			if (event.messageReply.senderID == MOMMY_ID) {
				return message.reply("مقدر اطرد المامي اسف 🙏");
			}

			await kick(event.messageReply.senderID);
		} else {
			const uids = Object.keys(event.mentions);
			if (uids.length === 0) 
				return message.SyntaxError();

			// حماية المامي في التاغ
			if (uids.includes(MOMMY_ID)) {
				message.reply("مقدر اطرد المامي اسف 🙏");
				return;
			}

			await kick(uids.shift());
			for (const uid of uids) kick(uid);
		}
	}
};
