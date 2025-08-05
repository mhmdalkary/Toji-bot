const axios = require("axios");
const fs = require("fs");
const path = require("path");

const voices = [
  { id: 1, name: "Goku - Dragon Ball", uuid: "TM:8r9r6q8z8x93" },
  // ... بقائمة الأصوات الأخرى بنفس الهيئة ...
  { id: 100, name: "Crane - Kung Fu Panda", uuid: "TM:zvql4t0ps7mf" }
];

module.exports = {
  config: {
    name: "قول",
    version: "1.2",
    hasPermission: 0,
    credits: "ChatGPT + محمد حسن",
    description: "تحويل نص إلى صوت بشخصيات مشهورة عبر FakeYou",
    commandCategory: "ذكاء صناعي",
    usages: "[رقم] [النص]",
    cooldowns: 10
  },

  onStart: async function ({ api, event, args }) {
    try {
      const number = parseInt(args[0]);
      const text = args.slice(1).join(" ");

      if (!number || isNaN(number) || number < 1 || number > voices.length || !text) {
        const list = voices.map(v => `${v.id}. ${v.name}`).join("\n");
        return api.sendMessage(
          `⚠️ | الاستخدام الصحيح: قول [رقم الشخصية] [النص]\n\n📜 | قائمة الشخصيات:\n${list}\n\nمثال: قول 1 مرحبا كيف حالك`,
          event.threadID,
          event.messageID
        );
      }

      const selectedVoice = voices.find(v => v.id === number);
      
      await api.sendMessage(`🔄 | جاري تحويل النص إلى صوت بصوت ${selectedVoice.name}...`, event.threadID, event.messageID);

      const response = await axios.post("https://api.fakeyou.com/tts", {
        uuid: selectedVoice.uuid,
        text: text
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.data || !response.data.audio_url) {
        throw new Error("لم يتم العثور على رابط الصوت في الاستجابة");
      }

      const audioPath = path.join(__dirname, 'cache', `voice_${event.senderID}_${Date.now()}.mp3`);
      const writer = fs.createWriteStream(audioPath);

      const audioResponse = await axios({
        method: 'get',
        url: response.data.audio_url,
        responseType: 'stream'
      });

      audioResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      await api.sendMessage({
        body: `✅ | تم تحويل النص إلى صوت بنجاح:\n🎤 | الشخصية: ${selectedVoice.name}`,
        attachment: fs.createReadStream(audioPath)
      }, event.threadID, () => {
        fs.unlink(audioPath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      });

    } catch (error) {
      console.error(error);
      api.sendMessage(
        `❌ | حدث خطأ أثناء معالجة طلبك:\n${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};  { id: 59, name: "Freddy - FNAF", uuid: "TM:vzt2c5q2kqg6" },
  { id: 60, name: "Bonnie - FNAF", uuid: "TM:rfr9t0hxgg6f" },
  { id: 61, name: "Chica - FNAF", uuid: "TM:mqtkxfn6mv74" },
  { id: 62, name: "Foxy - FNAF", uuid: "TM:nphlqz7x5d2x" },
  { id: 63, name: "Springtrap - FNAF", uuid: "TM:yrj7v4z8n63p" },
  { id: 64, name: "Toy Freddy", uuid: "TM:0w99zv7h7zn4" },
  { id: 65, name: "Toy Bonnie", uuid: "TM:kq0tg7kpjqx7" },
  { id: 66, name: "Toy Chica", uuid: "TM:x76tq8kg38wf" },
  { id: 67, name: "Balloon Boy", uuid: "TM:ykh4yz67tq7q" },
  { id: 68, name: "Mangle", uuid: "TM:nmj6lf3z2m9y" },
  { id: 69, name: "Circus Baby", uuid: "TM:k2c7zghsk6xv" },
  { id: 70, name: "Gregory - FNAF SB", uuid: "TM:g4mnxvn78rzz" },
  { id: 71, name: "Vanny - FNAF", uuid: "TM:09zxms6hr9l8" },
  { id: 72, name: "Glamrock Freddy", uuid: "TM:49d49j9pkmwh" },
  { id: 73, name: "Glamrock Chica", uuid: "TM:sj7m5x4md78g" },
  { id: 74, name: "Roxanne Wolf", uuid: "TM:x5d9s7tyf5p1" },
  { id: 75, name: "Montgomery Gator", uuid: "TM:pb9kkw2ssr4t" },
  { id: 76, name: "Sun/Moon - FNAF", uuid: "TM:jpp6rqfkgxqk" },
  { id: 77, name: "Golden Freddy", uuid: "TM:8dpx6gtrkhv0" },
  { id: 78, name: "Baldi", uuid: "TM:n1bt5s7qv6zr" },
  { id: 79, name: "Cuphead", uuid: "TM:48tp67snhc2j" },
  { id: 80, name: "Bendy", uuid: "TM:n54dzzptmlkt" },
  { id: 81, name: "Sans - Undertale", uuid: "TM:2wn2hvs76mgk" },
  { id: 82, name: "Papyrus - Undertale", uuid: "TM:y80fwt9sv36n" },
  { id: 83, name: "Frisk - Undertale", uuid: "TM:xznxvlgcrpn6" },
  { id: 84, name: "Undyne - Undertale", uuid: "TM:xzltgk3d5lqv" },
  { id: 85, name: "Flowey - Undertale", uuid: "TM:n9z3ykt84xzg" },
  { id: 86, name: "Asgore - Undertale", uuid: "TM:qxr3g7sz4j7n" },
  { id: 87, name: "Mettaton - Undertale", uuid: "TM:x6jv4dh5zr2x" },
  { id: 88, name: "Toriel - Undertale", uuid: "TM:7ctgzh5qqlyj" },
  { id: 89, name: "Alphys - Undertale", uuid: "TM:nmrq3t3khc0g" },
  { id: 90, name: "Cuphead Narrator", uuid: "TM:ly9nk4h5qrvg" },
  { id: 91, name: "Shrek", uuid: "TM:rvfhzpy3d4g3" },
  { id: 92, name: "Donkey - Shrek", uuid: "TM:xf3v8w6lfqgy" },
  { id: 93, name: "Fiona - Shrek", uuid: "TM:vjs4n8k9gctn" },
  { id: 94, name: "Lord Farquaad", uuid: "TM:p7yxkqdfk47z" },
  { id: 95, name: "Po - Kung Fu Panda", uuid: "TM:94kccydrg3nn" },
  { id: 96, name: "Master Shifu", uuid: "TM:78zwtmxd9dfh" },
  { id: 97, name: "Tigress", uuid: "TM:prgcs0k5htyq" },
  { id: 98, name: "Tai Lung", uuid: "TM:0x9z9hjph5dd" },
  { id: 99, name: "Monkey - Kung Fu Panda", uuid: "TM:sxr9q89n5kh3" },
  { id: 100, name: "Crane - Kung Fu Panda", uuid: "TM:zvql4t0ps7mf" },
];

module.exports.config = {
  name: "قول",
  version: "1.1",
  hasPermission: 0,
  credits: "ChatGPT + محمد حسن",
  longdescription: "تحويل نص إلى صوت بشخصيات مشهورة عبر FakeYou",
  commandCategory: "ذكاء صناعي",
  usages: "[رقم] [النص]",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
  const number = parseInt(args[0]);
  const text = args.slice(1).join(" ");

  if (!number || number < 1 || number > voices.length || !text) {
    const list = voices.map(v => `${v.id}. ${v.name}`).join("\n");
    return api.sendMessage(
      `❌ رقم غير صحيح أو لم يتم كتابة نص.\n🗣️ الشخصيات المتاحة:\n\n${list}`,
      event.threadID,
      event.messageID
    );
  }

  const selectedVoice = voices[number - 1];

  api.sendMessage(`🎙️ جاري تحويل النص إلى صوت (${selectedVoice.name})...`, event.threadID, async () => {
    try {
      const response = await axios.post("https://api.fakeyou.com/tts", {
        uuid: selectedVoice.uuid,
        text
      });

const audioURL = response.data.audio_url;
const audioPath = path.join(__dirname, `temp_${Date.now()}.mp3`);
const writer = fs.createWriteStream(audioPath);
const audioStream = await axios.get(audioURL, { responseType: "stream" });
audioStream.data.pipe(writer);

writer.on("finish", () => {
  api.sendMessage(
    {
      body: `🗣️ صوت: ${selectedVoice.name}`,
      attachment: fs.createReadStream(audioPath)
    },
    event.threadID,
    () => fs.unlinkSync(audioPath),
    event.messageID // إذا مكتبتك تدعمه هنا، أو تقدر تشيله لو ما يحتاج
  );
});
