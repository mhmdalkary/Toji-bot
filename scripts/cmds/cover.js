const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
    config: {
        name: "بنر",
        version: "1.0",
        author: "محمد ✨",
        countDown: 10,
        role: 0,
        shortDescription: "قم بإنشاء بنر باسم ونص مخصص",
        longDescription: "",
        category: "ميمز وتعديل الصور",
        guide: {
            ar: "{p}{n} الرمز أو الاسم | الاسم | النص"
        }
    },

    onStart: async function ({ message, args, event, api }) {

        const info = args.join(" ");
        if (!info) {
            return message.reply(`⚠️ | أرجوك قم بإدخال البيانات بهذه الصيغة:\n/بنر  الرمز أو الاسم | الاسم | النص`);
        }

        const msg = info.split("|");
        const id = msg[0]?.trim();
        const name = msg[1]?.trim();
        const text = msg[2]?.trim();

        if (!id || !name || !text) {
            return message.reply(`⚠️ | البيانات ناقصة! يرجى التأكد من إدخالها كما يلي:\n/بنر الرمز أو الاسم | الاسم | النص`);
        }

        if (isNaN(id)) {
            await message.reply("⏱️ | جاري البحث عن الرمز، انتظر قليلًا...");

            let id1;
            try {
                const response = await axios.get(`https://www.nguyenmanh.name.vn/api/searchAvt?key=${id}`);
                id1 = response.data.result.ID;

                const img = `https://www.nguyenmanh.name.vn/api/avtWibu?id=${id1}&tenchinh=${name}&tenphu=${text}&apikey=CF9unN3H`;
                const form = {
                    body: `✅ | إليك البنر الخاص بك 🎉`,
                    attachment: [await global.utils.getStreamFromURL(img)]
                };
                return message.reply(form);

            } catch (error) {
                // في حال لم يتم العثور على الشخصية
                const fallback = `https://api.dicebear.com/7.x/fun-emoji/png?seed=${encodeURIComponent(id)}`;
                const form = {
                    body: `⚠️ | لم يتم العثور على الشخصية "${id}"، لذلك تم توليد بنر بديل 🎨`,
                    attachment: [await global.utils.getStreamFromURL(fallback)]
                };
                return message.reply(form);
            }

        } else {
            await message.reply("⏱️ | جاري إنشاء البنر الخاص بك، انتظر قليلاً...");

            const img = `https://www.nguyenmanh.name.vn/api/avtWibu?id=${id}&tenchinh=${name}&tenphu=${text}&apikey=CF9unN3H`;
            const form = {
                body: `✅ | إليك البنر الخاص بك ✨`,
                attachment: [await global.utils.getStreamFromURL(img)]
            };
            return message.reply(form);
        }
    }
};
         let id1;
    try {
        id1 = (await axios.get(`https://www.nguyenmanh.name.vn/api/searchAvt?key=${id}`)).data.result.ID; 
    } catch (error) {
      await message.reply(" ⚠️ |لم يتم العثور على الشخصية، يرجى التحقق من الاسم والمحاولة مرة أخرى...");
      return;
    }

        const img = (`https://www.nguyenmanh.name.vn/api/avtWibu3?id=${id1}&tenchinh=${name}&tenphu=${juswa}&apikey=CF9unN3H`)                        
                 const form = {
                                body: `إليك الأڤتار الخاص بك ✨`
                        };
                                form.attachment = []
                                form.attachment[0] = await global.utils.getStreamFromURL(img);
                        message.reply(form); 



       }else  { 
       await message.reply(" ⏱️ |جاري معالجة طلبك يرحى الإنتظار....");

         const img = (`https://www.nguyenmanh.name.vn/api/avtWibu3?id=${id}&tenchinh=${name}&tenphu=${juswa}&apikey=CF9unN3H`)                        
                 const form = {
                                body: ` ✅ | إليك الأڤتار الخاص بك`
                        };
                                form.attachment = []
                                form.attachment[0] = await global.utils.getStreamFromURL(img);
                        message.reply(form); 
        }
      }
    }
   }; 
