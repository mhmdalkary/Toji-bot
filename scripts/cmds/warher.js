const axios = require("axios");
const moment = require("moment-timezone");

function convertFtoC(F) {
    return Math.floor((F - 32) / 1.8);
}
function formatHours(hours) {
    return moment(hours).tz("Africa/Casablanca").format("HH[h]mm[p]");
}

module.exports = {
    config: {
        name: "طقس",
        version: "1.2",
        author: "NTKhang",
        countDown: 5,
        role: 0,
        description: {
            vi: "xem dự báo thời tiết hiện tại và 5 ngày sau",
            ar: "قم بالتطلع على الطقس الحالي والتوقعات للطقس في الخمس الايام التوالي"
        },
        category: "أخرى",
        guide: {
            vi: "{pn} <địa điểm>",
            ar: "{pn} <location>"
        },
        envGlobal: {
            weatherApiKey: "d7e795ae6a0d44aaa8abb1a0a7ac19e4"
        }
    },

    langs: {
        vi: {
            syntaxError: "Vui lòng nhập địa điểm",
            notFound: "Không thể tìm thấy địa điểm: %1",
            error: "Đã xảy ra lỗi: %1",
            today: "Thời tiết hôm nay: %1\n%2\n🌡 Nhiệt độ thấp nhất - cao nhất %3°C - %4°C\n🌡 Nhiệt độ cảm nhận được %5°C - %6°C\n🌅 Mặt trời mọc %7\n🌄 Mặt trời lặn %8\n🌃 Mặt trăng mọc %9\n🏙️ Mặt trăng lặn %10\n🌞 Ban ngày: %11\n🌙 Ban đêm: %12"
        },
        ar: {
            syntaxError: " ⚠️ | أرجوك قم بإدخال إسم الموقع",
            notFound: " ❌ | لم يتم إيجاد الموقع بالنسبة للإسم المعطى : %1",
            error: " ❌ | حدث خطأ ما : %1",
            today: "الطقس اليوم : %1\n%2\n🌡 ضعيف - حرارة عالية %3°C - %4°C\n🌡 تشعر وكأنها %5°C - %6°C\n🌅 شروق الشمس %7\n🌄 الغروب %8\n🌃 طلوع القمر  %9\n🏙️ نزول القمر %10\n🌞 النهار : %11\n🌙 الليل : %12"
        }
    },

    onStart: async function ({ args, message, envGlobal, getLang }) {
        const apikey = envGlobal.weatherApiKey;

        const area = args.join(" ");
        if (!area)
            return message.reply(getLang("syntaxError"));
        let areaKey, dataWeather, areaName;

        try {
            const response = (await axios.get(`https://api.accuweather.com/locations/v1/cities/search.json?q=${encodeURIComponent(area)}&apikey=${apikey}&language=ar`)).data;
            if (response.length == 0)
                return message.reply(getLang("notFound", area));
            const data = response[0];
            areaKey = data.Key;
            areaName = data.LocalizedName;
        }
        catch (err) {
            return message.reply(getLang("error", err.response?.data?.Message || err.message));
        }

        try {
            dataWeather = (await axios.get(`http://api.accuweather.com/forecasts/v1/daily/10day/${areaKey}?apikey=${apikey}&details=true&language=ar`)).data;
        }
        catch (err) {
            return message.reply(getLang("error", err.response?.data?.Message || err.message));
        }

        const dataWeatherDaily = dataWeather.DailyForecasts;
        const dataWeatherToday = dataWeatherDaily[0];
        const msg = getLang("today", areaName, dataWeather.Headline.Text, convertFtoC(dataWeatherToday.Temperature.Minimum.Value), convertFtoC(dataWeatherToday.Temperature.Maximum.Value), convertFtoC(dataWeatherToday.RealFeelTemperature.Minimum.Value), convertFtoC(dataWeatherToday.RealFeelTemperature.Maximum.Value), formatHours(dataWeatherToday.Sun.Rise), formatHours(dataWeatherToday.Sun.Set), formatHours(dataWeatherToday.Moon.Rise), formatHours(dataWeatherToday.Moon.Set), dataWeatherToday.Day.LongPhrase, dataWeatherToday.Night.LongPhrase);

        return message.reply(msg);
    }
};