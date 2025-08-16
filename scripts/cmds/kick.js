module.exports = {
	config: {
		name: "نفخ",
		aliases: ["اطرد","خرجو"],
		version: "1.4",
		author: "sifo anter + تعديل",
		countDown: 5,
		role: 0, // خليه 0 عشان يقدر يستدعي الامر اي شخص
		description: {
			ar: "طرد الأعضاء"
		},
		category: "إدارة المجموعة",
		guide: {
			ar: "   {pn} @تاغ: يطرد كل من في التاغ اذا المنفذ ادمن"
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

		// اذا البوت مش ادمن
		if (!adminIDs.includes(botID)) 
			return message.reply("إجعل البوت أدمن كي يطرد الأعضاء.");

		// اذا اللي نفذ الامر مش ادمن جروب
		if (!adminIDs.includes(event.senderID)) {
			try {
				await api.removeUserFromGroup(event.senderID, event.threadID);
				return message.reply("بدك تطرد الاونر؟ يلا ابلع حبيبي 😊👋");
			} catch (e) {
				return message.reply("ماقدرت اطردك 😏");
			}
		}

		// اذا ادمن فعلاً
		async function kick(uid) {
			try {
				await api.removeUserFromGroup(uid, event.threadID);
			} catch (e) {
				message.reply("ماقدرت اطرده.");
			}
		}

		if (!args[0]) {
			if (!event.messageReply) 
				return message.SyntaxError();
			await kick(event.messageReply.senderID);
		} else {
			const uids = Object.keys(event.mentions);
			if (uids.length === 0) 
				return message.SyntaxError();
			await kick(uids.shift());
			for (const uid of uids) kick(uid);
		}
	}
};
