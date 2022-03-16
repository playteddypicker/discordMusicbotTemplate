const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const ytsr = require('ytsr');
const scdl = require('soundcloud-downloader').default;
const {
	timestamptoSecond,
	getTimestamp,
} = require('../structures/timestamp.js');
require('dotenv').config();

async function ytplGetInfo(text){ //filter
	//searchType : yt-playlist
	try{
		const plres = await ytpl(text, {
			limit: 1972
		});
		await console.log(`${plres.items.length} songs loaded from ytpl ${plres.title}.`);

		const playlistInfo = {
			info: {
				name: plres.title,
				url: plres.url,
				thumbnail: plres.bestThumbnail.url,
				author: plres.author ? {
					name: plres.author.name,
					thumbnail: plres.author.bestAvatar.url ?? 'https://cdn.icons-icons.com/icons2/730/png/512/youtube_icon-icons.com_62771.png',
					channelURL: plres.author.url,
				} : null
			},
			items: [],
		}
		
		if(!plres.author){ //OL thumbnail generator.
			const info = await ytdl.getInfo(plres.items[0].url, {
				requestOptions : {
					headers: {
						cookie: process.env.YOUTUBE_COOKIE,
					},
				},
			});
			playlistInfo.info.author = {
				name: info.videoDetails.author.name,
				thumbnail: info.videoDetails.author.thumbnails[0].url,
				channelURL: info.videoDetails.author.channel_url,
			}
		}

		for(let song of plres.items){
			let resultSong = {
				title: song.title,
				url: song.shortUrl,
				duration: song.duration,
				thumbnail: `https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`,
				author: {
					name: song.author.name,
					thumbnail: '',
					channelURL : song.author.url,
				}
			}
			playlistInfo.items.push(resultSong);
		}

		return playlistInfo;

	}catch(error){
		console.log('playlist search failed. reason:');
		console.log(error);
		return 'playlistError';
	}
}

async function yturlGetInfo(text){
	try{
		const ytres = await ytdl.getInfo(text, {
			requestOptions: {
				headers: {
					cookie: process.env.YOUTUBE_COOKIE,
				},
			},
		});

		const durationTimestamp = await getTimestamp(Number(ytres.videoDetails.lengthSeconds));

		return {
			title: ytres.videoDetails.title,
			url: ytres.videoDetails.video_url,
			duration: durationTimestamp,
			thumbnail: `https://i.ytimg.com/vi/${ytres.videoDetails.videoId}/hqdefault.jpg`,
			author: {
				name: ytres.videoDetails.author.name,
				thumbnail: ytres.videoDetails.author.thumbnails[0].url ?? 'https://cdn.icons-icons.com/icons2/730/png/512/youtube_icon-icons.com_62771.png',
				channelURL: ytres.videoDetails.author.channel_url
			}
		}
	}catch(error){
		console.log('youtube-url error. reason : ');
		console.log(error);
		return 'ytUrlError';
	}
}

async function scsetGetInfo(text){
	try{
		const scsetres = await scdl.getSetInfo(text);
		const playlistInfo = {
			info: {
				name: scsetres.title,
				url: scsetres.permalink_url,
				thumbnail: scsetres.artwork_url ?? 'https://download.logo.wine/logo/SoundCloud/SoundCloud-Logo.wine.png',
				author: {
					name: scsetres.user.username,
					thumbnail: scsetres.user.avatar_url ?? 'https://cdn-icons-png.flaticon.com/512/145/145809.png',
					channelURL: res.user.permalink_url,
				}
			},
			items: []
		}

		for(let song of scsetres.tracks){
			const durationTimestamp = await getTimestamp(Number(parseInt(song.duration/1000)));
			
			let resultsong = {
				title: song.title,
				url: song.permalink_url,
				duration: durationTimestamp,
				thumbnail : song.artwork_url ? song.artwork_url.replace('large.jpg', 't500x500.jpg') : 'https://download.logo.wine/logo/SoundCloud/SoundCloud-Logo.wine.png',
				author: {
					name: song.user.username,
					thumbnail: song.user.avatar_url ?? 'https://cdn-icons-png.flaticon.com/512/145/145809.png',
					channelURL: song.user.permalink_url,
				}
			};
			playlistInfo.items.push(resultsong);
		}

		return playlistInfo;

	}catch(error){
		console.log('error from loading soundcloud playlist. reason:');
		console.log(error);
		return 'scsetError';
	}
}

async function scurlGetInfo(text){
	try{
		const res = await scdl.getInfo(text);
		const dur = await getTimestamp(Number(parseInt(res.duration/1000)));
		
		return {
			title: res.title,
			url: res.permalink_url,
			thumbnail: res.artwork_url ? res.artwork_url.replace('large.jpg', 't500x500.jpg') : 'https://download.logo.wine/logo/SoundCloud/SoundCloud-Logo.wine.png',
			duration: dur,
			author: {
				name: res.user.username,
				thumbnail: res.user.avatar_url ?? 'https://cdn-icons-png.flaticon.com/512/145/145809.png',
				channelURL: res.user.permalink_url,
			},
		};

	}catch(error){
		console.log('error from soundcloud url. reason:');
		console.log(error);
		return 'scError';
	}
}

async function ytsearchGetInfo(text, filter){
	try{
		const defaultFilterOptions = await ytsr.getFilters(text);
		const filteredUrl = defaultFilterOptions.get('Type').get('Video').url;
		const searchResult = await ytsr(filteredUrl, {
			pages: 1
		});

		let i = -1;
		while(1){
			i++;

			//filter 적용
			if(filter.durationLimit != 0 && filter.durationLimit >= Number(timestamptoSecond(searchResult.items[i].duration))) break;
			if(!filter.banKeywords.forEach(keyword => {
				return searchReslt.items[i].title.includes(keyword);
			})) break;

			if(i == 100) return 'searchFailed';
		}
		
		const res = searchResult.items[i];
		return {
			title: res.title,
			url: res.url,
			duration: res.duration,
			thumbnail: `https://i.ytimg.com/vi/${res.id}/hqdefault.jpg` ?? 'https://user-images.githubusercontent.com/110469/41812098-71d75190-7714-11e8-81e4-ac4cd3ad111f.png',
			author: {
				name: res.author.name,
				thumbnail: res.author.bestAvatar.url ?? 'https://cdn-icons-png.flaticon.com/512/145/145809.png',
				channelURL: res.author.url
			}
		};

	}catch(error){
		console.log('youtube search error. reason : ');
		console.log(error);
		return 'searchError';
	}
}

async function ytplsearchGetInfo(text){
	try{
		const defaultFilterOptions = await ytsr.getFilters(text);
		const filteredUrl = defaultFilterOptions.get('Type').get('Playlist')
		const searchResult = await ytsr(filteredUrl.url, {
			pages: 1
		});

		if(searchResult.items.length == 0) return 'searchFailed';

		const plres = await ytpl(searchResult.items[0].url, {
			limit: 1972
		});
		await console.log(`${plres.items.length} songs loaded from ytpl ${plres.title}.`);

		const playlistInfo = {
			info: {
				name: plres.title,
				url: plres.url,
				thumbnail: plres.bestThumbnail.url,
				author: plres.author ? {
					name: plres.author.name,
					thumbnail: plres.author.bestAvatar.url ?? 'https://cdn.icons-icons.com/icons2/730/png/512/youtube_icon-icons.com_62771.png',
					channelURL: plres.author.url,
				} : null
			},
			items: [],
		}
		
		if(!plres.author){ //OL thumbnail generator.
			const info = await ytdl.getInfo(plres.items[0].url, {
				requestOptions : {
					headers: {
						cookie: process.env.YOUTUBE_COOKIE,
					},
				},
			});
			playlistInfo.info.author = {
				name: info.videoDetails.author.name,
				thumbnail: info.videoDetails.author.thumbnails[0].url,
				channelURL: info.videoDetails.author.channel_url,
			}
		}

		for(let song of plres.items){
			let resultSong = {
				title: song.title,
				url: song.shortUrl,
				duration: song.duration,
				thumbnail: `https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`,
				author: {
					name: song.author.name,
					thumbnail: '',
					channelURL : song.author.url,
				}
			}
			playlistInfo.items.push(resultSong);
		}

		return playlistInfo;

	}catch (error){
		console.log('playlist search failed. reason:');
		console.log(error);
		return 'playlistError';
	}
}

module.exports = {
	ytplGetInfo,
	yturlGetInfo,
	scsetGetInfo,
	scurlGetInfo,
	ytsearchGetInfo,
	ytplsearchGetInfo
}
