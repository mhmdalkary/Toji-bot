module.exports = {
	config: {
		name: "reactionUnsend",
		version: "1.0",
		author: "محمد & سيفو",
		role: 0,
		plugin: true // مهم عشان يتفاعل كـ event
	},

	onReaction: async function ({ api, event }) {
		const { messageID, reaction, threadID } = event;

		// تأكد أن التفاعل تم على رسالة أرسلها البوت
		const botID = api.getCurrentUserID();
		if (event.userID === botID) return;

		// لو التفاعل هو ❌ احذف الرسالة
		if (reaction === "❌") {
			try {
				await api.unsendMessage(messageID);
			} catch (err) {
				console.error("خطأ أثناء حذف الرسالة:", err);
			}
		}
	}
};
