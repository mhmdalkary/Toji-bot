module.exports = {
	config: {
		name: "تيد",
		aliases: ["تيد", "ثيد"],
		version: "1.2",
		author: "sifo anter",
		countDown: 5,
		role: 0,
		description: {
			vi: "Xem id nhóm chat của bạn",
			en: "View threadID of your group chat",
			ar: "معرف المجموعة"
		},
		category: "info",
		guide: {
			en: "{pn}",
			ar: "{pn}"
		}
	},

	onStart: async function ({ message, event }) {
		message.reply(event.threadID.toString());
	}
};