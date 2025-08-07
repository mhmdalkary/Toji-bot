const axios = require("axios");

module.exports = {
  config: {
    name: "توجي",
    aliases: ["zeki", "ai", "ذكاء"],
    description: "AI Chat using external API",
    usage: "ذكي <your message>",
    cooldown: 3,
    permissions: []
  },

  run: async ({ api, event, args }) => {
    const query = args.join(" ");
    if (!query) return api.sendMessage("❗ Please provide a prompt.\nExample: ذكي كيف حالك؟", event.threadID, event.messageID);

    try {
      const { data } = await axios.get(`https://gpt-3-1-clhs.onrender.com/chat?text=${encodeURIComponent(query)}`);
      const reply = data?.reply || "⚠️ No response received.";
      api.sendMessage(reply, event.threadID, event.messageID);
    } catch (error) {
      api.sendMessage("❌ Failed to fetch response from AI API.", event.threadID, event.messageID);
      console.error("AI Error:", error.message);
    }
  }
};