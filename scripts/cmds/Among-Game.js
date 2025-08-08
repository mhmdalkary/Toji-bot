/**
 * امونغ - لعبة Among Us نصية لبوت GoatBot (Messenger)
 * Author: SIFOANTER / مُعدّ لمحمد
 *
 * أوامر:
 *   .امونغ start         -> ينشئ لُجَن ويصبح المرسل Host
 *   .امونغ join          -> ينضم اللاعب إلى اللُجَن
 *   .امونغ begin         -> يبدأ Host اللعبة (بعد 4 لاعبين على الأقل)
 *   .امونغ kill <id>     -> للمحتال فقط، يُرسل في الخاص (api.sendMessage) لاختيار هدف القتل
 *   .امونغ task <text>   -> لإكمال المهمة السريعة (في جولات المهام)
 *   .امونغ vote <id>     -> للتصويت لطرد شخص في الجروب
 *   .امونغ status        -> يطبع حالة اللعبة
 *   .امونغ end           -> ينهى اللعبة (Host فقط)
 *
 * ملاحظات تقنية:
 *   - يخزن حالة اللعبة في globalModel (خاص بكل thread).
 *   - يرسل أدوار السرية في رسالة خاصة لكل لاعب.
 *   - مصمم ليدعم عدة جروبات بنفس الوقت.
 */

module.exports = {
	config: {
		name: "امونغ",
		version: "1.0",
		author: "SIFOANTER",
		countDown: 5,
		role: 0,
		shortDescription: {
			ar: "لعبة Among Us نصية (للمجموعات)"
		},
		description: {
			ar: "لعبة جماعية نصية مستوحاة من Among Us: انضم، ابدأ، اقضِ على الأعداء أو اكشف المحتالين."
		},
		category: "games",
		guide: {
			ar: "استخدم: .امونغ start | join | begin | kill <id> | task <txt> | vote <id> | status | end"
		}
	},

	langs: {
		ar: {
			lobbyCreated: "🚀 تم إنشاء لُجَن لعبة Among Us! %1 هو المضيف. اكتب `.امونغ join` للانضمام.",
			alreadyInLobby: "أنت بالفعل داخل اللُجَن.",
			notInLobby: "أنت لست داخل أي لُجَن الآن. اكتب `.امونغ start` لإنشاء واحد أو `.امونغ join` للانضمام.",
			joined: "✅ %1 انضم إلى اللُجَن! الآن %2 لاعب(ين).",
			notHost: "❗ هذا الأمر محجوز للمُضيف (Host) فقط.",
			minPlayers: "✋ لازم يكون على الأقل 4 لاعبين قبل ما تبدأ اللعبة.",
			started: "🎬 بدء اللعبة! توزعت الأدوار ... تحقق من رسائل الخاص.",
			roleCrew: "🛠 دورك: *طاقم السفينة* — أكمل المهمات واكشف المحتال!",
			roleImpostor: "🔪 دورك: *المحتال* — اقتل بدون أن يكتشفك أحد. استخدم `.امونغ kill <id>` في الخاص مع البوت.",
			privateSent: "تم إرسال دورك في الخاص.",
			alreadyStarted: "اللعبة جارية بالفعل في هذه المجموعة.",
			notStarted: "لا توجد لعبة جارية الآن. ابدأ واحد بـ `.امونغ start` أو انضم.",
			invalidTarget: "المستخدم الهدف غير صالح أو غير موجود في اللعبة أو ميت.",
			killSuccess: "💀 تم القضاء على %1. تم تسجيل الواقعة؛ الآن دور التصويت.",
			taskPrompt: "⏳ مهمة سريعة: اكتب `%1` بسرعة في الشات العام أولًا.",
			taskCompleted: "🎉 %1 أنجز المهمة أولًا! مكافأة للطاقة/نقطة للفريق.",
			votePrompt: "🗳️ حان وقت التصويت! اكتب `.امونغ vote <id>` لتصويتك.",
			voteCount: "📊 صوت %1 ضد %2 (إجمالي أصوات: %3).",
			outPlayer: "🚪 %1 تم طرده من اللعبة (%2 أصوات).",
			gameEndCrewWin: "🏆 انتهت اللعبة — الطاقم فاز! تم القضاء على جميع المحتالين.",
			gameEndImpostorWin: "☠️ انتهت اللعبة — المحتالين فازوا! عدد الطاقم مساوي أو أقل من المحتالين.",
			statusText: "📍 حالة اللعبة:\n• Host: %1\n• اللاعبين (%2):\n%3\n• مرحلة: %4\n• جولة: %5",
			noLobbyToEnd: "لا توجد لعبة لإنهائها هنا.",
			endedByHost: "⚠️ أنهى المضيف اللعبة يدويًا.",
			alreadyJoinedLobby: "أنت بالفعل داخل هذه اللُجن أو في لعبة جارية.",
			needMention: "اكتب المعرف (ID) للشخص أو اشر إليه بالتاج.",
			cantVoteSelf: "لا يمكنك التصويت على نفسك.",
			aliveOnly: "يمكن فقط للأحياء التصويت أو القيام بمهام.",
			noPermission: "ليس لديك صلاحية لتنفيذ هذا الأمر."
		}
	},

	onStart: async function ({ api, args, message, event, threadsData, usersData, globalModel, getLang }) {
		/* Helper functions */
		const threadID = event.threadID;
		const senderID = event.senderID;
		const text = args.join(" ").trim();

		// Get or init global thread game state
		let games = (await globalModel.get("amongus_games")) || {};
		if (!games[threadID]) games[threadID] = null; // null means no lobby
		let game = games[threadID];

		// Utility: save games back
		const saveGames = async () => {
			await globalModel.set("amongus_games", games);
		};

		// Utility: resolve mention or id from args (simple)
		const resolveIdFromArg = (arg) => {
			// if mention like @123 or plain id
			if (!arg) return null;
			arg = arg.replace(/[<@> ]/g, "");
			if (/^\d+$/.test(arg)) return arg;
			return null;
		};

		// Utility: get user name (async)
		const getName = async (id) => {
			try {
				const user = await usersData.get(id);
				if (user && user.name) return user.name;
			} catch (e) {}
			// fallback: event.senderName when available
			return `${id}`;
		};

		// Create a new lobby
		if (text === "start") {
			if (game && game.running) return message.reply(getLang("alreadyStarted"));
			// If lobby exists and not started, allow re-creation only by host
			if (game && game.host && game.players.some(p => p.id == senderID)) {
				return message.reply(getLang("alreadyInLobby"));
			}

			const hostName = event.senderName || await getName(senderID);
			game = {
				running: false,
				host: senderID,
				hostName,
				players: [{ id: senderID, name: hostName, role: null, alive: true }],
				impostors: [],
				round: 0,
				phase: "lobby",
				votes: {}, // voterId: targetId
				taskWord: null,
				taskWinner: null
			};
			games[threadID] = game;
			await saveGames();
			return message.reply(getLang("lobbyCreated", hostName));
		}

		// Join lobby
		if (text === "join") {
			if (!game) {
				return message.reply(getLang("notInLobby"));
			}
			if (game.running) return message.reply(getLang("alreadyStarted"));
			// check already in
			if (game.players.some(p => p.id == senderID)) return message.reply(getLang("alreadyJoinedLobby"));
			const name = event.senderName || await getName(senderID);
			game.players.push({ id: senderID, name, role: null, alive: true });
			await saveGames();
			return message.reply(getLang("joined", name, game.players.length));
		}

		// End lobby / game (Host only)
		if (text === "end") {
			if (!game) return message.reply(getLang("noLobbyToEnd"));
			if (game.host != senderID) return message.reply(getLang("notHost"));
			games[threadID] = null;
			await saveGames();
			return message.reply(getLang("endedByHost"));
		}

		// Status
		if (text === "status") {
			if (!game) return message.reply(getLang("notStarted"));
			const playersList = game.players.map(p => `- ${p.name} [${p.alive ? "حي" : "ميت"}]`).join("\n");
			return message.reply(getLang("statusText", game.hostName, game.players.length, playersList, game.phase, game.round));
		}

		// Begin game (host)
		if (text === "begin") {
			if (!game) return message.reply(getLang("notInLobby"));
			if (game.host != senderID) return message.reply(getLang("notHost"));
			if (game.running) return message.reply(getLang("alreadyStarted"));
			if (game.players.length < 4) return message.reply(getLang("minPlayers"));

			// Setup roles
			const players = game.players;
			const numPlayers = players.length;
			// impostors count: 1 per 4-6 players, 2 if >=7
			let impostorCount = 1;
			if (numPlayers >= 7) impostorCount = 2;
			// pick impostors randomly
			const shuffled = players.slice().sort(() => Math.random() - 0.5);
			const impostors = shuffled.slice(0, impostorCount).map(p => p.id);
			game.impostors = impostors;
			game.running = true;
			game.phase = "inGame";
			game.round = 1;
			// assign roles to players array
			game.players = players.map(p => {
				if (impostors.includes(p.id)) return { ...p, role: "impostor", alive: true };
				else return { ...p, role: "crew", alive: true };
			});
			await saveGames();

			// send private roles
			for (const pl of game.players) {
				if (pl.role === "impostor") {
					// tell impostor who are their fellow impostors too (if more than 1)
					let fellow = game.impostors.filter(id => id !== pl.id);
					let fellowNames = [];
					for (const f of fellow) fellowNames.push((await getName(f)) || f);
					const msg = `${getLang("roleImpostor")}\n${fellowNames.length ? "رفقاءك المحتالون: " + fellowNames.join(", ") : ""}`;
					try {
						await api.sendMessage(msg, pl.id);
					} catch (e) {
						// best effort
					}
				} else {
					try {
						await api.sendMessage(getLang("roleCrew"), pl.id);
					} catch (e) {}
				}
			}

			// Announce start in thread
			await message.reply(getLang("started"));
			// trigger first round: choose randomly task or night (kill)
			await proceedRound(api, threadID, games, saveGames, getLang);
			return;
		}

		// Kill command (private) -> for impostor to choose target
		if (text.startsWith("kill")) {
			// This command should be sent in private (1:1) to the bot
			// However sometimes it's sent in group; we support both but require that sender is impostor in game
			if (!game || !game.running) return message.reply(getLang("notStarted"));
			// find player object
			const player = game.players.find(p => p.id == senderID);
			if (!player) return message.reply(getLang("notInLobby"));
			if (!player.alive) return message.reply(getLang("aliveOnly"));
			if (player.role !== "impostor") return message.reply(getLang("noPermission"));
			// parse target id
			const targetArg = args[1] || args[0]; // in private, args[0] might be id, but user might write "kill 123"
			const targetId = resolveIdFromArg(targetArg);
			if (!targetId) return message.reply(getLang("needMention"));
			// check target is valid
			const target = game.players.find(p => p.id == targetId);
			if (!target || !target.alive) return message.reply(getLang("invalidTarget"));
			// kill target
			target.alive = false;
			await saveGames();
			// announce in thread (death found -> go vote)
			const targetName = target.name;
			await api.sendMessage(getLang("killSuccess", targetName), threadID);
			// after kill, move to voting phase
			game.phase = "voting";
			game.votes = {}; // reset votes
			await saveGames();
			await api.sendMessage(getLang("votePrompt"), threadID);
			return;
		}

		// Task submission (for quick tasks)
		if (text.startsWith("task")) {
			if (!game || !game.running) return message.reply(getLang("notStarted"));
			// check alive
			const pl = game.players.find(p => p.id == senderID);
			if (!pl) return message.reply(getLang("notInLobby"));
			if (!pl.alive) return message.reply(getLang("aliveOnly"));
			// if no active task, ignore
			if (!game.taskWord) return message.reply("لا توجد مهمة حالية. انتظر جولة المهام.");
			const submission = args.slice(1).join(" ").trim();
			// if user typed exactly taskWord -> complete
			if (submission === game.taskWord) {
				// first completer wins reward
				if (!game.taskWinner) {
					game.taskWinner = senderID;
					await saveGames();
					await api.sendMessage(getLang("taskCompleted", pl.name), threadID);
					// reset task and proceed to next round after a small pause
					game.taskWord = null;
					game.taskWinner = null;
					game.round++;
					await saveGames();
					// proceed next
					await proceedRound(api, threadID, games, saveGames, getLang);
					return;
				} else {
					return message.reply("تمت مهمة هذه الجولة من قبل لاعب آخر.");
				}
			} else {
				return message.reply("ليس هذا النص الصحيح. حاول مرة أخرى إذا سمحت.");
			}
		}

		// Vote
		if (text.startsWith("vote")) {
			if (!game || !game.running) return message.reply(getLang("notStarted"));
			// only alive can vote
			const pl = game.players.find(p => p.id == senderID);
			if (!pl) return message.reply(getLang("notInLobby"));
			if (!pl.alive) return message.reply(getLang("aliveOnly"));
			// parse target id
			const targetArg = args[1] || args[0];
			const targetId = resolveIdFromArg(targetArg);
			if (!targetId) return message.reply(getLang("needMention"));
			if (targetId == senderID) return message.reply(getLang("cantVoteSelf"));
			const target = game.players.find(p => p.id == targetId);
			if (!target) return message.reply(getLang("invalidTarget"));
			// register vote
			game.votes[senderID] = targetId;
			await saveGames();

			// compute counts
			const counts = {};
			for (const v of Object.values(game.votes)) counts[v] = (counts[v] || 0) + 1;
			// announce vote count for this target
			const countForTarget = counts[targetId] || 0;
			await api.sendMessage(getLang("voteCount", (await getName(senderID)), target.name, countForTarget), threadID);

			// check if majority reached (more than half of alive players)
			const aliveCount = game.players.filter(p => p.alive).length;
			let maxEntry = null;
			for (const tId in counts) {
				const c = counts[tId];
				if (!maxEntry || c > maxEntry.count) maxEntry = { id: tId, count: c };
			}
			if (maxEntry && maxEntry.count > Math.floor(aliveCount / 2)) {
				// execute exile
				const exId = maxEntry.id;
				const exPlayer = game.players.find(p => p.id == exId);
				if (exPlayer) {
					exPlayer.alive = false;
					await saveGames();
					await api.sendMessage(getLang("outPlayer", exPlayer.name, maxEntry.count), threadID);
					// check win conditions
					const impostorsAlive = game.players.filter(p => p.role === "impostor" && p.alive).length;
					const crewAlive = game.players.filter(p => p.role === "crew" && p.alive).length;
					if (impostorsAlive === 0) {
						// crew win
						await api.sendMessage(getLang("gameEndCrewWin"), threadID);
						games[threadID] = null;
						await saveGames();
						return;
					}
					if (impostorsAlive >= crewAlive) {
						await api.sendMessage(getLang("gameEndImpostorWin"), threadID);
						games[threadID] = null;
						await saveGames();
						return;
					}
					// else continue to next round
					game.votes = {};
					game.round++;
					game.phase = "inGame";
					await saveGames();
					await proceedRound(api, threadID, games, saveGames, getLang);
					return;
				}
			}
			return;
		}

		// If none matched
		return message.reply(getLang("guide"));
	}
};

/**
 * Helper async function outside module.exports to manage rounds (task or kill).
 * We keep it here but it uses the same globalModel store.
 */
async function proceedRound(api, threadID, games, saveGames, getLang) {
	// load game
	let game = games[threadID];
	if (!game || !game.running) return;
	// quick win-check
	const impostorsAlive = game.players.filter(p => p.role === "impostor" && p.alive).length;
	const crewAlive = game.players.filter(p => p.role === "crew" && p.alive).length;
	if (impostorsAlive === 0) {
		await api.sendMessage(getLang("gameEndCrewWin"), threadID);
		games[threadID] = null;
		await saveGames();
		return;
	}
	if (impostorsAlive >= crewAlive) {
		await api.sendMessage(getLang("gameEndImpostorWin"), threadID);
		games[threadID] = null;
		await saveGames();
		return;
	}

	// Randomly pick round type: task (70%) or impostor kill opportunity (30%)
	const r = Math.random();
	if (r < 0.7) {
		// Task round
		game.phase = "task";
		// generate a simple word phrase as a task (2-3 words)
		const words = [
			"كوكب المريخ", "قمر صناعي", "محرك سفينة", "بطارية", "نظام تبريد",
			"لوحة تحكم", "أسلاك", "نظيفة", "تشغيل", "تحقق الآن", "شحنة طاقة"
		];
		const phrase = words[Math.floor(Math.random() * words.length)];
		game.taskWord = phrase;
		game.taskWinner = null;
		await saveGames();
		await api.sendMessage(getLang("taskPrompt", phrase), threadID);
		// NOTE: players must type `.امونغ task <phrase>` exactly to complete.
	} else {
		// Impostor kill opportunity (night)
		game.phase = "night";
		await saveGames();
		// prompt impostors (in private) to kill someone
		for (const pl of game.players.filter(p => p.role === "impostor" && p.alive)) {
			let aliveTargets = game.players.filter(p => p.alive && p.id !== pl.id);
			const list = aliveTargets.map(t => `${t.name} => ${t.id}`).join("\n");
			const prompt = `🔪 فرصة قتل — ارسل في الخاص: \`.امونغ kill <id>\`\nالأهداف الممكنة:\n${list}\n\nملاحظة: سيتم إعلان القتل في الشات العام إن نجحت العملية.`;
			try {
				await api.sendMessage(prompt, pl.id);
			} catch (e) {}
		}
		// If impostors don't act, we allow them some time (this relies on users to send command).
		// The game will wait until they issue .امونغ kill <id>.
	}
}