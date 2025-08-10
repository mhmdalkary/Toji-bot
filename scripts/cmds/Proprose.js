const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "طلب",
    aliases: ["porpos"],
    version: "1.1",
    author: "Kivv × AceGun",
    countDown: 5,
    role: 0,
    shortDescription: "@منشن لفتاة من أجل طلب يدها للزواج",
    longDescription: "",
    category: "طلب",
    guide: "{pn} @منشن/@تاغ"
  },

  onStart: async function({ api, event }) {
    const mention = Object.keys(event.mentions);
    if (mention.length === 0) 
      return api.sendMessage("المرجو عمل منشن للشخص ما", event.threadID);

    const one = mention.length === 1 ? event.senderID : mention[1];
    const two = mention.length === 1 ? mention[0] : mention[0];

    try {
      const outputPath = await bal(one, two);
      api.sendMessage(
        {
          body: "「 أرجو أن تقبلي الزواج بي 😁😅 」",
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
  const templateURL = "https://i.ibb.co/RNBjSJk/image.jpg";
  const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

  const avoneURL = `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=${token}`;
  const avtwoURL = `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=${token}`;

  const [bg, avoneImg, avtwoImg] = await Promise.all([
    loadImage(templateURL),
    loadImage(await fetchImageBuffer(avoneURL)),
    loadImage(await fetchImageBuffer(avtwoURL))
  ]);

  const canvas = createCanvas(bg.width, bg.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(bg, 0, 0);

  function drawCircleImage(img, x, y, size) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, x, y, size, size);
    ctx.restore();
  }

  drawCircleImage(avoneImg, 210, 65, 90);
  drawCircleImage(avtwoImg, 458, 105, 90);

  const outputPath = path.join(__dirname, "propose.png");
  await fs.writeFile(outputPath, canvas.toBuffer("image/png"));

  return outputPath;
}

async function fetchImageBuffer(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return response.data;
  }
