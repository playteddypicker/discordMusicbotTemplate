const ytpl = require('ytpl');
const ytsr = require('ytsr');
const ytdl = require('ytdl-core');

async function searchandReturn(text){
	let searchedSong = {};
	//searchtype: playlist
	if(text.includes('&list=PL') || text.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)){
		console.log('Loading playlist...');
		try{
			const res = await ytpl(text, {limit: 1972});
			await console.log(`playlist ${res.title} Loaded. ${res.items.length} songs Adding...`);

			const playlistRes = [];
			
			const playlistInfo = {
				name: res.title,
				url: res.url,
				thumbnail: res.bestThumbnail.url,
				author: res.author ? {
					name: res.author.name,
					thumbnail: res.author.bestAvatar.url,
					channelURL: res.author.url,
				} :
				{ //youtube official music info일때
					name: res.items[0].author.name,
					thumbnail: '',
					channelURL: res.items[0].url,
				}
			}
			await playlistRes.push(playlistInfo);

			for(let song of res.items){
				searchedSong = {
					author: {
						name: song.author.name,
						thumbnail: '',
						channelURL: song.author.url,
					},
					title: song.title,
					url: song.shortUrl,
					duration: song.duration,
					thumbnail: `https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`,
				}
				playlistRes.push(searchedSong);
			}
			return playlistRes;
		}catch(error){
			console.log(`playlist search failed. reason : \n${error}`);
			return 'playlistError';
		}
		//searchtype: url
	}else if(text.match(/https:?\/\/(www.youtube.com|youtube.com|youtu.be)/)){
		try{
			const res = await ytdl.getInfo(text);
			const dur = await require('../structures/timestampcalculator.js').getTimestamp(Number(res.videoDetails.lengthSeconds));
			searchedSong = {
				author: {
					name: res.videoDetails.author.name,
					thumbnail: res.videoDetails.author.thumbnails[0].url,
					channelURL: res.videoDetails.author.channel_url,
				},
				title: res.videoDetails.title,
				url: res.videoDetails.video_url,
				duration: dur,
				thumbnail: `https://i.ytimg.com/vi/${res.videoDetails.videoId}/hqdefault.jpg`,
				//requestedby는 return할때 따로 설정 ㄱㄱ
			}
			return searchedSong;
		}catch (error){
			console.log(error);
			return '410';
		}
		//searchtype: keyword
	}else{
		try{
			const srres = await ytsr(text, {pages: 1});
			let i = -1;
			do{
				i += 1;
				if(i == 100) return 'searchfailed';
			}while(srres.items[i].type != 'video');
	
			const res = srres.items[i];
			searchedSong = {
				author: {
					name: res.author.name,
					thumbnail: res.author.bestAvatar.url,
					channelURL: res.author.url,
				},
				title: res.title,
				url: res.url,
				duration: res.duration,
				thumbnail: `https://i.ytimg.com/vi/${res.id}/hqdefault.jpg`,
				//requestedby는 나중에 리턴에서
			}
			return searchedSong;
		}catch(error){
			console.log(error);
			return 'searchError';
		}
	}
}

function organizeInfo(info, member){
	const resAry = [];
	const request = {
		name: member.displayName,
		id: member.id,
		avatarURL: member.user.avatarURL(),
		tag: member.user.tag,
	};

	if(Array.isArray(info)){
		for(let item of info){
			item.request = request;
			resAry.push(item);
		}
		return resAry;
	}else if(typeof(info) === 'object'){
		info.request = request;
		resAry.push(info);
		return resAry;
	}else{
		return info;
	}
}

module.exports = {
	searchandReturn,
	organizeInfo
}
