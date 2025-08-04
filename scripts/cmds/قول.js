const axios = require("axios");
const fs = require("fs");
const path = require("path");

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

// قائمة الشخصيات الصوتية مع UUID (استخدم UUID الحقيقي إن لزم)
// voices.js

module.exports = [
  { id: 1, name: "Goku - Dragon Ball", uuid: "TM:8r9r6q8z8x93" },
  { id: 2, name: "Vegeta - Dragon Ball", uuid: "TM:39q2g3c5e6de" },
  { id: 3, name: "Naruto Uzumaki", uuid: "TM:ck8pqt9x46zd" },
  { id: 4, name: "Sasuke Uchiha", uuid: "TM:fwge0s02z4tq" },
  { id: 5, name: "Kakashi Hatake", uuid: "TM:03zqkfy3mht1" },
  { id: 6, name: "Itachi Uchiha", uuid: "TM:utn2q8tvuvs6" },
  { id: 7, name: "Gojo Satoru - Jujutsu", uuid: "TM:9w3fchq3cf14" },
  { id: 8, name: "Toji Fushiguro", uuid: "TM:7xch38z6y1v0" },
  { id: 9, name: "Luffy - One Piece", uuid: "TM:wmpfkzq46g9z" },
  { id: 10, name: "Zoro - One Piece", uuid: "TM:56y20glphvrg" },
  { id: 11, name: "Sanji - One Piece", uuid: "TM:z4cyrxd84ljg" },
  { id: 12, name: "Light Yagami", uuid: "TM:29kv8m6pmu95" },
  { id: 13, name: "L Lawliet", uuid: "TM:h83xv0k50rmk" },
  { id: 14, name: "SpongeBob", uuid: "TM:ehd0xk5kd8s3" },
  { id: 15, name: "Patrick Star", uuid: "TM:stct5g9zzjsz" },
  { id: 16, name: "Squidward", uuid: "TM:zv7w3hd9qlyr" },
  { id: 17, name: "Rick Sanchez", uuid: "TM:pc2z0fw3zhgd" },
  { id: 18, name: "Morty Smith", uuid: "TM:76dfyxjntthd" },
  { id: 19, name: "Homer Simpson", uuid: "TM:vlnz3sj85h5z" },
  { id: 20, name: "Bart Simpson", uuid: "TM:2kj0bd05ptff" },
  { id: 21, name: "Peter Griffin", uuid: "TM:zhfg2g8fz9vw" },
  { id: 22, name: "Stewie Griffin", uuid: "TM:54g3kxqqs3sn" },
  { id: 23, name: "Lois Griffin", uuid: "TM:q3ts5tv2ztzr" },
  { id: 24, name: "Meg Griffin", uuid: "TM:yb1q6sgt7q4q" },
  { id: 25, name: "Cleveland Brown", uuid: "TM:v2j40wv4g9qf" },
  { id: 26, name: "Joe Swanson", uuid: "TM:6vdm2mt1x0y6" },
  { id: 27, name: "Quagmire", uuid: "TM:4n5xvklck64r" },
  { id: 28, name: "Batman (Animated)", uuid: "TM:8xh5svx93zrt" },
  { id: 29, name: "Joker (Mark Hamill)", uuid: "TM:ax36dqxlf5wd" },
  { id: 30, name: "Iron Man (Tony Stark)", uuid: "TM:kkkpl38fwzyz" },
  { id: 31, name: "Captain America", uuid: "TM:7t7v9fgh8hrj" },
  { id: 32, name: "Thor", uuid: "TM:1c6dhf3t4yx3" },
  { id: 33, name: "Hulk", uuid: "TM:nc9jwdgqkgy1" },
  { id: 34, name: "Deadpool", uuid: "TM:r8vjxqz83vxd" },
  { id: 35, name: "Doctor Strange", uuid: "TM:xnd6j5s2c5nd" },
  { id: 36, name: "Black Panther", uuid: "TM:jzm99f1kft0t" },
  { id: 37, name: "Thanos", uuid: "TM:7n0ygtvh9ylf" },
  { id: 38, name: "Yoda", uuid: "TM:0zrgxh8n9n7k" },
  { id: 39, name: "Darth Vader", uuid: "TM:3phzqwr7r9w4" },
  { id: 40, name: "Obi-Wan Kenobi", uuid: "TM:bp1yt84jzpzs" },
  { id: 41, name: "Anakin Skywalker", uuid: "TM:dnsc0qptgs92" },
  { id: 42, name: "Ash Ketchum", uuid: "TM:s9tm9ch4yprv" },
  { id: 43, name: "Pikachu", uuid: "TM:yd6rztpmh0s5" },
  { id: 44, name: "Charizard", uuid: "TM:v84lj9hdzd0f" },
  { id: 45, name: "Mewtwo", uuid: "TM:8w3yn7t0gmgd" },
  { id: 46, name: "Elsa - Frozen", uuid: "TM:mx20d3tz6k0n" },
  { id: 47, name: "Anna - Frozen", uuid: "TM:9kq7r5gdfvss" },
  { id: 48, name: "Mickey Mouse", uuid: "TM:7bzp3s5dnq4k" },
  { id: 49, name: "Donald Duck", uuid: "TM:wh54nhh2kk9c" },
  { id: 50, name: "Goofy", uuid: "TM:kyrkfd8kft7g" },
  { id: 51, name: "Minion", uuid: "TM:tyd4pz9gd5nr" },
  { id: 52, name: "Mario", uuid: "TM:2k0c5zdng5s3" },
  { id: 53, name: "Luigi", uuid: "TM:bt2vj8f0pr88" },
  { id: 54, name: "Wario", uuid: "TM:n1ntdph9lv90" },
  { id: 55, name: "Bowser", uuid: "TM:6hfccrgt3s8k" },
  { id: 56, name: "Toad", uuid: "TM:rfkpjz4qs5m1" },
  { id: 57, name: "Link - Zelda", uuid: "TM:zjz4dn8np6ps" },
  { id: 58, name: "Zelda", uuid: "TM:w0l4tfkcpn9t" },
  { id: 59, name: "Ganondorf", uuid: "TM:yy0x98z2djrn" },
  { id: 60, name: "Steve - Minecraft", uuid: "TM:q57xmpxmp62g" },
  { id: 61, name: "Creeper - Minecraft", uuid: "TM:tr7q3nff4m4y" },
  { id: 62, name: "Freddy - FNAF", uuid: "TM:vzt2c5q2kqg6" },
  { id: 63, name: "Bonnie - FNAF", uuid: "TM:rfr9t0hxgg6f" },
  { id: 64, name: "Chica - FNAF", uuid: "TM:mqtkxfn6mv74" },
  { id: 65, name: "Foxy - FNAF", uuid: "TM:nphlqz7x5d2x" },
  { id: 66, name: "Springtrap - FNAF", uuid: "TM:yrj7v4z8n63p" },
  { id: 67, name: "Toy Freddy", uuid: "TM:0w99zv7h7zn4" },
  { id: 68, name: "Toy Bonnie", uuid: "TM:kq0tg7kpjqx7" },
  { id: 69, name: "Toy Chica", uuid: "TM:x76tq8kg38wf" },
  { id: 70, name: "Balloon Boy", uuid: "TM:ykh4yz67tq7q" },
  { id: 71, name: "Mangle", uuid: "TM:nmj6lf3z2m9y" },
  { id: 72, name: "Circus Baby", uuid: "TM:k2c7zghsk6xv" },
  { id: 73, name: "Ennard", uuid: "TM:wpx79x49pgwd" },
  { id: 74, name: "Gregory - FNAF SB", uuid: "TM:g4mnxvn78rzz" },
  { id: 75, name: "Vanny - FNAF", uuid: "TM:09zxms6hr9l8" },
  { id: 76, name: "Glamrock Freddy", uuid: "TM:49d49j9pkmwh" },
  { id: 77, name: "Glamrock Chica", uuid: "TM:sj7m5x4md78g" },
  { id: 78, name: "Roxanne Wolf", uuid: "TM:x5d9s7tyf5p1" },
  { id: 79, name: "Montgomery Gator", uuid: "TM:pb9kkw2ssr4t" },
  { id: 80, name: "Sun/Moon - FNAF", uuid: "TM:jpp6rqfkgxqk" },
  { id: 81, name: "Golden Freddy", uuid: "TM:8dpx6gtrkhv0" },
];

module.exports.run = async function ({ api, event, args }) {
  const number = parseInt(args[0]);
  const text = args.slice(1).join(" ");

  // تحقق من صحة الرقم
  if (!number || number < 1 || number > voices.length || !text) {
    const list = voices
      .map(v => `${v.id}. ${v.name}`)
      .join("\n");

    return api.sendMessage(
      `❌ رقم غير صحيح أو لم يتم كتابة نص.\n🗣️ الشخصيات المتاحة:\n\n${list}`,
      event.threadID,
      event.messageID
    );
  }

  const selectedVoice = voices[number - 1];

  // إرسال الطلب إلى FakeYou (هنا يجب تعديل هذه الجزئية حسب API المتاح)
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
          { body: `🗣️ صوت: ${selectedVoice.name}`, attachment: fs.createReadStream(audioPath) },
          event.threadID,
          () => fs.unlinkSync(audioPath),
          event.messageID
        );
      });
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ حدث خطأ أثناء تحويل النص إلى صوت.", event.threadID, event.messageID);
    }
  });
};