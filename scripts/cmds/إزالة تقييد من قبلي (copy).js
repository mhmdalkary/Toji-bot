const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
    config: {
        name: "ضرب",
        aliases: ["ضربب", "اضرب"],
        version: "1.0",
        author: "zach",
        countDown: 5,
        role: 0,
        shortDescription: "ضرب",
        longDescription: "ضرب",
        category: "ميمز وتعديل الصور",
        guide: ""
    },

    onStart: async function ({ message, event, args }) {
        const mention = Object.keys(event.mentions);
        if (mention.length === 0)
            return message.reply("تاغ يلي بدك تضربه 😂");
        else if (mention.length === 1) {
            const الضارب = event.senderID;
            const الضحية = mention[0];
            تركيب(الضارب, الضحية).then(pth => {
                message.reply({ body: "ههههههههه طاح فيها المسكين 💥", attachment: fs.createReadStream(pth) });
            });
        } else {
            const الضارب = mention[1];
            const الضحية = mention[0];
            تركيب(الضارب, الضحية).then(pth => {
                message.reply({ body: "هههههههههههه 🤣", attachment: fs.createReadStream(pth) });
            });
        }
    }
};

async function تركيب(ضارب, ضحية) {
    // تحميل صور البروفايل
    const صورةالضارب = await jimp.read(`https://graph.facebook.com/${ضارب}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    const صورةالضحية = await jimp.read(`https://graph.facebook.com/${ضحية}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

    صورةالضارب.circle();
    صورةالضحية.circle();

    // تحميل الصورة الأساسية من المسار المحلي
    const الخلفية = await jimp.read("tmp/ضرب.png");

    // إضافة الوجوه في أماكنهم (تقديرية حسب الصورة اللي أرسلتها)
    الخلفية
        .composite(صورةالضحية.resize(80, 80), 85, 105)   // يسار – الضحية
        .composite(صورةالضارب.resize(80, 80), 380, 45);  // يمين – الضارب

    const الناتج = "tmp/output.png";
    await الخلفية.writeAsync(nاتج);
    return الناتج;
}
