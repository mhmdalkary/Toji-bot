const axios = require("axios");
const fs = require("fs");
const path = require("path");

const voices = [
  { id: 1, name: "Goku - Dragon Ball", uuid: "TM:8r9r6q8z8x93" },
  { id: 2, name: "Vegeta - Dragon Ball", uuid: "TM:39q2g3c5e6de" },
  // ... بقية القائمة كما هي ...
  { id: 100, name: "Crane - Kung Fu Panda", uuid: "TM:zvql4t0ps7mf" }
];

module.exports = {
  config: {
    name: "قول",
    version: "1.2",
    author: "Your Name",
    countDown: 5,
    role: 0,
    shortDescription: "تحويل النص إلى صوت",
    longDescription: "تحويل النص إلى صوت باستخدام شخصيات مختلفة",
    category: "الترفيه",
    guide: {
      en: "{pn} [رقم الشخصية] [النص]"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      // إذا لم يتم إدخال أي بيانات
      if (args.length === 0) {
        return sendVoiceList(api, event, voices);
      }

      const number = parseInt(args[0]);
      const text = args.slice(1).join(" ");

      // إذا كان الرقم غير صالح أو النص فارغ
      if (isNaN(number) || number < 1 || number > voices.length || !text) {
        return sendVoiceList(api, event, voices);
      }

      const selectedVoice = voices.find(v => v.id === number);    
          
      api.sendMessage(`🔄 | جاري تحويل النص إلى صوت بصوت ${selectedVoice.name}...`, event.threadID);    

      const response = await axios.post("https://api.fakeyou.com/tts", {    
        uuid: selectedVoice.uuid,    
        text: text    
      });    

      if (!response.data?.audio_url) {    
        throw new Error("فشل في الحصول على رابط الصوت");    
      }    

      const audioPath = path.join(__dirname, 'cache', `voice_${event.senderID}.mp3`);    
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
};

// دالة مساعدة لإرسال قائمة الشخصيات
function sendVoiceList(api, event, voices) {
  const voiceList = voices.map(v => `${v.id}. ${v.name}`).join("\n");
  return api.sendMessage(
    `⚠️ | الاستخدام الصحيح: قول [رقم الشخصية] [النص]\n\n📜 | قائمة الشخصيات المتاحة:\n\n${voiceList}\n\nمثال: قول 1 مرحبا كيف حالك`,
    event.threadID,
    event.messageID
  );
}
