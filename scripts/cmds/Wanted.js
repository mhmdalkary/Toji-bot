const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "مطلوبين",
    aliases: ["chorgang"],
    version: "1.0",
    author: "AceGun × تعديل محمد",
    countDown: 5,
    role: 0,
    shortDescription: "جماعة من المطلوبين",
    longDescription: "",
    category: "ميمز وتعديل الصور",
    guide: "{pn} @منشن1 @منشن2"
  },

  onStart: async function ({ message, event }) {
    const mention = Object.keys(event.mentions);
    if (mention.length < 2) {
      return message.reply("⚠️ | قم بعمل منشن للشخص الأول و الثاني");
    }

    // نضيف مرسل الرسالة كالشخص الثالث
    mention.push(event.senderID);
    let [one, two, three] = mention;

    try {
      const imagePath = await generateWantedGroup(one, two, three);
      await message.reply({
        body: "✨ | هؤلاء الأشخاص مطلوبين للعدالة 🤓",
        attachment: fs.createReadStream(imagePath)
      });
      fs.unlink(imagePath, () => {});
    } catch (error) {
      console.error("خطأ أثناء تنفيذ الأمر:", error);
      message.reply("حدث خطأ أثناء تجهيز الصورة");
    }
  }
};

async function generateWantedGroup(one, two, three) {
  const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
  const avatarOneURL = `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=${token}`;
  const avatarTwoURL = `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=${token}`;
  const avatarThreeURL = `https://graph.facebook.com/${three}/picture?width=512&height=512&access_token=${token}`;
  const templateURL = "https://i.ibb.co/7yPR6Xf/image.jpg";

  const [template, avatarOne, avatarTwo, avatarThree] = await Promise.all([
    loadImage(await fetchImageBuffer(templateURL)),
    loadImage(await fetchImageBuffer(avatarOneURL)),
    loadImage(await fetchImageBuffer(avatarTwoURL)),
    loadImage(await fetchImageBuffer(avatarThreeURL))
  ]);

  const canvas = createCanvas(template.width, template.height);
  const ctx = canvas.getContext("2d");

  // رسم الخلفية
  ctx.drawImage(template, 0, 0, template.width, template.height);

  // رسم صور الأشخاص في أماكنهم
  ctx.drawImage(avatarOne, 206, 345, 405, 405);
  ctx.drawImage(avatarTwo, 1830, 350, 400, 400);
  ctx.drawImage(avatarThree, 1010, 315, 450, 450);

  const outputPath = path.join(__dirname, "WantedGroup.png");
  await fs.writeFile(outputPath, canvas.toBuffer("image/png"));
  return outputPath;
}

async function fetchImageBuffer(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return response.data;
}
