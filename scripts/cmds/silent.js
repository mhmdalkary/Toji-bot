global.botData = global.botData || {};

module.exports = {
    config: {
        name: "صمت",
        version: "1.3",
        description: "قم بتشغيله و إيقافه",
        guide: {
            vi: "Dùng để bật/tắt chức năng chat",
            en: "يستخدم لتشغيل/إيقاف وظيفة الدردشة"
        },
        category: "خدمات",
        countDown: 15,
        role: 1,
        author: "Cliff"
    },

    onStart: async function ({ message, args, role, getLang }) {
        if (!args[0]) {
            return message.reply("⚠️ | الرجاء تحديد 'تشغيل' أو 'إيقاف'");
        }

        if (role < 1) {
            return message.reply(getLang("onlyAdmin") || "❌ | أنت لست مشرفاً لتنفيذ هذا الأمر");
        }

        const command = args[0].toLowerCase();

        if (command === "إيقاف") {
            global.botData.chatEnabled = true;
            return message.reply("❌ | تم تعطيل مود الصمت، ويمكن للجميع التحدث بحرية.");
        } else if (command === "تشغيل") {
            global.botData.chatEnabled = false;
            return message.reply("✅ | تم تشغيل مود الصمت، ولن يستطيع أحد التحدث وإلا سيتم طرده.");
        } else {
            return message.reply("⚠️ | الأمر غير معروف، استخدم 'تشغيل' أو 'إيقاف'");
        }
    },

    onChat: async function ({ message, event, api, getLang }) {
        try {
            // إذا كان الصمت مفعّل (chatEnabled = false)
            const chatEnabled = global.botData.chatEnabled === undefined ? true : global.botData.chatEnabled;
            if (!chatEnabled) {
                // لا تطرد المشرفين أو البوت نفسه
                if (event.senderID === api.getCurrentUserID()) return;
                const userRole = await api.getUserInfo(event.senderID)
                    .then(res => res[event.senderID]?.role || 0)
                    .catch(() => 0);

                if (userRole >= 1) return; // السماح للمشرفين والكبار بالتحدث حتى مع تفعيل الصمت

                api.removeUserFromGroup(event.senderID, event.threadID, (err) => {
                    if (err) console.error("خطأ أثناء طرد المستخدم:", err);
                });

                return message.reply("⚠️ | تم طرد شخص يتحدث أثناء تفعيل مود الصمت.");
            }
        } catch (error) {
            console.error("خطأ في حدث الدردشة:", error);
            // لا تطرد البوت أو توقفه عند الخطأ
        }
    }
};