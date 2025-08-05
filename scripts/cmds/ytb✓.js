const axios = require("axios");
const ytdl = require("ytdl-core");
const { getStreamFromURL, downloadFile } = global.utils;
async function getStreamAndSize(url, path = "") {
	const response = await axios({
		method: "GET",
		url,
		responseType: "stream"
	});
	if (path)
		response.data.path = path;
	const totalLength = response.headers["content-length"];
	return {
		stream: response.data,
		size: totalLength
	};
}

module.exports = {
	config: {
		name: "يوتيوب",
		version: "1.9",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		shortDescription: "بحث في اليوتيوب 🙂",
		longDescription: {
			vi: "Tải video, audio hoặc xem thông tin video trên YouTube",
			en: "تحميل أغاني و فيديوهات من اليوتيوب ✓"
		},
		category: "أدوات",
		guide: {
			vi: "   {pn} [video|-v] [<tên video>|<link video>]: dùng để tải video từ youtube."
				+ "\n   {pn} [audio|-a] [<tên video>|<link video>]: dùng để tải audio từ youtube"
				+ "\n   {pn} [info|-i] [<tên video>|<link video>]: dùng để xem thông tin video từ youtube"
				+ "\n   Ví dụ:"
				+ "\n    {pn} -v Fallen Kingdom"
				+ "\n    {pn} -a Fallen Kingdom"
				+ "\n    {pn} -i Fallen Kingdom",
			ar: "   يوتيوب [فيديوا|-v] [<إسم الفيديوا>|<رابط الفيديوا>]: لتحميل الفيديو من فايسبوك."
				+ "\n   يوتيوب [أغنية|-a] [<إسم مقطع الأغنية>|<رابطه>]: كي تحمل المقطع الصوتي فقط"
				+ "\n   يوتيوب [معلومات|-i] [<إسم المقطع>|<رابط المقطع>]: رؤية معلومات المقطع 🌝"
				+ "\n   مثلا:"
				+ "\n    يوتيوب فيديو وان بيس"
				+ "\n    يوتيوب أغنية إسم الأغنية"
				+ "\n    يوتيوب معلومات إسم المقطع"
		}
	},

	langs: {
		vi: {
			error: "Đã xảy ra lỗi: %1",
			noResult: "Không có kết quả tìm kiếm nào phù hợp với từ khóa %1",
			choose: "%1Reply tin nhắn với số để chọn hoặc nội dung bất kì để gỡ",
			downloading: "Đang tải xuống video %1",
			noVideo: "Rất tiếc, không tìm thấy video nào có dung lượng nhỏ hơn 83MB",
			downloadingAudio: "Đang tải xuống audio %1",
			noAudio: "Rất tiếc, không tìm thấy audio nào có dung lượng nhỏ hơn 26MB",
			info: "💠 Tiêu đề: %1\n🏪 Channel: %2\n👨‍👩‍👧‍👦 Subscriber: %3\n⏱ Thời gian video: %4\n👀 Lượt xem: %5\n👍 Lượt thích: %6\n🆙 Ngày tải lên: %7\n🔠 ID: %8\n🔗 Link: %9",
			listChapter: "\n📖 Danh sách phân đoạn: %1\n"
		},
		ar: {
			error: "خطأ عند: %1",
			noResult: "حط كلام البحث ل %1",
			choose: "%1رد برقم على هذه الرسالة ❤️",
			downloading: "جاري تحميل مقطع %1",
			noVideo: "لا يمكن تحميل مقطع يتعدى 83MB",
			downloadingAudio: "تحميل أغنية %1 أصبر...",
			noAudio: "لا يمكن تحميل أغنية تتعدى 26MB",
			info: "💠 العنوان: %1\n🏪 القناة: %2\n👨‍👩‍👧‍👦 عدد المشتركين: %3\n⏱ مدة الفيديوا: %4\n👀 عدد المشاهدات: %5\n👍 عدد اللايكات: %6\n🆙 تاريخ رفع المقطع: %7\n🔠 الآيدي: %8\n🔗 الرابط: %9",
			listChapter: "\n📖 قائمة الأجزاء: %1\n"
		}
	},

	onStart: async function ({ args, message, event, commandName, getLang }) {
		let type;
		switch (args[0]) {
			case "-v":
			case "فيديوا":
				type = "video";
				break;
			case "-a":
			case "-s":
			case "أغنية":
			case "sing":
				type = "audio";
				break;
			case "-i":
			case "معلومات":
				type = "info";
				break;
			default:
				return message.SyntaxError();
		}

		const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
		const urlYtb = checkurl.test(args[1]);

		if (urlYtb) {
			const infoVideo = await getVideoInfo(args[1]);
			handle({ type, infoVideo, message, downloadFile, getLang });
			return;
		}

		const keyWord = args.slice(1).join(" ");
		const maxResults = 6;

		let result;
		try {
			result = (await search(keyWord)).slice(0, maxResults);
		}
		catch (err) {
			return message.reply(getLang("error", err.message));
		}
		if (result.length == 0)
			return message.reply(getLang("noResult", keyWord));
		let msg = "";
		let i = 1;
		const thumbnails = [];
		const arrayID = [];

		for (const info of result) {
			thumbnails.push(getStreamFromURL(info.thumbnail));
			msg += `${i++}. ${info.title}\nTime: ${info.time}\nChannel: ${info.channel.name}\n\n`;
		}

		message.reply({
			body: getLang("choose", msg),
			attachment: await Promise.all(thumbnails)
		}, (err, info) => {
			global.GoatBot.onReply.set(info.messageID, {
				commandName,
				messageID: info.messageID,
				author: event.senderID,
				arrayID,
				result,
				type
			});
		});
	},

	onReply: async ({ event, api, Reply, message, getLang }) => {
		const { result, type } = Reply;
		const choice = event.body;
		if (!isNaN(choice) && choice <= 6) {
			const infoChoice = result[choice - 1];
			const idvideo = infoChoice.id;
			const infoVideo = await getVideoInfo(idvideo);
			api.unsendMessage(Reply.messageID);
			await handle({ type, infoVideo, message, getLang });
		}
		else
			api.unsendMessage(Reply.messageID);
	}
};

async function handle({ type, infoVideo, message, getLang }) {
	const { title, videoId } = infoVideo;

	if (type == "video") {
		const MAX_SIZE = 87031808; // 83MB (max size of video that can be sent on fb)
		const msgSend = message.reply(getLang("downloading", title));
		const { formats } = await ytdl.getInfo(videoId);
		const getFormat = formats
			.filter(f => f.hasVideo && f.hasAudio)
			.sort((a, b) => b.contentLength - a.contentLength)
			.find(f => f.contentLength || 0 < MAX_SIZE);
		if (!getFormat)
			return message.reply(getLang("noVideo"));
		const getStream = await getStreamAndSize(getFormat.url, `${videoId}.mp4`);
		if (getStream.size > MAX_SIZE)
			return message.reply(getLang("noVideo"));

		message.reply({
			body: title,
			attachment: getStream.stream
		}, async (err) => {
			if (err)
				return message.reply(getLang("error", err.message));
			message.unsend((await msgSend).messageID);
		});
	}
	else if (type == "audio") {
		const MAX_SIZE = 27262976; // 26MB (max size of audio that can be sent on fb)
		const msgSend = message.reply(getLang("downloadingAudio", title));
		const { formats } = await ytdl.getInfo(videoId);
		const getFormat = formats
			.filter(f => f.hasAudio && !f.hasVideo)
			.sort((a, b) => b.contentLength - a.contentLength)
			.find(f => f.contentLength || 0 < MAX_SIZE);
		if (!getFormat)
			return message.reply(getLang("noAudio"));
		const getStream = await getStreamAndSize(getFormat.url, `${videoId}.mp3`);
		if (getStream.size > MAX_SIZE)
			return message.reply(getLang("noAudio"));
		message.reply({
			body: title,
			attachment: getStream.stream
		}, async (err) => {
			if (err)
				return message.reply(getLang("error", err.message));
			message.unsend((await msgSend).messageID);
		});
	}
	else if (type == "info") {
		const { title, lengthSeconds, viewCount, videoId, uploadDate, likes, channel, chapters } = infoVideo;

		const hours = Math.floor(lengthSeconds / 3600);
		const minutes = Math.floor(lengthSeconds % 3600 / 60);
		const seconds = Math.floor(lengthSeconds % 3600 % 60);
		let msg = getLang("info", title, channel.name, (channel.subscriberCount || 0), `${hours}:${minutes}:${seconds}`, viewCount, likes, uploadDate, videoId, `https://youtu.be/${videoId}`);
		// if (chapters.length > 0) {
		// 	msg += getLang("listChapter")
		// 		+ chapters.reduce((acc, cur) => {
		// 			const time = convertTime(cur.start_time * 1000, ':', ':', ':').slice(0, -1);
		// 			return acc + ` ${time} => ${cur.title}\n`;
		// 		}, '');
		// }

		message.reply({
			body: msg,
			attachment: await Promise.all([
				getStreamFromURL(infoVideo.thumbnails[infoVideo.thumbnails.length - 1].url),
				getStreamFromURL(infoVideo.channel.thumbnails[infoVideo.channel.thumbnails.length - 1].url)
			])
		});
	}
}

async function search(keyWord) {
	try {
		const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyWord)}`;
		const res = await axios.get(url);
		const getJson = JSON.parse(res.data.split("ytInitialData = ")[1].split(";</script>")[0]);
		const videos = getJson.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
		const results = [];
		for (const video of videos)
			if (video.videoRenderer?.lengthText?.simpleText) // check is video, not playlist or channel or live
				results.push({
					id: video.videoRenderer.videoId,
					title: video.videoRenderer.title.runs[0].text,
					thumbnail: video.videoRenderer.thumbnail.thumbnails.pop().url,
					time: video.videoRenderer.lengthText.simpleText,
					channel: {
						id: video.videoRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId,
						name: video.videoRenderer.ownerText.runs[0].text,
						thumbnail: video.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails.pop().url.replace(/s[0-9]+\-c/g, '-c')
					}
				});
		return results;
	}
	catch (e) {
		const error = new Error("Cannot search video");
		error.code = "SEARCH_VIDEO_ERROR";
		throw error;
	}
}

async function getVideoInfo(id) {
	// get id from url if url
	id = id.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
	id = id[2] !== undefined ? id[2].split(/[^0-9a-z_\-]/i)[0] : id[0];

	const { data: html } = await axios.get(`https://youtu.be/${id}?hl=en`, {
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36'
		}
	});
	const json = JSON.parse(html.match(/var ytInitialPlayerResponse = (.*?});/)[1]);
	const json2 = JSON.parse(html.match(/var ytInitialData = (.*?});/)[1]);
	const { title, lengthSeconds, viewCount, videoId, thumbnail, author } = json.videoDetails;
	let getChapters;
	try {
		getChapters = json2.playerOverlays.playerOverlayRenderer.decoratedPlayerBarRenderer.decoratedPlayerBarRenderer.playerBar.multiMarkersPlayerBarRenderer.markersMap.find(x => x.key == "DESCRIPTION_CHAPTERS" && x.value.chapters).value.chapters;
	}
	catch (e) {
		getChapters = [];
	}
	const owner = json2.contents.twoColumnWatchNextResults.results.results.contents.find(x => x.videoSecondaryInfoRenderer).videoSecondaryInfoRenderer.owner;
	const result = {
		videoId,
		title,
		video_url: `https://youtu.be/${videoId}`,
		lengthSeconds: lengthSeconds.match(/\d+/)[0],
		viewCount: viewCount.match(/\d+/)[0],
		uploadDate: json.microformat.playerMicroformatRenderer.uploadDate,
		likes: json2.contents.twoColumnWatchNextResults.results.results.contents.find(x => x.videoPrimaryInfoRenderer).videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons.find(x => x.segmentedLikeDislikeButtonRenderer).segmentedLikeDislikeButtonRenderer.likeButton.toggleButtonRenderer.defaultText.accessibility.accessibilityData.label.replace(/\.|,/g, '').match(/\d+/)?.[0] || 0,
		chapters: getChapters.map((x, i) => {
			const start_time = x.chapterRenderer.timeRangeStartMillis;
			const end_time = getChapters[i + 1]?.chapterRenderer?.timeRangeStartMillis || lengthSeconds.match(/\d+/)[0] * 1000;

			return {
				title: x.chapterRenderer.title.simpleText,
				start_time_ms: start_time,
				start_time: start_time / 1000,
				end_time_ms: end_time - start_time + start_time,
				end_time: (end_time - start_time + start_time) / 1000
			};
		}),
		thumbnails: thumbnail.thumbnails,
		author: author,
		channel: {
			id: owner.videoOwnerRenderer.navigationEndpoint.browseEndpoint.browseId,
			username: owner.videoOwnerRenderer.navigationEndpoint.browseEndpoint.canonicalBaseUrl,
			name: owner.videoOwnerRenderer.title.runs[0].text,
			thumbnails: owner.videoOwnerRenderer.thumbnail.thumbnails,
			subscriberCount: parseAbbreviatedNumber(owner.videoOwnerRenderer.subscriberCountText.simpleText)
		}
	};

	return result;
}

function parseAbbreviatedNumber(string) {
	const match = string
		.replace(',', '.')
		.replace(' ', '')
		.match(/([\d,.]+)([MK]?)/);
	if (match) {
		let [, num, multi] = match;
		num = parseFloat(num);
		return Math.round(multi === 'M' ? num * 1000000 :
			multi === 'K' ? num * 1000 : num);
	}
	return null;
}
