const { getPrefix } = global.utils;

module.exports = {
	config: {
		name: "قواعد",
    aliases: ["قواعد", "شروط", "قوانين"],
		version: "1.4",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		shortDescription: {
			vi: "Quy tắc của nhóm",
			en: "قوانين المجموعة"
		},
		longDescription: {
			vi: "Tạo/xem/thêm/sửa/đổi vị trí/xóa nội quy nhóm của bạn",
			en: "أنشأ/رؤية/اضف/عدل/غيرمكان/احذف قواعد المجموعة"
		},
		category: "المجموعة",
		guide: {
			vi: "   {pn} [add | -a] <nội quy muốn thêm>: thêm nội quy cho nhóm."
				+ "\n   {pn}: xem nội quy của nhóm."
				+ "\n   {pn} [edit | -e] <n> <nội dung sau khi sửa>: chỉnh sửa lại nội quy thứ n."
				+ "\n   {pn} [move | -m] <stt1> <stt2> hoán đổi vị trí của nội quy thứ <stt1> và <stt2> với nhau."
				+ "\n   {pn} [delete | -d] <n>: xóa nội quy theo số thứ tự thứ n."
				+ "\n   {pn} [remove | -r]: xóa tất cả nội quy của nhóm."
				+ "\n"
				+ "\n   Ví dụ:"
				+ "\n    {pn} add không spam"
				+ "\n    {pn} move 1 3"
				+ "\n    {pn} -e 1 không spam tin nhắn trong nhóm"
				+ "\n    {pn} -r",
			en: "   قواعد [أضف | -a] <القانون>: إضافة قانون جديد"
				+ "\n   قواعد: رؤية قواعد المجموعة"
				+ "\n   قواعد [عدل | -e] <رقم> <إستبدل القانون>: تعديل القانون برقم."
				+ "\n   قواعد [غيرمكان | -m] <2> <1> تغيير القاعدة 1 بمكان القاعدة رقم 2 <1> و <2>."
				+ "\n   قواعد [احذف | -d] <رقم>: حذف قانون رقم."
				+ "\n   قواعد [احذففف | -r]: حذف كل القوانين ."
				+ "\n"
				+ "\n   مثال:"
				+ "\n    قواعد اضف ممنوع سب البوت"
				+ "\n    قواعد غيرمكان 1 3"
				+ "\n    قواعد احذف 5"
				+ "\n    قواعد احذففف"
		}
	},

	langs: {
		vi: {
			yourRules: "Nội quy của nhóm bạn\n%1",
			noRules: "Hiện tại nhóm bạn chưa có bất kỳ nội quy nào, để thêm nội quy cho nhóm hãy sử dụng `%1rules add`",
			noPermissionAdd: "Chỉ quản trị viên mới có thể thêm nội quy cho nhóm",
			noContent: "Vui lòng nhập nội dung cho nội quy bạn muốn thêm",
			success: "Đã thêm nội quy mới cho nhóm thành công",
			noPermissionEdit: "Chỉ quản trị viên mới có thể chỉnh sửa nội quy nhóm",
			invalidNumber: "Vui lòng nhập số thứ tự của quy định bạn muốn chỉnh sửa",
			rulesNotExist: "Không tồn tại nội quy thứ %1",
			numberRules: "Hiện tại nhóm bạn chỉ có %1 nội quy được đặt ra",
			noContentEdit: "Vui lòng nhập nội dung bạn muốn thay đổi cho nội quy thứ %1",
			successEdit: "Đã chỉnh sửa nội quy thứ %1 thành: %2",
			noPermissionMove: "Chỉ quản trị viên mới có thể đổi vị trí nội quy của nhóm",
			invalidNumberMove: "Vui lòng nhập số thứ tự của 2 nội quy nhóm bạn muốn chuyển đổi vị trí với nhau",
			rulesNotExistMove2: "Không tồn tại nội quy thứ %1 và %2",
			successMove: "Đã chuyển đổi vị trí của 2 nội quy thứ %1 và %2",
			noPermissionDelete: "Chỉ quản trị viên mới có thể xóa nội quy của nhóm",
			invalidNumberDelete: "Vui lòng nhập số thứ tự của nội quy bạn muốn xóa",
			rulesNotExistDelete: "Không tồn tại nội quy thứ %1",
			successDelete: "Đã xóa nội quy thứ %1 của nhóm, nội dung: %2",
			noPermissionRemove: "Chỉ có quản trị viên nhóm mới có thể xoá bỏ tất cả nội quy của nhóm",
			confirmRemove: "⚠️ Thả cảm xúc bất kỳ vào tin nhắn này để xác nhận xóa toàn bộ nội quy của nhóm",
			successRemove: "Đã xóa toàn bộ nội quy của nhóm thành công",
			invalidNumberView: "Vui lòng nhập số thứ tự của nội quy bạn muốn xem"
		},
		en: {
			yourRules: "❤️ قواعد المجموعة ❤️\n%1\nلاتخالف يا من تقرأ هذا كي لا تودع 🗿❤️",
			noRules: "لا تملكون قواعد أكتب `%1قواعد أضف [القاعدة]`",
			noPermissionAdd: "فقط الأدمن يضيف قواعد للمجموعة. أنت روح ضيف في المطبخ 😂",
			noContent: "أدخل القاعدة لو سمحت",
			success: "تم إضافة قانون جديد ✅",
			noPermissionEdit: "أنت لست أدمن 🌝💔😬❌",
			invalidNumber: "أدخل رقم القاعدة التي تريد تعديلها",
			rulesNotExist: "القاعدة رقم %1 غير موجودة هنا روح ضيف لك وحدة بهذا الرقم في المطبخ 😂❌",
			numberRules: "المجموعة فيها %1 قانون فقط",
			noContentEdit: "أدخل القانون الذي تعدل به هذا القانون : %1",
			successEdit: "تعديل القاعدة رقم %1 إلى: %2",
			noPermissionMove: "عالمطبخ ياحبيبي سوي أي شي بقوانينه هناك 🙂✅ أنت مش أدمن هنا",
			invalidNumberMove: "أدخل قانونين تريد تغيير تبديل أماكنهما",
			rulesNotExistMove2: "من وين جبت القواعد رقم %1 و %2 ؟؟",
			successMove: "تم تغيير أماكن القوانين %1 و %2",
			noPermissionDelete: "قوانيننا لا يحذفها الأعضاء ❌",
			invalidNumberDelete: "أدخل رقم القاعدة التي تريد حذفها ✅",
			rulesNotExistDelete: "القاعدة رقم %1 ليست موجودة 🙂😬",
			successDelete: "حذف القانون رقم %1 للمجموعة, الذي يقول: %2",
			noPermissionRemove: "من أنت لتحذف القوانين كلها بدك طرد يا عضو 😬❌",
			confirmRemove: "⚠️ نظرا للجفاف العاطفي سوي قلب لهذه الرسالة كي أحذف كل القواعد 🥹🥹",
			successRemove: "تم وشكرا على القلب حبي ⁦(っ˘з(˘⌣˘ )⁩",
			invalidNumberView: "أدخل رقم القاعدة التي تريد رؤيتها ✅"
		}
	},

	onStart: async function ({ role, args, message, event, threadsData, getLang, commandName }) {
		const { threadID, senderID } = event;

		const type = args[0];
		const rulesOfThread = await threadsData.get(threadID, "data.rules", []);
		const totalRules = rulesOfThread.length;

		if (!type) {
			let i = 1;
			const msg = rulesOfThread.reduce((text, rules) => text += `${i++}. ${rules}\n`, "");
			message.reply(msg ? getLang("yourRules", msg) : getLang("noRules", getPrefix(threadID)), (err, info) => {
				global.GoatBot.onReply.set(info.messageID, {
					commandName,
					author: senderID,
					rulesOfThread,
					messageID: info.messageID
				});
			});
		}
		else if (["اضف", "-a"].includes(type)) {
			if (role < 1)
				return message.reply(getLang("noPermissionAdd"));
			if (!args[1])
				return message.reply(getLang("noContent"));
			rulesOfThread.push(args.slice(1).join(" "));
			try {
				await threadsData.set(threadID, rulesOfThread, "data.rules");
				message.reply(getLang("success"));
			}
			catch (err) {
				message.err(err);
			}
		}
		else if (["عدل", "-e"].includes(type)) {
			if (role < 1)
				return message.reply(getLang("noPermissionEdit"));
			const stt = parseInt(args[1]);
			if (stt === NaN)
				return message.reply(getLang("invalidNumber"));
			if (!rulesOfThread[stt - 1])
				return message.reply(`${getLang("rulesNotExist", stt)}, ${totalRules == 0 ? getLang("noRules") : getLang("numberRules", totalRules)}`);
			if (!args[2])
				return message.reply(getLang("noContentEdit", stt));
			const newContent = args.slice(2).join(" ");
			rulesOfThread[stt - 1] = newContent;
			try {
				await threadsData.set(threadID, rulesOfThread, "data.rules");
				message.reply(getLang("successEdit", stt, newContent));
			}
			catch (err) {
				message.err(err);
			}
		}
		else if (["غيرمكان", "-m"].includes(type)) {
			if (role < 1)
				return message.reply(getLang("noPermissionMove"));
			const stt1 = parseInt(args[1]);
			const stt2 = parseInt(args[2]);
			if (isNaN(stt1) || isNaN(stt2))
				return message.reply(getLang("invalidNumberMove"));
			if (!rulesOfThread[stt1 - 1] || !rulesOfThread[stt2 - 1]) {
				let msg = !rulesOfThread[stt1 - 1] ?
					!rulesOfThread[stt2 - 1] ?
						message.reply(getLang("rulesNotExistMove2", stt1, stt2)) :
						message.reply(getLang("rulesNotExistMove", stt1)) :
					message.reply(getLang("rulesNotExistMove", stt2));
				msg += `, ${totalRules == 0 ? getLang("noRules") : getLang("numberRules", totalRules)}`;
				return message.reply(msg);
			}
			// swap
			[rulesOfThread[stt1 - 1], rulesOfThread[stt2 - 1]] = [rulesOfThread[stt2 - 1], rulesOfThread[stt1 - 1]];
			try {
				await threadsData.set(threadID, rulesOfThread, "data.rules");
				message.reply(getLang("successMove"));
			}
			catch (err) {
				message.err(err);
			}
		}
		else if (["احذف", "del", "-d"].includes(type)) {
			if (role < 1)
				return message.reply(getLang("noPermissionDelete"));
			if (!args[1] || isNaN(args[1]))
				return message.reply(getLang("invalidNumberDelete"));
			const rulesDel = rulesOfThread[parseInt(args[1]) - 1];
			if (!rulesDel)
				return message.reply(`${getLang("rulesNotExistDelete", args[1])}, ${totalRules == 0 ? getLang("noRules") : getLang("numberRules", totalRules)}`);
			rulesOfThread.splice(parseInt(args[1]) - 1, 1);
			await threadsData.set(threadID, rulesOfThread, "data.rules");
			message.reply(getLang("successDelete", args[1], rulesDel));
		}
		else if (["احذففف", "reset", "-r", "-rm"].includes(type)) {
			if (role < 1)
				return message.reply(getLang("noPermissionRemove"));
			message.reply(getLang("confirmRemove"), (err, info) => {
				global.GoatBot.onReaction.set(info.messageID, {
					commandName: "rules",
					messageID: info.messageID,
					author: senderID
				});
			});
		}
		else if (!isNaN(type)) {
			let msg = "";
			for (const stt of args) {
				const rules = rulesOfThread[parseInt(stt) - 1];
				if (rules)
					msg += `${stt}. ${rules}\n`;
			}
			if (msg == "")
				return message.reply(`${getLang("rulesNotExist", type)}, ${totalRules == 0 ? getLang("noRules") : getLang("numberRules", totalRules)}`);
			message.reply(msg);
		}
		else {
			message.SyntaxError();
		}
	},

	onReply: async function ({ message, event, getLang, Reply }) {
		const { author, rulesOfThread } = Reply;
		if (author != event.senderID)
			return;
		const num = parseInt(event.body || "");
		if (isNaN(num) || num < 1)
			return message.reply(getLang("invalidNumberView"));
		const totalRules = rulesOfThread.length;
		if (num > totalRules)
			return message.reply(`${getLang("rulesNotExist", num)}, ${totalRules == 0 ? getLang("noRules") : getLang("numberRules", totalRules)}`);
		message.reply(`${num}. ${rulesOfThread[num - 1]}`, () => message.unsend(Reply.messageID));
	},

	onReaction: async ({ threadsData, message, Reaction, event, getLang }) => {
		const { author } = Reaction;
		const { threadID, userID } = event;
		if (author != userID)
			return;
		await threadsData.set(threadID, [], "data.rules");
		message.reply(getLang("successRemove"));
	}
};
