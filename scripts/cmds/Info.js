module.exports = {
  config: {
    name: "معلومات2",
    version: "1.0.1",
    author: "Arjhil",
    longDescription: "الحصول على معلومات المستخدم.",
    shortDescription: "الحصول على معلومات المستخدم.",
    category: "خدمات",
    countdown: 5,
  },

  onStart: async function ({ api, event, args }) {
    let { threadID, senderID, messageID } = event;

    const getUserInfo = async (targetID) => {
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        const userInfo = await api.getUserInfo(targetID);

        const userName = userInfo[targetID].name || "الاسم غير متوفر";
        const uid = targetID;
        const gender = userInfo[targetID].gender || "الجنس غير متوفر";
        const birthday = userInfo[targetID].birthday || "عيد ميلاد غير متوفر";

        // Construct Facebook profile link
        const fbLink = `https://www.facebook.com/profile.php?id=${uid}`;

        // Get profile picture URL
        const profilePicURL = userInfo[targetID].profileUrl || "";

        // Get user status (online, offline, idle)
        const userStatus = userInfo[targetID].isOnline ? "متصل 🟢" : "غير متصل 🔴";

        // Check friendship status (friends or not)
        const areFriends = userInfo[targetID].isFriend ? "نعم ✅" : "لا ❌";

        // Additional social media links (if available)
        const socialMediaLinks = userInfo[targetID].socialMediaLinks || " هذا المستخدم ليس لديه أي حسابات  للتواصل الإجتماعي على فيسبوك";

        const userInfoMessage = `
        < معلومات المستخدم >

        ▪︎ الإسم: ${userName}
        ▪︎ آيدي: ${uid}
        ▪︎ النوع: ${gender}
        ▪︎ ناريخ الإزدياد: ${birthday}
        ▪︎ الحالة: ${userStatus}
        ▪︎ الأصدقاء: ${areFriends}
        ▪︎ رابط فيسبوك: ${fbLink}

        ▪︎ صورة البروفايل: ${profilePicURL}

        🔗 روابط وسائل التواصل الاجتماعي الإضافية:
        ${socialMediaLinks}
        `;

        api.sendMessage(userInfoMessage, threadID, (error, info) => {
          if (!error) {
            api.sendTypingIndicator(threadID);

            // Add a delay to simulate typing
            setTimeout(() => {
              // Add emoji reactions to the message
              api.setMessageReaction("❤", info.messageID);
              api.setMessageReaction("😊", info.messageID);
              api.setMessageReaction("👍", info.messageID);
            }, 1000);
          }
        });
      } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while fetching user information.", threadID, messageID);
      }
    };

    if (!args[0]) {
      // If no UID is provided, use the sender's UID
      getUserInfo(senderID);
    } else if (args[0].indexOf("@") !== -1) {
      // If the message mentions a user, extract UID from mentions
      const mentionedUID = Object.keys(event.mentions)[0];
      if (mentionedUID) {
        getUserInfo(mentionedUID);
      }
    } else {
      api.sendMessage("استخدام الأمر غير صالح. إستخدم `معلومات2` أو `معلومات2 @منشن`.", threadID, messageID);
    }
  },
};
