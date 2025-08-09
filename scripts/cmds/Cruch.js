const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "كراش",
    aliases: ["ws"],
    version: "1.0",
    author: "AceGun × تعديل محمد",
    countDown: 5,
    role: 0,
    shortDescription: "هدية للكراش",
    longDescription: "الصورة الرمزية السليمة من أجل الكراش / ",
    category: "حب",
    guide: ""
  },

  onStart: async function ({ message, event }) {
    const mention = Object.keys(event.mentions);
    if (mention.length === 0) {
      return message.reply("⚠️ الرجاء عمل منشن للشخص المطلوب");
    }

    const one = mention[0];

    try {
      const imagePath = await generateCrushImage(one);
      await message.reply({
        body: "「 هل هذا حقيقي ؟🥰❤️ 」",
        attachment: fs.createReadStream(imagePath)
      });
      fs.unlink(imagePath, () => {});
    } catch (error) {
      console.error("خطأ أثناء تشغيل الأمر:", error);
      await message.reply("حدث خطأ أثناء تجهيز الصورة");
    }
  }
};

async function generateCrushImage(userID) {
  const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
  const avatarURL = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=${token}`;
  const bgURL = "https://i.imgur.com/BnWiVXT.jpg";

  const [background, avatar] = await Promise.all([
    loadImage(await fetchImageBuffer(bgURL)),
    loadImage(await fetchImageBuffer(avatarURL))
  ]);

  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext("2d");

  // رسم الخلفية
  ctx.drawImage(background, 0, 0, 512, 512);

  // رسم صورة الأفاتار بالحجم والموقع المحدد
  ctx.drawImage(avatar, 70, 186, 173, 173);

  const outputPath = path.join(__dirname, "crush.png");
  await fs.writeFile(outputPath, canvas.toBuffer("image/png"));
  return outputPath;
}

async function fetchImageBuffer(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return res.data;
}
