module.exports = {
    config: {
        name: "تحويل",
        version: "1.2",
        author: "Hassan - تعديل محمد",
        shortDescription: {
            ar: "إرسال المال إلى مستخدم آخر",
        },
        longDescription: {
            ar: "إرسال المال عبر آيدي أو تاغ أو رد",
        },
        category: "إقتصاد",
    },
    onStart: async function ({ args, message, event, usersData, api }) {
        const senderID = event.senderID.toString();
        const senderData = await usersData.get(senderID);

        if (!senderData) {
            return message.reply("❌ | لم يتم العثور على بيانات المرسل.");
        }

        // استخراج المبلغ
        let amount = 0;
        let recipientUID = null;

        // إذا فيه رد على رسالة
        if (event.type === "message_reply") {
            recipientUID = event.messageReply.senderID.toString();
            amount = parseInt(args[0]);
        }
        // إذا فيه تاغ
        else if (Object.keys(event.mentions).length > 0) {
            recipientUID = Object.keys(event.mentions)[0].toString();
            amount = parseInt(args[0]);
        }
        // إذا كتب آيدي مباشرة
        else if (args.length >= 2) {
            amount = parseInt(args[0]);
            recipientUID = args[1].toString();
        }

        // التحقق من صحة المبلغ
        if (isNaN(amount) || amount <= 0) {
            return message.reply("⚠️ | المرجو إدخال مبلغ صالح وإيجابي.");
        }
        if (amount > senderData.money) {
            return message.reply("⚠️ | رصيدك غير كافٍ.");
        }
        if (!recipientUID) {
            return message.reply("⚠️ | يرجى تحديد الشخص عبر آيدي أو تاغ أو رد على رسالته.");
        }
        if (recipientUID === senderID) {
            return message.reply("⚠️ | لا يمكنك تحويل المال إلى نفسك.");
        }

        // التحقق من بيانات المستلم
        const recipientData = await usersData.get(recipientUID);
        if (!recipientData) {
            return message.reply("❌ | فشلت العملية، لم يتم العثور على بيانات المستلم.");
        }

        // خصم المبلغ من المرسل
        await usersData.set(senderID, {
            money: senderData.money - amount,
            data: senderData.data,
        });

        // إضافة المبلغ للمستلم
        await usersData.set(recipientUID, {
            money: (recipientData.money || 0) + amount,
            data: recipientData.data,
        });

        // رد فعل ✅
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        return message.reply(`✅ | تم تحويل مبلغ 💵『${amount}』 بنجاح إلى الآيدي: ${recipientUID}.`);
    },
};        }

        await usersData.set(senderID, {
            money: senderData.money - amount,
            data: senderData.data,
        });

        await usersData.set(recipientUID, {
            money: (recipientData.money || 0) + amount,
            data: recipientData.data,
        });

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

        return message.reply(` ✅ | تمت بنجاح عملية التحويل ل مبلغ دولار 💵『${amount}』 إلى الشخص مع الآيدي : ${recipientUID}.`);
    },
};
