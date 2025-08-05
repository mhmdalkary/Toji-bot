module.exports = {
  config: {
    name: "سلوت",
    version: "1.0",
    author: "الين",
    shortDescription: {
      ar: "لعبة سلوت",
    },
    longDescription: {
      ar: "لعبة سلوت.",
    },
    category: "العاب",
  },
  langs: {
    ar: {
      invalid_amount: "حط رقم كبير احتمال تفوز بالضعف خاطر يا بني",
      not_enough_money: "شوف رصيدك اذا عندك هذا المبلغ",
      spin_message: "جاري الدوران ",
      win_message: "لقد ربحت %1 دولار 🥳!\n[",
      lose_message: "لقد خسرت %1 دولار 🤭💔.\n[",
      jackpot_message: "دييييم! ثلاثي %1 هذا المبلغ الذي ربحته 🙌💗!",
    },
  },
  onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }

    if (amount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    const slots = ["🍒", "🍇", "🍊", "🍉", "🍋", "🍎", "🍓", "🍑", "🥝"];
    const slot1 = slots[Math.floor(Math.random() * slots.length)];
    const slot2 = slots[Math.floor(Math.random() * slots.length)];
    const slot3 = slots[Math.floor(Math.random() * slots.length)];

    const winnings = calculateWinnings(slot1, slot2, slot3, amount);

    await usersData.set(senderID, {
      money: userData.money + winnings,
      data: userData.data,
    });

    const messageText = getSpinResultMessage(slot1, slot2, slot3, winnings, getLang);

    return message.reply(messageText);
  },
};

function calculateWinnings(slot1, slot2, slot3, betAmount) {
  if (slot1 === "🍒" && slot2 === "🍒" && slot3 === "🍒") {
    return betAmount * 10;
  } else if (slot1 === "🍇" && slot2 === "🍇" && slot3 === "🍇") {
    return betAmount * 5;
  } else if (slot1 === slot2 && slot2 === slot3) {
    return betAmount * 3;
  } else if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3) {
    return betAmount * 2;
  } else {
    return -betAmount;
  }
}

function getSpinResultMessage(slot1, slot2, slot3, winnings, getLang) {
  if (winnings > 0) {
    if (slot1 === "🍒" && slot2 === "🍒" && slot3 === "🍒") {
      return getLang("jackpot_message", winnings);
    } else {
      return getLang("win_message", winnings) + `\ ${slot1} | ${slot2} | ${slot3} ]`;
    }
  } else {
    return getLang("lose_message", -winnings) + `\ ${slot1} | ${slot2} | ${slot3} ]`;
  }
        }
