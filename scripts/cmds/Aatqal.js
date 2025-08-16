const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "اعتقال",
    aliases: ["arrest"],
    version: "1.1",
    author: "milan-says | تعديل محمد",
    countDown: 5,
    role: 0,
    shortDescription: "قم بإعقال من خرق القوانين",
    longDescription: "إعتقال أحد ما انطلاقا من وضعك للتاغ أو الرد عليه",
    category: "ميمز وتعديل الصور",
    guide: "{pn} [@تاغ] | الرد على رسالة"
  },

  onStart: async function({ api, event }) {
    const mention = Object.keys(event.mentions);
    let one = event.senderID, two;

    // التاغ
    if (mention.length > 0) {
      two = mention[0];
    }
    // الرد على رسالة
    else if (event.type === "message_reply") {
      two = event.messageReply.senderID;
    }
    else {
      return api.sendMessage("أرجوك قم بعمل منشن أو رد على رسالة الشخص الذي تريد إعتقاله", event.threadID, event.messageID);
    }

    try {
      const outputPath = await bal(one, two);
      api.sendMessage(
        {
          body: "أنت رهن الإعتقال 👮🔗",
          attachment: fs.createReadStream(outputPath)
        },
        event.threadID,
        () => fs.unlink(outputPath, () => {}),
        event.messageID
      );
    } catch (err) {
      console.error(err);
      api.sendMessage("حدث خطأ أثناء تجهيز الصورة.", event.threadID, event.messageID);
    }
  }
};

async function bal(one, two) {
  const templateURL = "https://i.imgur.com/ep1gG3r.png";
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

  drawCircleImage(avoneImg, 375, 9, 100);
  drawCircleImage(avtwoImg, 160, 92, 100);

  const outputPath = path.join(__dirname, "fak.png");
  await fs.writeFile(outputPath, canvas.toBuffer("image/png"));

  return outputPath;
}

async function fetchImageBuffer(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return response.data;
}
