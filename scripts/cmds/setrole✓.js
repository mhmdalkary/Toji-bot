module.exports = {
	config: {
		name: "صلاحية",
		version: "1.3",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		shortDescription: {
			vi: "Chỉnh sửa role của lệnh",
			ar: "تغيير من يمكنه إستعمال امر في مجموعتك"
		},
		longDescription: {
			vi: "Chỉnh sửa role của lệnh (những lệnh có role < 2)",
			ar: "تعديل صلاحية اوامر ادمن المجموعة و المستخدم فقط 😐"
		},
		category: "إدارة المجموعة",
		guide: {
			vi: "   {pn} <commandName> <new role>: set role mới cho lệnh"
				+ "\n   Với:"
				+ "\n   + <commandName>: tên lệnh"
				+ "\n   + <new role>: role mới của lệnh với:"
				+ "\n   + <new role> = 0: lệnh có thể được sử dụng bởi mọi thành viên trong nhóm"
				+ "\n   + <new role> = 1: lệnh chỉ có thể được sử dụng bởi quản trị viên"
				+ "\n   + <new role> = default: reset role lệnh về mặc định"
				+ "\n   Ví dụ:"
				+ "\n    {pn} rank 1: (lệnh rank sẽ chỉ có thể được sử dụng bởi quản trị viên)"
				+ "\n    {pn} rank 0: (lệnh rank sẽ có thể được sử dụng bởi mọi thành viên trong nhóm)"
				+ "\n    {pn} rank default: reset về mặc định"
				+ "\n—————"
				+ "\n   {pn} [viewrole|view|show]: xem role của những lệnh đã chỉnh sửa",
			ar: "   صلاحية «اسم الأمر» 1[يصير لأدمن المجموعة فقط] 0 [يصير للكل مثلا لو وضعت طرد 0 سيصير الكل يطرد بالبوت😐]"
			
				+ "\n   مثال:"
				+ "\n    صلاحية ردود 1: (يصير فقط)"
				+ "\n    صلاحية طرد 0: (يصير 😂)"
				+ "\n    صلاحية طبيعية: يصير مثل اعدادات نضام البوت"
				+ "\n—————"
				+ "\n   صلاحية [رؤيةصلاحيات|رؤية|عرض]: رؤية تعديلات مجموعتك"
		}
	},

	langs: {
		vi: {
			noEditedCommand: "✅ Hiện tại nhóm bạn không có lệnh nào được chỉnh sửa role",
			editedCommand: "⚠️ Những lệnh trong nhóm bạn đã chỉnh sửa role:\n",
			noPermission: "❗ Chỉ có quản trị viên mới có thể thực hiện lệnh này",
			commandNotFound: "Không tìm thấy lệnh \"%1\"",
			noChangeRole: "❗ Không thể thay đổi role của lệnh \"%1\"",
			resetRole: "Đã reset role của lệnh \"%1\" về mặc định",
			changedRole: "Đã thay đổi role của lệnh \"%1\" thành %2"
		},
		en: {
			noEditedCommand: "✅ مجموعتك لم تعدل أي أمر",
			editedCommand: "⚠️مجموعتك عدلت أوامر:\n",
			noPermission: "❗روح عدل قوانين المطبخ أو أطلب رتبة أدمن من الأدمن يا عضو 🌝",
			commandNotFound: "أمر \"%1\" غير معثور عليه",
			noChangeRole: "❗ ما تقدر تغير صلاحية \"%1\"",
			resetRole: "تم تغيير صلاحية أوامر \"%1\" كنظام البوت",
			changedRole: "تغيير صلاحية \"%1\" إلى %2"
		}
	},

	onStart: async function ({ message, event, args, role, threadsData, getLang }) {
		const { commands, aliases } = global.GoatBot;
		const setRole = await threadsData.get(event.threadID, "data.setRole", {});

		if (["view", "viewrole", "show"].includes(args[0])) {
			if (!setRole || Object.keys(setRole).length === 0)
				return message.reply(getLang("noEditedCommand"));
			let msg = getLang("editedCommand");
			for (const cmd in setRole) msg += `- ${cmd} => ${setRole[cmd]}\n`;
			return message.reply(msg);
		}

		let commandName = (args[0] || "").toLowerCase();
		let newRole = args[1];
		if (!commandName || (isNaN(newRole) && newRole !== "default"))
			return message.SyntaxError();
		if (role < 1)
			return message.reply(getLang("noPermission"));

		const command = commands.get(commandName) || commands.get(aliases.get(commandName));
		if (!command)
			return message.reply(getLang("commandNotFound", commandName));
		commandName = command.config.name;
		if (command.config.role > 1)
			return message.reply(getLang("noChangeRole", commandName));

		let Default = false;
		if (newRole === "default" || newRole == command.config.role) {
			Default = true;
			newRole = command.config.role;
		}
		else {
			newRole = parseInt(newRole);
		}

		setRole[commandName] = newRole;
		if (Default)
			delete setRole[commandName];
		await threadsData.set(event.threadID, setRole, "data.setRole");
		message.reply("✅ " + (Default === true ? getLang("resetRole", commandName) : getLang("changedRole", commandName, newRole)));
	}
};
