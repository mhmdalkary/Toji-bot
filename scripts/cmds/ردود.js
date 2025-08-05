const fs = require("fs");
const path = require("path");

const repliesFile = path.join(__dirname, "autoReplies.json");

// إنشاء الملف إذا لم يكن موجودًا
if (!fs.existsSync(repliesFile)) {
	fs.writeFileSync(repliesFile, JSON.stringify({}, null, 2));
	console.log("✅ تم إنشاء ملف الردود التلقائية.");
}

module.exports = {
	config: {
		name: "الرد",
		aliases: ["ردود", "اضفرد", "احذررد", "عرضالردود"],
		version: "1.1.0",
		author: "محمد & ChatGPT",
		countDown: 2,
		role: 0,
		longdescription: {
			ar: "إضافة، حذف، عرض، وردود تلقائية"
		},
		category: "أدوات",
		guide: {
			ar: `
{pn} .اضفرد [كلمة] => [الرد]
{pn} .احذررد [كلمة]
{pn} .عرضالردود
`.trim()
		}
	},

	langs: {
		ar: {
			added: "✅ تم إضافة الرد على: \"%1\"",
			exists: "⚠️ هذا الرد مضاف مسبقًا لهذه الكلمة.",
			invalid: "❌ الصيغة غير صحيحة. استخدم:\n.اضفرد كلمة => الرد",
			removed: "🗑️ تم حذف جميع الردود على: \"%1\"",
			notFound: "❌ لا يوجد رد محفوظ بهذه الكلمة.",
			noReplies: "📭 لا توجد أي ردود محفوظة حالياً.",
			list: "📋 الردود:\n\n%1"
		}
	},

	onStart: async function ({ event, message, getLang }) {
		const content = event.body;
		let replies = JSON.parse(fs.readFileSync(repliesFile, "utf8"));

		// إضافة رد
		if (content.startsWith(".اضفرد ")) {
			const parts = content.slice(8).split("=>").map(s => s.trim());
			if (parts.length !== 2 || !parts[0] || !parts[1])
				return message.reply(getLang("invalid"));

			const [trigger, replyText] = parts;
			const key = trigger.toLowerCase();

			if (!replies[key]) {
				replies[key] = [replyText];
			} else {
				if (replies[key].includes(replyText)) {
					return message.reply(getLang("exists"));
				}
				replies[key].push(replyText);
			}

			fs.writeFileSync(repliesFile, JSON.stringify(replies, null, 2));
			return message.reply(getLang("added", key));
		}

		// حذف رد
		if (content.startsWith(".احذررد ")) {
			const key = content.slice(9).trim().toLowerCase();
			if (!replies[key]) return message.reply(getLang("notFound"));

			delete replies[key];
			fs.writeFileSync(repliesFile, JSON.stringify(replies, null, 2));
			return message.reply(getLang("removed", key));
		}

		// عرض الردود
		if (content === ".عرضالردود") {
			const keys = Object.keys(replies);
			if (keys.length === 0) return message.reply(getLang("noReplies"));

			const formatted = keys.map(key =>
				`🔹 "${key}":\n${replies[key].map((r, i) => `   ${i + 1}. ${r}`).join("\n")}`
			).join("\n\n");

			return message.reply(getLang("list", formatted));
		}
	},

	onChat: async function ({ event, message }) {
		const content = event.body?.toLowerCase();
		if (!content) return;

		const replies = JSON.parse(fs.readFileSync(repliesFile, "utf8"));

		for (let key in replies) {
			if (content.includes(key)) {
				const randomReply = replies[key][Math.floor(Math.random() * replies[key].length)];
				return message.reply(randomReply);
			}
		}
	}

			fs.writeFileSync(repliesFile, JSON.stringify(replies, null, 2));
			return message.reply(getLang("added", key));
		}

		// حذف رد
		if (content.startsWith(".احذررد ")) {
			const key = content.slice(9).trim().toLowerCase();
			if (!replies[key]) return message.reply(getLang("notFound"));

			delete replies[key];
			fs.writeFileSync(repliesFile, JSON.stringify(replies, null, 2));
			return message.reply(getLang("removed", key));
		}

		// عرض الردود
		if (content === ".عرضالردود") {
			const keys = Object.keys(replies);
			if (keys.length === 0) return message.reply(getLang("noReplies"));

			const formatted = keys.map(key =>
				`🔹 "${key}":\n${replies[key].map((r, i) => `   ${i + 1}. ${r}`).join("\n")}`
			).join("\n\n");

			return message.reply(getLang("list", formatted));
		}
	},

	// ✅ الرد التلقائي إذا كان داخل onChat
	onChat: async function ({ event, message }) {
		const content = event.body?.toLowerCase();
		if (!content) return;

		const replies = JSON.parse(fs.readFileSync(repliesFile, "utf8"));

		for (let key in replies) {
			if (content.includes(key)) {
				const randomReply = replies[key][Math.floor(Math.random() * replies[key].length)];
				return message.reply(randomReply);
			}
		}
	}
};    // أمر العرض
    if (content === ".عرضالردود") {
      const keys = Object.keys(replies);
      if (keys.length === 0) return message.reply("📭 لا توجد أي ردود محفوظة حالياً.");

      const formatted = keys.map(key =>
        `🔹 "${key}":\n${replies[key].map((r, i) => `   ${i + 1}. ${r}`).join("\n")}`
      ).join("\n\n");

      return message.reply(`📋 الردود:\n\n${formatted}`);
    }

    // الرد التلقائي (تطابق جزئي + عشوائي)
    const msg = content.toLowerCase();

    for (let key in replies) {
      if (msg.includes(key)) {
        const possibleReplies = replies[key];
        const randomReply = possibleReplies[Math.floor(Math.random() * possibleReplies.length)];
        return message.reply(randomReply);
};      
