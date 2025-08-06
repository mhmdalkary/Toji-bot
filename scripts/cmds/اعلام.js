const fs = require('fs');

module.exports = {
    config: {
        name: "اعلام",
        version: "1.0",
        author: "حسين يعقوبي",
        role: 0,
        countdown: 10,
        reward: Math.floor(Math.random() * (100 - 50 + 1) + 50),
        category: "العاب",
        shortDescription: {
            ar: "حزمة العلم"
        },
        longDescription: {
            ar: "تعرف على العلم"
        },
        guide: {
            ar: "{prefix}علم - ابدأ لعبة معرفة العلم"
        }
    },

    onStart: async function ({ message, event, commandName }) {
        const flags = JSON.parse(fs.readFileSync('flags.json'));
        const randomFlag = flags[Math.floor(Math.random() * flags.length)];

        // توليد خيارين عشوائيين خاطئين غير الإجابة الصحيحة
        let wrongOptions = [];
        while (wrongOptions.length < 2) {
            const random = flags[Math.floor(Math.random() * flags.length)];
            if (random.name !== randomFlag.name && !wrongOptions.includes(random.name)) {
                wrongOptions.push(random.name);
            }
        }

        // دمج الخيارات وتبديل الترتيب عشوائيًا
        const allOptions = [randomFlag.name, ...wrongOptions].sort(() => Math.random() - 0.5);

        const optionsText = allOptions.map((opt, i) => `${i + 1}. ${opt}`).join('\n');

        const imageStream = await global.utils.getStreamFromURL(randomFlag.image);

        message.reply({
            body: `✿━━━━━━━━━━━━━━━━━✿\n | ما هو اسم العلم في الصورة ؟\n\n${optionsText}\n\n✿━━━━━━━━━━━━━━━━━✿`,
            attachment: imageStream
        }, async (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName,
                messageID: info.messageID,
                author: event.senderID,
                answer: randomFlag.name,
                options: allOptions
            });
        });
    },

    onReply: async ({ message, Reply, event, usersData, api, commandName }) => {
        const { author, messageID, answer, options } = Reply;

        const userInput = event.body.trim();
        let userAnswer = userInput;

        // التحقق إذا أدخل رقم الخيار
        if (!isNaN(userInput) && Number(userInput) >= 1 && Number(userInput) <= options.length) {
            userAnswer = options[Number(userInput) - 1];
        }

        if (userAnswer === answer) {
            global.GoatBot.onReply.delete(messageID);
            message.unsend(event.messageReply.messageID);
            const reward = Math.floor(Math.random() * (100 - 50 + 1) + 50);
            await usersData.addMoney(event.senderID, reward);
            const userName = await api.getUserInfo(event.senderID);
            message.reply(`تهانينا 🎉🎊 ${userName[event.senderID].name}، لقد فزت بمبلغ ${reward} دولار 💵 !`);
            api.setMessageReaction("✅", event.messageID, (err) => {}, true);
        } else {
            message.reply("❌ | آسف، هذا غير صحيح.");
            api.setMessageReaction("❌", event.messageID, (err) => {}, true);
        }
    }
};
