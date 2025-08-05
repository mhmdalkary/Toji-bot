module.exports = {
	config: {
		name: "رصيدي",
		aliases: ["رصيدي", "bal", "رصيد"],
		version: "1.2",
		author: "sifo anter",
		countDown: 5,
		role: 0,
		longdescription: {
			vi: "xem số tiền hiện có của bạn hoặc người được tag",
			en: "view your money or the money of the tagged person",
			ar: "عرض رصيدك في البوت"
		},
		category: "إقتصاد",
		guide: {
			vi: "   {pn}: xem số tiền của bạn"
				+ "\n   {pn} <@tag>: xem số tiền của người được tag",
			en: "   {pn}: view your money"
				+ "\n   {pn} <@tag>: view the money of the tagged person",
			ar: "   {pn}: عرض رصيدك انت"
			    + "\n   {pn} @تاغ: عرض رصيد اللي في التاغ"
	}
	},

	langs: {
		vi: {
			money: "Bạn đang có %1$",
			moneyOf: "%1 đang có %2$"
		},
		en: {
			money: "You have %1$",
			moneyOf: "%1 has %2$"
		},
		ar: {
		    money: "⭐معك %1 دينار",
		    moneyOf: "%1 معه %2 دينار"
		}
	},

	onStart: async function ({ message, usersData, event, getLang }) {
		if (Object.keys(event.mentions).length > 0) {
			const uids = Object.keys(event.mentions);
			let msg = "";
			for (const uid of uids) {
				const userMoney = await usersData.get(uid, "money");
				msg += getLang("moneyOf", event.mentions[uid].replace("@", ""), userMoney) + '\n';
			}
			return message.reply(msg);
		}
		const userData = await usersData.get(event.senderID);
		message.reply(getLang("money", userData.money));
	}
};
