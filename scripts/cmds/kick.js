module.exports = {
	config: {
		name: "نفخ",
		aliases: ["اطرد","خرجو"],
		version: "1.5",
		author: "sifo anter + تعديل",
		countDown: 5,
		role: 0, // الكل يقدر يستدعي الامر
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

		// لو البوت مش ادمن
		if (!adminIDs.includes(botID)) 
			return message.reply("إجعل البوت أدمن كي يطرد الأعضاء.");

		// لو اللي نفذ مش ادمن قروب ولا هو البوت نفسه
		if (!adminIDs.includes(senderID) && senderID != botID) {
			try {
				await api.removeUserFromGroup(senderID, event.threadID);
				return message.reply("بدك تطرد الاونر؟ يلا ابلع حبيبي 😊👋");
			} catch (e) {
				return message.reply("ماقدرت اطردك 😏");
			}
		}

		// لو هو ادمن قروب او البوت
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
