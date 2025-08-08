const axios = require('axios');
const Jimp = require('jimp');
const fs = require('fs');

module.exports = {
  config: {
    name: "زوجني2",
    aliases: ["زواج", "waifu"],
    version: "1.0",
    author: "AceGun",
    countDown: 5,
    role: 0,
    shortDescription: "قم بالحصول على زوجة",
    longDescription: "",
    category: "حب",
    guide: "{pn}"
  },

  onStart: async function({ message, event, args }) {
    const mention = Object.keys(event.mentions);

    if (mention.length === 0) {
      return message.reply("أرجوك قم بعمل منشن للشخص الذي تريد الزواج به 🙃");
    } else if (mention.length === 1) {
      const one = event.senderID;
      const two = mention[0];
      bal(one, two).then(path => {
        message.reply({ body: "「 أحبكي عزيزتي 🥰❤️ 」", attachment: fs.createReadStream(path) });
      }).catch(err => {
        console.error(err);
        message.reply("حدث خطأ أثناء تجهيز الصورة.");
      });
    } else {
      const one = mention[1];
      const two = mention[0];
      bal(one, two).then(path => {
        message.reply({ body: "「 أحبكي عزيزتي 🥰❤️ 」", attachment: fs.createReadStream(path) });
      }).catch(err => {
        console.error(err);
        message.reply("حدث خطأ أثناء تجهيز الصورة.");
      });
    }
  }
};

async function bal(one, two) {
  // رابط الصورة الأساسية
  const templateURL = "https://i.postimg.cc/26f9zkTc/marry.png";
  // رابط صور الأفاتار مع توكن (استبدل توكنك إذا لزم الأمر)
  const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

  const avoneURL = `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=${token}`;
  const avtwoURL = `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=${token}`;

  // قراءة الصور
  let avone = await Jimp.read(avoneURL);
  avone.circle();

  let avtwo = await Jimp.read(avtwoURL);
  avtwo.circle();

  let img = await Jimp.read(templateURL);
  img.resize(432, 280)
    .composite(avone.resize(60, 60), 189, 15)
    .composite(avtwo.resize(60, 60), 122, 25);

  const outputPath = "./marry.png";
  await img.writeAsync(outputPath);

  return outputPath;
}
