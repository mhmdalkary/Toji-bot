const axios = require('axios');
const Jimp = require("jimp");  // غيرت jimp إلى Jimp
const fs = require("fs");

module.exports = {
    config: {
        name: "زوجني2",
        aliases: ["زواج", "waifu"],  // صححت الفاصلة في aliases
        version: "1.0",
        author: "AceGun",
        countDown: 5,
        role: 0,
        shortDescription: "قم بالحصول على زوجة",
        longDescription: "",
        category: "حب",
        guide: "{pn}"
    },

    onStart: async function ({ message, event, args }) {
        const mention = Object.keys(event.mentions);
        if(mention.length == 0) 
            return message.reply("أرجوك فم بعمل منشن للشخص اللذي تريد الزواج به 🙃");
        else if(mention.length == 1){
            const one = event.senderID, two = mention[0];
            bal(one, two).then(ptth => { 
                message.reply({ body: "「 أحبكي عزيزتي 🥰❤️ 」", attachment: fs.createReadStream(ptth) }) 
            });
        } else {
            const one = mention[1], two = mention[0];
            bal(one, two).then(ptth => { 
                message.reply({ body: "「 أحبكي عزيزتي🥰❤️ 」", attachment: fs.createReadStream(ptth) }) 
            });
        }
    }
};

async function bal(one, two) {
    let avone = await Jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    avone.circle();
    let avtwo = await Jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    avtwo.circle();
    let pth = "marry.png";
    let img = await Jimp.read("https://i.postimg.cc/26f9zkTc/marry.png");

    img.resize(432, 280)
       .composite(avone.resize(60, 60), 189, 15)
       .composite(avtwo.resize(60, 60), 122, 25);

    await img.writeAsync(pth);
    return pth;
}
