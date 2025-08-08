/**
 * @عربي
 * ملف: multiStory.js
 * وصف: أمر بوت لعرض قائمة قصص وقيادة مغامرات نصية مخزنة في ملف stories.json
 * تذكر: ضع ملف stories.json في نفس المجلد.
 */

const fs = require('fs');
const path = require('path');

module.exports = {
	config: {
		name: "قصة", // اسم الأمر
		version: "1.0",
		author: "SIFOANTER",
		countDown: 5,
		role: 0,
		shortDescription: {
			ar: "اختيار وتشغيل عدة قصص مغامرات نصية",
			en: "Play multiple text adventure stories"
		},
		description: {
			ar: "أمر يدير عدة قصص نصية مخزنة في ملف JSON. ابدأ، اختر رقم القصة، وتابع الاختيارات بالأرقام.",
			en: "Manage multiple text adventure stories stored in a JSON file."
		},
		category: "العاب",
		guide: {
			ar: "اكتب الأمر لعرض قائمة القصص. بعد اختيار رقم القصة، أرسل رقم الخيار داخل كل مشهد.\nأوامر مفيدة: 'قائمة' لإعادة عرض القصص، 'إيقاف' للخروج من اللعبة.",
			en: "Type the command to show stories list. Send a number to choose options in scenes."
		}
	},

	langs: {
		ar: {
			startWelcome: "مرحبا بك في عالم المغامرات! اختر رقم القصة لتبدأ:\n\n%LIST%\n\nأرسل رقم القصة للبدء أو اكتب 'قائمة' لاحقًا لإعادة العرض.",
			invalidStory: "رقم القصة غير صحيح — أرسل رقمًا من القائمة أو اكتب 'قائمة' لعرضها مجددًا.",
			scenePrompt: "%SCENE_TEXT%\n\n%OPTIONS%\n\nأرسل رقم اختيارك.",
			noOptionsEnd: "وصلت إلى نهاية هذه القصة. اكتب الأمر مجددًا لبدء قصة جديدة أو اكتب 'قائمة' لاختيار قصة أخرى.",
			invalidChoice: "خيار غير صالح. أرسل رقمًا صحيحًا من الخيارات المعروضة.",
			progressSaved: "تم حفظ تقدمك. لإلغاء اللعبة اكتب 'إيقاف'.",
			storyListHeader: "قائمة القصص المتاحة:",
			gameStopped: "تم إيقاف المغامرة وحفظت الحالة (إن وُجدت). اكتب الأمر لبدء من جديد.",
			unknown: "أمر غير مفهوم. أرسل رقم أو اكتب 'قائمة' أو 'إيقاف'."
		},
		en: {
			startWelcome: "Welcome! Choose a story number to start:\n\n%LIST%",
			invalidStory: "Invalid story number.",
			scenePrompt: "%SCENE_TEXT%\n\n%OPTIONS%\n\nSend the number of your choice.",
			noOptionsEnd: "You've reached the end of this story. Use the command to start another.",
			invalidChoice: "Invalid choice. Send a correct option number.",
			progressSaved: "Progress saved. To stop the game send 'stop'.",
			storyListHeader: "Stories available:"
		}
	},

	// حالة اللاعبين (ذاكرة مؤقتة - أعد تشغيل البوت سيُفقد)
	playersState: {},

	// help: load stories.json (يُقرأ عند كل طلب لتمكين التعديل الحي على الملف)
	loadStories() {
		try {
			const filePath = path.resolve(__dirname, 'stories.json');
			const raw = fs.readFileSync(filePath, 'utf8');
			return JSON.parse(raw).stories || {};
		} catch (e) {
			return {};
		}
	},

	// دالة مساعدة لإرسال مشهد للاعب
	async sendScene(api, threadID, story, sceneKey, langStrings) {
		const scene = story.scenes[sceneKey];
		if (!scene) {
			await api.sendMessage(langStrings.invalidChoice, threadID);
			return;
		}

		// إعداد نص الخيارات
		let optionsText = "";
		if (scene.options && scene.options.length > 0) {
			scene.options.forEach((opt, idx) => {
				optionsText += `${idx + 1}. ${opt.text}\n`;
			});
		} else {
			optionsText = ""; // بدون خيارات => نهاية
		}

		let message = langStrings.scenePrompt
			.replace("%SCENE_TEXT%", scene.text)
			.replace("%OPTIONS%", optionsText);

		// لو ما في خيارات نعطي رسالة نهاية
		if (!scene.options || scene.options.length === 0) {
			message = scene.text + "\n\n" + langStrings.noOptionsEnd;
		}

		await api.sendMessage(message, threadID);
	},

	// تنفيذ الأمر: يعرض قائمة القصص
	onStart: async function ({ api, event, getLang }) {
		const userLang = (getLang ? 'ar' : 'ar'); // نستخدم العربية فقط هنا افتراضيًا
		const stories = this.loadStories();

		// بناء قائمة القصص
		let listText = "";
		for (const key of Object.keys(stories)) {
			const t = stories[key].title || `قصة ${key}`;
			listText += `${key}. ${t}\n`;
		}
		const langStrings = this.langs.ar;

		const welcome = langStrings.startWelcome.replace("%LIST%", listText);
		// حفظ حالة اللاعب: في وضع اختيار القصة
		this.playersState[event.senderID] = { stage: "chooseStory" };

		await api.sendMessage(welcome, event.threadID);
	},

	// استقبال رسائل المستخدم أثناء اللعبة
	onMessage: async function ({ api, event }) {
		const userId = event.senderID;
		const threadID = event.threadID;
		const body = (event.body || "").trim();

		// تحميل القصص في كل مرة (يسمح بتعديل JSON بدون إعادة تشغيل)
		const stories = this.loadStories();
		const langStrings = this.langs.ar;

		// أوامر عامة متاحة دائمًا
		if (body.toLowerCase() === "قائمة") {
			// إعادة عرض قائمة القصص
			let listText = "";
			for (const key of Object.keys(stories)) {
				const t = stories[key].title || `قصة ${key}`;
				listText += `${key}. ${t}\n`;
			}
			await api.sendMessage(langStrings.startWelcome.replace("%LIST%", listText), threadID);
			// وضع اللاعب ينتظر اختيار القصة
			this.playersState[userId] = { stage: "chooseStory" };
			return;
		}

		if (body === "إيقاف" || body.toLowerCase() === "stop") {
			delete this.playersState[userId];
			await api.sendMessage(langStrings.gameStopped, threadID);
			return;
		}

		// هل اللاعب مسجل في حالة؟
		if (!this.playersState[userId]) {
			// لم يبدأ اللعبة - نطالب بعرض القائمة
			await api.sendMessage(langStrings.startWelcome.replace("%LIST%", Object.keys(stories).map(k => `${k}. ${stories[k].title}`).join("\n")), threadID);
			this.playersState[userId] = { stage: "chooseStory" };
			return;
		}

		const state = this.playersState[userId];

		// المرحلة: اختيار القصة
		if (state.stage === "chooseStory") {
			// توقع رقم القصة
			if (!stories[body]) {
				await api.sendMessage(langStrings.invalidStory, threadID);
				return;
			}
			// احفظ القصة المختارة وابدأ عند المشهد 'start'
			this.playersState[userId] = {
				stage: "inStory",
				storyId: body,
				sceneId: "start",
				history: ["start"]
			};

			// إرسال المشهد الأول
			const story = stories[body];
			await this.sendScene(api, threadID, story, "start", langStrings);
			return;
		}

		// المرحلة: داخل القصة
		if (state.stage === "inStory") {
			const story = stories[state.storyId];
			if (!story) {
				await api.sendMessage(langStrings.invalidStory, threadID);
				delete this.playersState[userId];
				return;
			}
			const scene = story.scenes[state.sceneId];
			if (!scene) {
				await api.sendMessage(langStrings.invalidChoice, threadID);
				return;
			}

			// لو المشهد ليس له خيارات => نهاية
			if (!scene.options || scene.options.length === 0) {
				await api.sendMessage(langStrings.noOptionsEnd, threadID);
				delete this.playersState[userId];
				return;
			}

			// نحاول تحويل المدخل لرقم
			const choiceNum = parseInt(body, 10);
			if (isNaN(choiceNum) || choiceNum < 1 || choiceNum > scene.options.length) {
				// رسائل إضافية: 'رجوع' للعودة للمشهد السابق
				if (body === "رجوع") {
					// ارجع مشهد واحد في التاريخ إن وجد
					if (state.history && state.history.length > 1) {
						state.history.pop(); // احذف آخر
						const prev = state.history[state.history.length - 1];
						state.sceneId = prev;
						this.playersState[userId] = state;
						await this.sendScene(api, threadID, story, prev, langStrings);
						return;
					} else {
						await api.sendMessage(langStrings.invalidChoice + " (لا يوجد مشهد سابق).", threadID);
						return;
					}
				}

				await api.sendMessage(langStrings.invalidChoice, threadID);
				return;
			}

			// تحقق واختر المشهد التالي
			const chosen = scene.options[choiceNum - 1];
			const nextKey = chosen.next;
			if (!nextKey || !story.scenes[nextKey]) {
				await api.sendMessage(langStrings.invalidChoice, threadID);
				return;
			}

			// حدّث الحالة وحفظ التاريخ
			state.sceneId = nextKey;
			if (!state.history) state.history = [];
			state.history.push(nextKey);
			this.playersState[userId] = state;

			// أرسل المشهد الجديد
			await this.sendScene(api, threadID, story, nextKey, langStrings);
			return;
		}

		// خلاف ذلك: رد عام
		await api.sendMessage(langStrings.unknown, threadID);
	}
};