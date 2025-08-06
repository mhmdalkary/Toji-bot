module.exports.config = {
 name: "قفل",
 eventType: ["log:unsubscribe"],
 version: "0.0.1",
 credits: "𝐊𝐈𝐓𝐄 凧",
 description: "Listen events"
};

module.exports.run = async({ event, api, Threads, Users }) => {
 let data = (await Threads.getData(event.threadID)).data || {};
 if (data.antiout == false) return;
 if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;
 const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
 const type = (event.author == event.logMessageData.leftParticipantFbId) ? "self-separation" : "هل طردني شخص ما ?";
 if (type == "self-separation") {
  api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID, (error, info) => {
   if (error) {
    api.sendMessage(`لا يمكن اضافة 🥺 ${name} الى المجموعة مجددا :( `, event.threadID)
   } else api.sendMessage(`لا ترحل عزيزي , ${name} انظر, اشتقت لك واضفتك مجددا`, event.threadID);
  })
 }
}
