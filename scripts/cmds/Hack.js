const { loadImage, createCanvas } = require('canvas');
const fs = require('fs-extra');
const axios = require('axios');

module.exports = {
  config: {
    name: 'هاك',
    aliases: ['قرصنة'],
    author: 'Void - تعديل محمد',
    countDown: 5,
    role: 0,
    category: 'خدمات',
    shortDescription: { ar: 'قرصنة حسابات' },
  },

  wrapText: async (ctx, text, maxWidth) => {
    return new Promise((resolve) => {
      if (ctx.measureText(text).width < maxWidth) return resolve([text]);
      if (ctx.measureText('W').width > maxWidth) return resolve(null);
      const words = text.split(' ');
      const lines = [];
      let line = '';

      while (words.length > 0) {
        let split = false;
        while (ctx.measureText(words[0]).width >= maxWidth) {
          const temp = words[0];
          words[0] = temp.slice(0, -1);
          if (split) {
            words[1] = temp.slice(-1) + words[1];
          } else {
            split = true;
            words.splice(1, 0, temp.slice(-1));
          }
        }
        if (ctx.measureText(line + words[0]).width < maxWidth) {
          line += words.shift() + ' ';
        } else {
          lines.push(line.trim());
          line = '';
        }
        if (words.length === 0) lines.push(line.trim());
      }
      return resolve(lines);
    });
  },

  onStart: async function ({ api, event, message }) {
    const codes = [
      '18620','57897','34205','76194','50378','91737','25983','62479','83417',
      '42603','43187','80938','52947','31874','67412','50946','82159','63514',
      '45932','87259','39475','76095','52731','83905','24901','38658','52069',
      '65988','17643','90326','43851','70495','32059','86794','14588','59146',
      '28306','63451','49087','89773','51029','32604','68297','41503','72948',
      '18547','46379','90416','27945','31649','50486','94188','17349','73650',
      '65042','52489','96723','23948','41650','54329','87216','69543','25731',
      '64392','91284','53091','48126','82946','61985','36710','81475','24938',
      '78356','43199','97628','51670','62473'
    ];
    const randomCode = codes[Math.floor(Math.random() * codes.length)];

    await message.send('👾 Fetching FB Account Data...');

    // ملفات الصور
    let bgPath = __dirname + '/cache/background.png';
    let avatarPath = __dirname + '/cache/Avtmot.png';

    // المستخدم المستهدف
    let targetID = Object.keys(event.mentions)[0] || event.senderID;
    let userInfo = await api.getUserInfo(targetID);
    let userName = userInfo[targetID].name;
    let avatarUrl = userInfo[targetID].thumbSrc; // رابط الصورة المباشر

    // جلب الصور مع تأخير بسيط
    await new Promise(res => setTimeout(res, 1000));
    let avatarData = (await axios.get(avatarUrl, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarPath, Buffer.from(avatarData, 'utf-8'));

    let bgUrl = 'https://i.imgur.com/VQXViKI.png';
    let bgData = (await axios.get(bgUrl, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(bgPath, Buffer.from(bgData, 'utf-8'));

    // الدمج بالرسم
    let bgImg = await loadImage(bgPath);
    let avImg = await loadImage(avatarPath);
    let canvas = createCanvas(bgImg.width, bgImg.height);
    let ctx = canvas.getContext('2d');

    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    ctx.font = '400 23px Arial';
    ctx.fillStyle = '#1878F3';
    ctx.textAlign = 'start';
    const wrappedName = await this.wrapText(ctx, userName, 1160);
    ctx.fillText(wrappedName.join('\n'), 200, 497);
    ctx.beginPath();
    ctx.drawImage(avImg, 83, 437, 100, 101);

    const finalImage = canvas.toBuffer();
    fs.writeFileSync(bgPath, finalImage);
    fs.removeSync(avatarPath);

    // الإرسال
    api.sendMessage(
      {
        body: `✅ تم اختراق بيانات الحساب بنجاح ✅\nيا سيدي قم بتفقد الخاص.\n\nرمز الفيسبوك : ${randomCode}`,
        attachment: fs.createReadStream(bgPath)
      },
      event.threadID,
      () => fs.unlinkSync(bgPath),
      event.messageID
    );
  },
};
