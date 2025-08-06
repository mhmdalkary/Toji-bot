const questions = [
  { q: "ما هو العنصر الكيميائي الذي رمزه 'W'؟", a: "التنغستن" },
  { q: "كم عدد العظام في جسم الإنسان البالغ؟", a: "206" },
  { q: "من هو أول من اكتشف قانون الجاذبية؟", a: "نيوتن" },
  { q: "من هو الفيلسوف الذي تتلمذ على يد أفلاطون؟", a: "أرسطو" },
  { q: "ما اسم المجرة التي تقع فيها الأرض؟", a: "درب التبانة" },
  { q: "كم عدد الأعصاب الدماغية؟", a: "12" },
  { q: "ما هو عدد أضلاع الشكل العشاري؟", a: "10" },
  { q: "في أي سنة سقطت الدولة العباسية؟", a: "1258م" },
  { q: "ما هي أكبر بحيرة في العالم من حيث المساحة؟", a: "بحيرة قزوين" },
  { q: "كم يساوي الجذر التكعيبي لـ 512؟", a: "8" },
  { q: "في أي دولة يوجد جبل فوجي؟", a: "اليابان" },
  { q: "من هو العالم الذي وضع جدول العناصر الدوري؟", a: "مندليف" },
  { q: "ما هو اسم أعمق نقطة في المحيطات؟", a: "خندق ماريانا" },
  { q: "من هو الخليفة العباسي الذي أنشأ بيت الحكمة؟", a: "المأمون" },
  { q: "كم عدد كواكب المجموعة الشمسية التي لها أقمار؟", a: "6" },
  { q: "ما هو أصغر كوكب في النظام الشمسي؟", a: "عطارد" },
  { q: "ما اسم أقرب نجم إلى الأرض بعد الشمس؟", a: "بروكسيما سنتوري" },
  { q: "كم عدد الثواني في اليوم الواحد؟", a: "86400" },
  { q: "من هو أول من وضع النظرية النسبية؟", a: "آينشتاين" },
  { q: "كم لترًا من الدم يضخه القلب في الدقيقة؟", a: "حوالي 5 لترات" },
  { q: "من هو أول من طبع القرآن الكريم؟", a: "فليشر الألماني" },
  { q: "ما هو الحيوان الذي يمتلك ثلاثة قلوب؟", a: "الأخطبوط" },
  { q: "من هو أول من مشى على سطح القمر؟", a: "نيل أرمسترونغ" },
  { q: "ما هو العنصر الأكثر وفرة في قشرة الأرض؟", a: "الأوكسجين" },
  { q: "من هو الصحابي الذي هز الكعبة بسيفه؟", a: "الزبير بن العوام" },
  { q: "ما اسم أقصر سورة في القرآن؟", a: "الكوثر" },
  { q: "في أي سنة وقعت معركة بدر؟", a: "2 هـ" },
  { q: "كم عدد الأسنان الدائمة للإنسان؟", a: "32" },
  { q: "من هو الشاعر الذي قتله شعره؟", a: "المتنبي" },
  { q: "ما هو الكوكب الوحيد الذي يدور من الشرق إلى الغرب؟", a: "الزهرة" },
  { q: "كم عدد خلايا الدم الحمراء التي ينتجها الجسم في الثانية؟", a: "حوالي 2.4 مليون" }
];

module.exports = {
  config: {
    name: "حبار",
    version: "3.4",
    author: "Darkxx",
    countDown: 5,
    role: 0,
    shortDescription: "ابدأ لعبة الحبار بعدد معين من اللاعبين",
    longDescription: "لعبة بأسئلة، يتم إقصاء من يخطئ أو يتأخر",
    category: "ألعاب"
  },

  onStart: async function ({ message, event, args }) {
    const threadID = event.threadID;
    const targetPlayers = parseInt(args[0]) || 6;

    if (args[0]?.toLowerCase() === "إنهاء") {
      if (global.GoatBot.squidGame?.[threadID]) {
        delete global.GoatBot.squidGame[threadID];
        return message.reply("✅ تم إنهاء لعبة الحبار.");
      } else {
        return message.reply("⚠️ لا توجد لعبة حالياً.");
      }
    }

    if (targetPlayers < 2 || targetPlayers > 10)
      return message.reply("⚠️ الحد الأدنى 2 والحد الأقصى 10 لاعبين.");

    global.GoatBot.squidGame ??= {};
    if (global.GoatBot.squidGame[threadID])
      return message.reply("⚠️ هناك لعبة جارية بالفعل.");

    global.GoatBot.squidGame[threadID] = {
      players: [],
      data: {},
      turn: null,
      answer: null,
      started: false,
      target: targetPlayers,
      usedQuestions: [],
      asked: []
    };

    await message.reply(`🦑 لعبة الحبار بدأت!\n✋ أرسل "مشارك" للانضمام.\n📨 تبدأ عند وصول ${targetPlayers} لاعبين.`);
  },

  onChat: async function ({ message, event, api, usersData }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const body = event.body?.toLowerCase()?.trim();
    const game = global.GoatBot.squidGame?.[threadID];
    if (!game) return;

    
    if (!game.started && body === "مشارك") {
      if (game.players.includes(senderID))
        return message.reply("✅ أنت مشارك بالفعل.");

      const number = Math.floor(Math.random() * 1000) + 1;
      const name = (await usersData.get(senderID))?.name || "لاعب";

      game.players.push(senderID);
      game.data[senderID] = { number, name };

      await message.reply(`🎫 تم تسجيلك يا ${name}، رقمك هو ${number}`);

      if (game.players.length >= game.target) {
        game.started = true;
        await message.reply("🚨 تم اكتمال اللاعبين! تبدأ اللعبة الآن...");
        setTimeout(() => startTurn({ message, api, usersData }, threadID), 2000);
      }
      return;
    }

    
    if (game.started && game.turn && game.answer) {
      if (!game.players.includes(senderID)) return;
      if (senderID !== game.turn) return;

      clearTimeout(game.timeout);

      if (body === game.answer.toLowerCase()) {
        await message.reply("✅ إجابة صحيحة!");

        if (game.players.length === 1) {
          const { number, name } = game.data[senderID];
          await message.reply(`🏆 الفائز هو ${name} (رقمه ${number})!\n💰 تم منحه  1000 دينار!`);

          const userData = await usersData.get(senderID);
          userData.money = (userData.money || 0) + 1000;
          await usersData.set(senderID, userData);

          delete global.GoatBot.squidGame[threadID];
          return;
        }
      } else {
        await messag
