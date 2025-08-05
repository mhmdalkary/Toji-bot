const { getStreamFromURL, uploadImgbb } = global.utils;

module.exports = { config: { name: "حماية_المجموعة", aliases: ["حماية", "مانع"], version: "2.0", author: "sifo anter - تعديل وترجمة Yuki", countDown: 5, role: 0, longdescription: { ar: "تشغيل أو إيقاف الحمايات الخاصة بالمجموعة" }, category: "إدارة المجموعة", guide: { ar: "   {pn} صورة [تشغيل | إيقاف]: منع تغيير صورة المجموعة" + "\n   {pn} اسم [تشغيل | إيقاف]: منع تغيير اسم المجموعة" + "\n   {pn} لقب [تشغيل | إيقاف]: منع تغيير الألقاب داخل المجموعة" + "\n   {pn} ثيم [تشغيل | إيقاف]: منع تغيير الثيم (الموضوع)" + "\n   {pn} رمز [تشغيل | إيقاف]: منع تغيير الرموز التعبيرية" + "\n   {pn} الكل تشغيل: لتفعيل جميع الحمايات دفعة واحدة" } },

langs: { ar: { allEnabled: "✦ تم تفعيل جميع الحمايات:\n⫸ صورة المجموعة\n⫸ اسم المجموعة\n⫸ الألقاب\n⫸ الثيم\n⫸ الرمز التعبيري", antiChangeAvatarOn: "تم تفعيل حماية تغيير صورة المجموعة", antiChangeAvatarOff: "تم إيقاف حماية تغيير صورة المجموعة", missingAvt: "لم يتم تعيين صورة للمجموعة", antiChangeNameOn: "تم تفعيل حماية تغيير اسم المجموعة", antiChangeNameOff: "تم إيقاف حماية تغيير اسم المجموعة", antiChangeNicknameOn: "تم تفعيل حماية تغيير الألقاب داخل المجموعة", antiChangeNicknameOff: "تم إيقاف حماية تغيير الألقاب داخل المجموعة", antiChangeThemeOn: "تم تفعيل حماية تغيير الثيم (الموضوع)", antiChangeThemeOff: "تم إيقاف حماية تغيير الثيم (الموضوع)", antiChangeEmojiOn: "تم تفعيل حماية تغيير الرموز التعبيرية", antiChangeEmojiOff: "تم إيقاف حماية تغيير الرموز التعبيرية", antiChangeAvatarAlreadyOn: "⚠️ حماية صورة المجموعة مفعلة مسبقًا", antiChangeNameAlreadyOn: "⚠️ حماية اسم المجموعة مفعلة مسبقًا", antiChangeNicknameAlreadyOn: "⚠️ حماية الألقاب مفعلة مسبقًا", antiChangeThemeAlreadyOn: "⚠️ حماية الثيم مفعلة مسبقًا", antiChangeEmojiAlreadyOn: "⚠️ حماية الرموز مفعلة مسبقًا" } },

onStart: async function ({ message, event, args, threadsData, getLang }) { const command = args[0]; const action = args[1]; if (!command || !["تشغيل", "إيقاف"].includes(action) && command !== "الكل") return message.SyntaxError();

const { threadID } = event;
const dataAnti = await threadsData.get(threadID, "data.antiChangeInfoBox", {});

async function checkAndSaveData(key, value) {
  if (action === "إيقاف") delete dataAnti[key];
  else dataAnti[key] = value;
  await threadsData.set(threadID, dataAnti, "data.antiChangeInfoBox");

  const replyKey = `antiChange${key[0].toUpperCase()}${key.slice(1)}${action === "تشغيل" ? "On" : "Off"}`;
  message.reply(getLang(replyKey));
}

if (command === "الكل" && action === "تشغيل") {
  const { imageSrc, threadName, members, threadThemeID, emoji } = await threadsData.get(threadID);
  if (imageSrc) dataAnti.avatar = (await uploadImgbb(imageSrc)).image.url;
  dataAnti.name = threadName;
  dataAnti.nickname = members.reduce((acc, u) => ({ ...acc, [u.userID]: u.nickname }), {});
  dataAnti.theme = threadThemeID;
  dataAnti.emoji = emoji;
  await threadsData.set(threadID, dataAnti, "data.antiChangeInfoBox");
  return message.reply(getLang("allEnabled"));
}

switch (command) {
  case "صورة": {
    const { imageSrc } = await threadsData.get(threadID);
    if (!imageSrc) return message.reply(getLang("missingAvt"));
    const newImage = await uploadImgbb(imageSrc);
    await checkAndSaveData("avatar", newImage.image.url);
    break;
  }
  case "اسم": {
    const { threadName } = await threadsData.get(threadID);
    await checkAndSaveData("name", threadName);
    break;
  }
  case "لقب": {
    const { members } = await threadsData.get(threadID);
    const nicknames = members.reduce((acc, u) => ({ ...acc, [u.userID]: u.nickname }), {});
    await checkAndSaveData("nickname", nicknames);
    break;
  }
  case "ثيم": {
    const { threadThemeID } = await threadsData.get(threadID);
    await checkAndSaveData("theme", threadThemeID);
    break;
  }
  case "رمز": {
    const { emoji } = await threadsData.get(threadID);
    await checkAndSaveData("emoji", emoji);
    break;
  }
  default:
    return message.SyntaxError();
}

},

onEvent: async function ({ message, event, threadsData, role, api, getLang }) { const { threadID, logMessageType, logMessageData, author } = event; const data = await threadsData.get(threadID, "data.antiChangeInfoBox", {}); const botID = api.getCurrentUserID();

const isAdminChange = role < 1 && botID !== author;

switch (logMessageType) {
  case "log:thread-image": {
    if (!data.avatar) return;
    return async () => {
      if (isAdminChange) {
        message.reply(getLang("antiChangeAvatarAlreadyOn"));
        api.changeGroupImage(await getStreamFromURL(data.avatar), threadID);
      } else {
        const newImg = await uploadImgbb(logMessageData.url);
        await threadsData.set(threadID, newImg.image.url, "data.antiChangeInfoBox.avatar");
      }
    };
  }
  case "log:thread-name": {
    if (!data.name) return;
    return async () => {
      if (isAdminChange) {
        message.reply(getLang("antiChangeNameAlreadyOn"));
        api.setTitle(data.name, threadID);
      } else {
        await threadsData.set(threadID, logMessageData.name, "data.antiChangeInfoBox.name");
      }
    };
  }
  case "log:user-nickname": {
    if (!data.nickname) return;
    return async () => {
      const { nickname, participant_id } = logMessageData;
      if (isAdminChange) {
        message.reply(getLang("antiChangeNicknameAlreadyOn"));
        api.changeNickname(data.nickname[participant_id], threadID, participant_id);
      } else {
        await threadsData.set(threadID, nickname, `data.antiChangeInfoBox.nickname.${participant_id}`);
      }
    };
  }
  case "log:thread-color": {
    if (!data.theme) return;
    return async () => {
      if (isAdminChange) {
        message.reply(getLang("antiChangeThemeAlreadyOn"));
        api.changeThreadColor(data.theme || "196241301102133", threadID);
      } else {
        await threadsData.set(threadID, logMessageData.theme_id, "data.antiChangeInfoBox.theme");
      }
    };
  }
  case "log:thread-icon": {
    if (!data.emoji) return;
    return async () => {
      if (isAdminChange) {
        message.reply(getLang("antiChangeEmojiAlreadyOn"));
        api.changeThreadEmoji(data.emoji, threadID);
      } else {
        await threadsData.set(threadID, logMessageData.thread_icon, "data.antiChangeInfoBox.emoji");
      }
    };
  }
}

} };

