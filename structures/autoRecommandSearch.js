const ytdl = require('ytdl-core');
const scReg = /^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/;
require('dotenv').config();

async function autoRecommandSearch(url, interaction, prevsongUrl){ //interaction 일수도 message일수도 둘다 가능

	if(scReg.test(url)) return interaction.channel.send(`${interaction.member.user}, 사운드클라우드 노래는 아직 자동 재생 기능을 사용할 수 없어요.`);
	interaction.channel.send('유튜브에서 추천 노래 검색하는 중...');
	

	let idresult = '';

	const getinfo = await ytdl.getInfo(url, {
		requestOptions: {
			headers: {
				cookie: process.env.YOUTUBE_COOKIE,
			}
		}
	});
	//나중에 서버별로 블랙리스트 키워드 설정 ㄱㄱ
	let recommandResult = getinfo.related_videos;

	let i = 0;
	if(prevsongUrl){//이전노래랑 같은게 있으면.. 노래 3개가 뺑뻉이돌지는 않겠지 ㅋㅋ 돌면 자살함
		const prevsongId = prevsongUrl.replace('https://www.youtube.com/watch?v=', '');
		for(let rres of recommandResult){
			if(prevsongId == rres.id) {
				recommandResult.splice(i, 1);
				break;
			}
			i++;	
		}
	}
	let cnt = 0;
	for(let i = 0; i < recommandResult.length; i++){
		if(filterTitle(recommandResult[i].title.toLowerCase()) && Number(recommandResult[i].length_seconds) < 900){
			idresult = recommandResult[i].id;
			break;
		}

		if(i == recommandResult.length - 1) {
			interaction.channel.send('조건에 맞는 노래가 없어요.. 다시 검색하는 중..');
			i = 0;
			const newinfo = await ytdl.getInfo(url, {
				requestOptions: {
					headers: {
						cookie: process.env.YOUTUBE_COOKIE,
					}
				}
			});
			recommandResult = newinfo.related_videos;
		}
		cnt++;
		if(cnt == 100){
			interaction.channel.send('조건에 맞는 노래가 아무리 찾아도 없어요.. 그냥 이걸 넣을게요');
			idresult = recommandResult[i].id;
			break;
		}
	}

	const selectedsong = 'https://youtu.be/' + idresult; //위에서 하나 뽑은거

	const song = await ytdl.getInfo(selectedsong, {
		requestOptions: {
			headers: {
				cookie: process.env.YOUTUBE_COOKIE,
			}
		}
	});

	const searchedsong = {
		author: {
					name: song.videoDetails.author.name,
					thumbnail: song.videoDetails.author.thumbnails[0].url,
					channelURL: song.videoDetails.author.channel_url,
				},
		title: song.videoDetails.title,
		url: song.videoDetails.video_url,
		duration: require('../structures/timestampcalculator.js').getTimestamp(song.videoDetails.lengthSeconds),
		thumbnail: `https://i.ytimg.com/vi/${song.videoDetails.videoId}/hqdefault.jpg`,
		request:{
			name: '자동 재생 모드',
			avatarURL: 'https://images.emojiterra.com/twitter/v13.1/512px/267e.png',
			id: '0',
			tag: '0'
		}
	}
	interaction.channel.send(`추천 노래: **${searchedsong.title}** 대기열에 추가했어요`);
	return searchedsong;
}

function filterTitle(title){
	const reg = /(calming|playlist|relaxing|hour|감성|분위기|플레이리스트|모음|힐링|정체|참교육)/;
	if(reg.test(title)) return false;
	return true;
}

module.exports = {
	autoRecommandSearch,
	filterTitle,
}
