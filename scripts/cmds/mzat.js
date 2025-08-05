const axios = require("axios");

module.exports = {
  config: {
    name: "مزه",
    aliases: ["انمي", "بنت", "جميله"],
    version: "1.0",
    longdescription: "يرسل صورة بنت عشوائية (أنمي أو واقعية)",
    category: "العاب",
    usage: "[انمي | واقعي]",
    role: 0,
    author: "ChatGPT"
  },

  onStart: async function ({ api, event, args }) {
    let type = args[0]?.toLowerCase();

    // الافتراضي: نوع عشوائي إذا ما تم تحديد
    if (!type || (type !== "انمي" && type !== "واقعي")) {
      type = Math.random() > 0.5 ? "انمي" : "واقعي";
    }

    let imageUrl;
    try {
      if (type === "انمي") {
        const res = await axios.get("https://nekos.best/api/v2/neko");
        imageUrl = res.data.results[0].url;
      } else if (type === "واقعي") {
        const res = await axios.get("https://api.waifu.pics/sfw/waifu"); // صور واقعية نمط أنمي
        imageUrl = res.data.url;
      }

      if (!imageUrl) {
        return api.sendMessage("❌ لم أتمكن من جلب الصورة، حاول لاحقًا.", event.threadID);
      }

      const img = (await axios.get(imageUrl, { responseType: "stream" })).data;

      api.sendMessage({
        body: `🌸 هذه ${type === "انمي" ? "مزّة أنمي" : "مزّة واقعية"} عشوائية لك!`,
        attachment: img
      }, event.threadID, event.messageID);
    } catch (err) {
      console.error("Error fetching image:", err);
      api.sendMessage("❌ حدث خطأ أثناء جلب الصورة، ربما تم حظرنا مؤقتًا. حاول لاحقًا.", event.threadID);
    }
  }
};
