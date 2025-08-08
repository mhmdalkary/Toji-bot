const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "مطلوب",
    aliases: ["wanted"],
    version: "1.0",
    author: "حسين يعقوبي × تعديل محمد",
    countDown: 5,
    role: 0,
    shortDescription: "وضع صورتك على ملصق المطلوبين",
    longDescription: "",
    category: "ميمز وتعديل الصور",
    guide: {
      vi: "{pn}",
      ar: "{pn}"
    }
  },

  onStart: async function ({ api, event, args }) {
    const uid = Object.keys(event.mentions).length > 0
      ? Object.keys(event.mentions)[0]
      : event.senderID;

    try {
      const imagePath = await generateWantedImage(uid);
      api.sendMessage(
        { attachment: fs.createReadStream(imagePath) },
        event.threadID,
        () => fs.unlink(imagePath, () => {})
      );
    } catch (err) {
      console.error(err);
      api.sendMessage("حدث خطأ أثناء تجهيز صورة المطلوب 🔍", event.threadID);
    }
  }
};

async function generateWantedImage(uid) {
  const templateURL = "https://i.imgur.com/2FarLuj.jpg";
  const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
  const avatarURL = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=${token}`;

  const [wantedImg, avatarImg] = await Promise.all([
    loadImage(await fetchImageBuffer(templateURL)),
    loadImage(await fetchImageBuffer(avatarURL))
  ]);

  const canvas = createCanvas(wantedImg.width, wantedImg.height);
  const ctx = canvas.getContext("2d");

  // خلفية الملصق
  ctx.drawImage(wantedImg, 0, 0, wantedImg.width, wantedImg.height);

  // وضع صورة الشخص بدون قص دائري
  const avatarWidth = 345;
  const avatarHeight = 300;
  const avatarX = 120;
  const avatarY = 200;
  ctx.drawImage(avatarImg, avatarX, avatarY, avatarWidth, avatarHeight);

  const outputPath = path.join(__dirname, "wanted.png");
  await fs.writeFile(outputPath, canvas.toBuffer("image/png"));

  return outputPath;
}

async function fetchImageBuffer(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return response.data;
  }
