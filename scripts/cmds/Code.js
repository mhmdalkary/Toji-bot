const fs = require("fs-extra");
const moment = require("moment-timezone");

const lastRedeemTime = {};

module.exports = {
  config: {
    name: "احالة",
    version: "1.0",
    author: "Riley",
    countdown: 100,
    role: 0,
    shortdescription: {

      ar: "."
    },
    longdescription: {

      ar: "تخليص المال"
    },
    category: "إقتصاد",
    guide: {

      ar: "{pn} <الرمز>"
    }
  },
  onStart: async function ({ api, message, event, args, usersData }) {
    const redeemCode = "senra_best_ses"; // Kode redeem
    const userSenderID = event.senderID;

    const lastRedeem = lastRedeemTime[userSenderID];
    const currentTime = moment.tz("Africa/Libya"); 

    if (lastRedeem && currentTime.diff(lastRedeem, 'days') < 7) {
      return message.reply("قم بالاسترداد مرة أخرى غدًا باستخدام رمز الاسترداد الجديد.");
    }

    if (args[0] === redeemCode) {
      const rewardAmount = 1000000; 
      const userData = await usersData.get(userSenderID);

      await usersData.set(userSenderID, {
        money: userData.money + rewardAmount,
        data: userData.data
      });


      lastRedeemTime[userSenderID] = currentTime;

      return message.reply(`منتهي \أنت حصلت: ${rewardAmount}$`);
    } else {
      return message.reply("استخدم رمز الاسترداد صالحًا.");
    }
  }
};
