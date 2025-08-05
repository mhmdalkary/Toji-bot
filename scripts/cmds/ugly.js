module.exports = {
	config: {
		name: "قبح",
		version: "1.1",
		author: "Samir + ChatGPT",
		role: 0,
		category: "العاب",
		guide: {
			vi: "Just For Fun",
			ar: "احسب قبحك"
		} 
	},

	onStart: async function ({ api, event }) {
		const exceptions = {
			"100088888888888": "😇 أنت جميل جدًا يا أسطورة! نسبة القبح 0٪ 🔥",
			"100087632392287": "✨ الجمال يمشي على قدمين! مستحيل تكون قبيح 😍",
			"100066666666666": "👑 وسيم القبيلة، القبح لا يعرف طريقك."
		};

		const userID = event.senderID;

		// إذا كان المستخدم له استثناء
		if (exceptions[userID]) {
			return api.sendMessage(exceptions[userID], event.threadID, event.messageID);
		}

		// الرسائل العشوائية
		const data = [];
		for (let i = 1; i <= 100; i++) {
			data.push(`أنت ${i}٪ قبيح تمامًا 🥺`);
		}

		const randomIndex = Math.floor(Math.random() * data.length);
		return api.sendMessage(data[randomIndex], event.threadID, event.messageID);
	}
};
