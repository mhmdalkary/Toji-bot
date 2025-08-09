module.exports = {
        config: {
                name: "عيد_ميلاد_المالك",
                version: "1.0",
                author: "NTKhang",
                countDown: 5,
                role: 0,
                category: "المالك",
                guide: {
                        vi: "See Admin's Birthday",
                        ar: "قم برؤية عيد ميلاد المالك"
                } 
        },

        onStart: async function ({ event, api }) {
                const t = Date.parse("يونيو 14, 2026 00:00:00") - Date.parse(new Date());
    const seconds = Math.floor( (t/1000) % 60 );
    const minutes = Math.floor( (t/1000/60) % 60 );
    const hours = Math.floor( (t/(1000*60*60)) % 24 );
    const days = Math.floor( t/(1000*60*60*24) );

    return api.sendMessage(`「تذكير بعدد أيام عيد ميلاد حمود التي تبقت لكي يأتي」\n» ${days} أيام ${hours} ساعات ${minutes} دقائق ${seconds} ثواني «`, event.threadID, event.messageID);
        }
};
