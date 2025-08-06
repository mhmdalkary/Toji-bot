const fs = require("fs");

let gameData = {};

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function getRandomQuestion(type) {
  if (type === "flags") {
    const data = JSON.parse(fs.readFileSync("flags.json"));
    return data[Math.floor(Math.random() * data.length)];
  } else if (type === "emojie") {
    const data = JSON.parse(fs.readFileSync("emojie.json"));
    return data[Math.floor(Math.random() * data.length)];
  } else if (type === "capitals") {
    const data = [
      { question: "عاصمة ليبيا", answer: "طرابلس" },
      { question: "عاصمة فرنسا", answer: "باريس" },
      { question: "عاصمة مصر", answer: "القاهرة" }
    ];
    return data[Math.floor(Math.random() * data.length)];
  }
  return null;
}

module.exports = {
  config: {
    name: "لعبة-الموت",
    version: "3.0",
    author: "محمد ✦ تطوير",
    countDown: 10,
    role: 0,
    category: "العاب",
    shortDescription: {
      ar: "ابدأ لعبة الموت الجماعية 🎮💀"
    },
    longDescription: {
      ar: "لعبة جماعية ممتعة تتضمن تحديات أعلام، إيموجي، عواصم! 🎌❓🔠"
    },
    guide: {
      ar: ".لعبة-الموت @منشن1 @منشن2 @منشن3 ..."
    }
  },

  onStart: async function ({ api, event, args }) {
    if (!args.length || event.mentions.length < 2) {
      return api.sendMessage("✋ يرجى منشن على الأقل لاعبين لبدء اللعبة.\nمثال: .لعبة-الموت @أحمد @سارة @ياسر", event.threadID);
    }

    const mentions = event.mentions;
    const players = Object.entries(mentions).map(([id, name]) => ({
      id,
      name,
      hearts: 3,
      points: 0
    }));

    gameData[event.threadID] = {
      players,
      round: 1
    };

    const names = players.map(p => `• ${p.name} ❤️❤️❤️`).join("\n");

    api.sendMessage(
      `🎮 تم بدء *لعبة الموت*!\n\n👥 اللاعبون:\n${names}\n\n🔔 سيتم إرسال التحدي الأول خلال ثوانٍ...`,
      event.threadID
    );

    setTimeout(() => {
      runRound(api, event.threadID);
    }, 4000);
  }
};

async function runRound(api, threadID) {
  const data = gameData[threadID];
  if (!data) return;

  const players = data.players.filter(p => p.hearts > 0);

  if (players.length <= 1) {
    const winner = players[0];
    const report = data.players
      .sort((a, b) => b.points - a.points)
      .map(p => `• ${p.name} — ${p.points} نقطة — ${"❤️".repeat(p.hearts)}`)
      .join("\n");

    api.sendMessage(
      `🏁 انتهت اللعبة!\n\n🏆 الفائز: ${winner.name}\n\n📊 تقرير اللعبة:\n${report}`,
      threadID
    );
    delete gameData[threadID];
    return;
  }

  const games = ["flags", "emojie", "capitals"];
  const chosenGame = games[Math.floor(Math.random() * games.length)];
  const question = getRandomQuestion(chosenGame);

  let questionText = "";
  let correctAnswer = "";

  if (chosenGame === "flags") {
    questionText = `🌍 ما اسم هذا العلم؟`;
    correctAnswer = question.name;
  } else if (chosenGame === "emojie") {
    questionText = `😃 ما الإيموجي الذي يدل على:\n${question.question}`;
    correctAnswer = question.answer;
  } else if (chosenGame === "capitals") {
    questionText = `🏙️ ${question.question}`;
    correctAnswer = question.answer;
  }

  api.sendMessage(
    `📣 الجولة ${data.round}\n\n${questionText}\n⏳ لديك 15 ثانية للإجابة!`,
    threadID
  );

  const listener = async function (msg) {
    if (msg.threadID !== threadID) return;

    const player = data.players.find(p => p.id === msg.senderID && p.hearts > 0);
    if (!player) return;

    if (msg.body.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
      player.points += 10;

      api.sendMessage(
        `✅ أحسنت يا ${player.name}!\n+10 نقاط 🎯\nالآن اختر من تريد أن يخسر قلبًا:\nاكتب رقم اللاعب.`,
        threadID
      );

      const others = data.players
        .filter(p => p.id !== player.id && p.hearts > 0)
        .map((p, i) => `${i + 1}. ${p.name} ❤️${"❤️".repeat(p.hearts)}`)
        .join("\n");

      api.sendMessage(`👤 اللاعبين:\n${others}`, threadID);

      const killerListener = async function (killMsg) {
        if (killMsg.senderID !== player.id) return;
        const index = parseInt(killMsg.body.trim()) - 1;
        const targets = data.players.filter(p => p.id !== player.id && p.hearts > 0);

        if (targets[index]) {
          targets[index].hearts -= 1;
          api.sendMessage(
            `💔 ${targets[index].name} خسر قلبًا!\n${targets[index].name} الآن لديه ${"❤️".repeat(targets[index].hearts) || "لا شيء"}`,
            threadID
          );

          api.removeListener("message", killerListener);
          setTimeout(() => {
            data.round++;
            runRound(api, threadID);
          }, 4000);
        }
      };

      api.listenMqtt(killerListener);
      api.removeListener("message", listener);
    }
  };

  api.listenMqtt(listener);
        }
