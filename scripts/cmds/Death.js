const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "لعبة-الموت",
    version: "2.0",
    author: "حسين يعقوبي - تعديل محمد",
    countDown: 15,
    role: 0,
    category: "العاب",
    shortDescription: {
      ar: "لعبة جماعية فيها قتل وتصويت"
    },
    longDescription: {
      ar: "لعبة الموت الجماعية - كل لاعب عنده ثلاث قلوب، في كل جولة يُقتل شخص وتستمر حتى يبقى فائز واحد!"
    },
    guide: {
      ar: "اكتب .لعبة-الموت لبدء اللعبة في المجموعة"
    }
  },

  onStart: async function ({ message, event, threadsData, usersData, api }) {
    const threadID = event.threadID;

    // جلب معلومات المجموعة
    const threadInfo = await api.getThreadInfo(threadID);
    if (!threadInfo || !threadInfo.participantIDs) {
      return message.reply("❌ لم أستطع جلب المشاركين في المجموعة.");
    }

    const botID = api.getCurrentUserID();
    let players = threadInfo.participantIDs.filter(id => id != botID && id != event.senderID);

    if (players.length < 2) {
      return message.reply("❌ يجب أن يكون هناك على الأقل لاعبين اثنين غيرك لبدء اللعبة.");
    }

    // إدراج صاحب الأمر
    players.push(event.senderID);

    // تهيئة بيانات اللاعبين
    let gameData = players.map(id => ({
      id,
      lives: 3
    }));

    let round = 1;

    const runRound = async () => {
      if (gameData.length <= 1) {
        const winner = await usersData.getName(gameData[0].id);
        return message.reply(`🏆 انتهت اللعبة! الفائز هو: ${winner}`);
      }

      message.reply(`🎲 الجولة ${round} بدأت!`);

      // اختيار لعبة عشوائية
      const games = ['emojie', 'flags', 'question'];
      const selectedGame = games[Math.floor(Math.random() * games.length)];

      switch (selectedGame) {
        case 'emojie':
          {
            const emojieData = JSON.parse(fs.readFileSync(path.join(__dirname, 'emojie.json')));
            const random = emojieData[Math.floor(Math.random() * emojieData.length)];
            message.reply(`❓ أرسل الإيموجي المناسب للوصف التالي: ${random.question}`);

            const collected = [];

            const handler = ({ body, senderID }) => {
              if (collected.includes(senderID)) return;
              if (body === random.answer && gameData.some(p => p.id === senderID)) {
                collected.push(senderID);
                message.reply(`✅ ${senderID} جاوب بشكل صحيح!`);

                if (collected.length === 1) {
                  // أول من جاوب هو الناجي
                  const others = gameData.filter(p => p.id !== senderID);
                  const victim = others[Math.floor(Math.random() * others.length)];
                  victim.lives--;

                  if (victim.lives <= 0) {
                    message.reply(`☠️ ${victim.id} مات وتم استبعاده!`);
                    gameData = gameData.filter(p => p.id !== victim.id);
                  } else {
                    message.reply(`💔 ${victim.id} فقد قلبًا! تبقى له ${victim.lives} قلوب.`);
                  }

                  api.removeListener('message', handler);
                  round++;
                  setTimeout(runRound, 3000);
                }
              }
            };

            api.listen(handler);

            setTimeout(() => {
              api.removeListener('message', handler);
              message.reply("⏱️ انتهى الوقت ولم يجب أحد!");
              round++;
              setTimeout(runRound, 3000);
            }, 15000);
          }
          break;

        case 'flags':
          {
            const flags = JSON.parse(fs.readFileSync(path.join(__dirname, 'flags.json')));
            const random = flags[Math.floor(Math.random() * flags.length)];
            message.reply(`🌍 لأي دولة هذا العلم؟`, {
              attachment: await global.utils.getStreamFromURL(random.image)
            });

            const collected = [];

            const handler = ({ body, senderID }) => {
              if (collected.includes(senderID)) return;
              if (body.toLowerCase() === random.name.toLowerCase() && gameData.some(p => p.id === senderID)) {
                collected.push(senderID);
                message.reply(`✅ ${senderID} جاوب بشكل صحيح!`);

                if (collected.length === 1) {
                  const others = gameData.filter(p => p.id !== senderID);
                  const victim = others[Math.floor(Math.random() * others.length)];
                  victim.lives--;

                  if (victim.lives <= 0) {
                    message.reply(`☠️ ${victim.id} مات!`);
                    gameData = gameData.filter(p => p.id !== victim.id);
                  } else {
                    message.reply(`💔 ${victim.id} فقد قلبًا! تبقى له ${victim.lives} قلوب.`);
                  }

                  api.removeListener('message', handler);
                  round++;
                  setTimeout(runRound, 3000);
                }
              }
            };

            api.listen(handler);

            setTimeout(() => {
              api.removeListener('message', handler);
              message.reply("⏱️ الوقت انتهى.");
              round++;
              setTimeout(runRound, 3000);
            }, 15000);
          }
          break;

        // ألعاب إضافية يتم إضافتها هنا...
      }
    };

    runRound();
  }
};
