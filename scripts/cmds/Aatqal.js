const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "اعتقال",
    aliases: ["arrest"],
    version: "1.0",
    author: "milan-says",
    countDown: 5,
    role: 0,
    shortDescription: "قم بإعقال من خرق القوانين",
    longDescription: "إعتقال أحد ما انطلاقا من وضعك للمنشن عليه",
    category: "ميمز وتعديل الصور",
    guide: {
      vi: "{pn} [@tag]",
      ar: "{pn} [@تاغ]"
    }
  },

  onStart: async function({ api, event }) {
    const mention = Object.keys(event.mentions);
    if (mention.length === 0) 
      return api.sendMessage("أرجوك قم بعمل منشن للشخص الذي تريد إعتقاله", event.threadID);

    const one = mention.length === 1 ? event.senderID : mention[1];
    const two = mention.length === 1 ? mention[0] : mention[0];

    try {
      const outputPath = await bal(one, two);
      api.sendMessage(
        {
          body: "أنت رهن الإعتقال 👮🔗",
          attachment: fs.createReadStream(outputPath)
        },
        event.threadID,
        () => fs.unlink(outputPath, () => {})
      );
    } catch (err) {
      console.error(err);
      api.sendMessage("حدث خطأ أثناء تجهيز الصورة.", event.threadID);
    }
  }
};

async function bal(one, two) {
  // رابط الخلفية
  const templateURL = "https://i.imgur.com/ep1gG3r.png";
  const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

  const avoneURL = `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=${token}`;
  const avtwoURL = `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=${token}`;

  // تحميل الصور
  const [bg, avoneImg, avtwoImg] = await Promise.all([
    loadImage(templateURL),
    loadImage(await fetchImageBuffer(avoneURL)),
    loadImage(await fetchImageBuffer(avtwoURL))
  ]);

  // إنشاء الكانفاس
  const canvas = createCanvas(bg.width, bg.height);
  const ctx = canvas.getContext("2d");

  // رسم الخلفية
  ctx.drawImage(bg, 0, 0);

  // دالة لرسم صورة دائرية
  function drawCircleImage(img, x, y, size) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, x, y, size, size);
    ctx.restore();
  }

  // رسم الصور الدائرية مع إحداثيات وأحجام متناسبة مع التصميم
  drawCircleImage(avoneImg, 375, 9, 100);
  drawCircleImage(avtwoImg, 160, 92, 100);

  // حفظ الصورة محليًا
  const outputPath = path.join(__dirname, "fak.png");
  await fs.writeFile(outputPath, canvas.toBuffer("image/png"));

  return outputPath;
}

// دالة لتحويل رابط الصورة إلى بافر
async function fetchImageBuffer(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return response.data;
}
