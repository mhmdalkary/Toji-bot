const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "زوجني2",
    aliases: ["زواج", "waifu"],
    version: "1.1",
    author: "AceGun | تعديل محمد",
    countDown: 5,
    role: 0,
    shortDescription: "قم بالحصول على زوجة",
    longDescription: "",
    category: "ميمز وتعديل الصور",
    guide: "{pn} @تاغ | رد | عشوائي"
  },

  onStart: async function({ api, event, Threads }) {
    const mention = Object.keys(event.mentions);
    let one = event.senderID, two;

    // بحالة التاغ
    if (mention.length > 0) {
      two = mention[0];
    }
    // بحالة الرد
    else if (event.type === "message_reply") {
      two = event.messageReply.senderID;
    }
    // عشوائي
    else {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const members = threadInfo.participantIDs.filter(id => id != one);
      if (members.length === 0) {
        return api.sendMessage("ماكو أحد أقدر أزوجك بيه 😅", event.threadID, event.messageID);
      }
      two = members[Math.floor(Math.random() * members.length)];
    }

    try {
      const outputPath = await bal(one, two);
      const match = Math.floor(Math.random() * 101); // نسبة تطابق من 0 الى 100

      api.sendMessage(
        {
          body: `💞 نسبة التوافق بينكم هي: ${match}%\n「 ‏عَيناكِ جيشٌ لن أردَّ جُنودَه وأنا السعيدُ بِِرايتي البيضاَءِ 🥰❤️ 」`,
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
  const templateURL = "https://i.postimg.cc/26f9zkTc/marry.png";
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

  drawCircleImage(avoneImg, 189, 15, 60);
  drawCircleImage(avtwoImg, 122, 25, 60);

  const outputPath = path.join(__dirname, "marry.png");
  await fs.writeFile(outputPath, canvas.toBuffer("image/png"));

  return outputPath;
}

async function fetchImageBuffer(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return response.data;
}
