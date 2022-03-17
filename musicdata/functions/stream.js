const { serverInfoList } = require('../structures/musicServerInfo.js');
const {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	VoiceConnectionStatus,
	getVoiceConnection,
	AudioPlayerStatus,
	entersState
} = require('@discordjs/voice');
const {
	MessageEmbed,
	Message,
	Interaction
} = require('discord.js');
global.AbortController = require('node-abort-controller').AbortController;

const { streamScript } = require('../../script.json');
const { pushqueue } = require('./pushqueue.js');

const playdl = require('play-dl');
const ytdl = require('ytdl-core');
const scdl = require('soundcloud-downloader').default;
const yturlReg = /^https?:\/\/(www.youtube.com|youtube.com|youtu.be)\/(.*)$/;

require('dotenv').config();

async function streamTrigger(interaction, text, requestType){
	//user must join voicechannel before request the song.
	if(!interaction.member.voice.channel)
		return (interaction instanceof Interaction && interaction.isCommand()) ?
			interaction.editReply({content: streamScript.firstJoinVc}) :
			interaction.channel.send(`${interaction.member.user}, ` + streamScript.firstJoinVc);

	//user and bot joined voice channel, but that channels are different.
	if(interaction.guild.me.voice.channel
		&& (interaction.member.voice.channel.id != interaction.guild.me.voice.channel.id))
		return (interaction instanceof Interaction && interaction.isCommand()) ? 
			interaction.editReply({
				content: streamScript.alreadyStreaming.interpolate({
					vc: `${interaction.guild.me.voice.channel}`
				}), ephemeral: true
			}) :
			interaction.channel.send({
				content: `${interaction.member.user}, ` + streamScript.alreadyStreaming.interpolate({
					vc: `${interaction.guild.me.voice.channel}`
				})
			});

	const server = serverInfoList.get(interaction.guild.id);

	//bot is not joined voice channel, but user send a request => bot joins voicechannel.
	if(!server.streamInfo.connection || !server.guild.me.voice.channel){
		server.streamInfo.connection = await joinVoiceChannel({
			channelId: interaction.member.voice.channel.id,
			guildId: interaction.guild.id,
			adapterCreator: interaction.guild.voiceAdapterCreator
		});
	}

	//seperated by request type. there're three types : command, player, playlist(db).
	switch(requestType){
		case 'command':
		case 'player':
			pushqueue(interaction, text).then(rm => {
				if(typeof(rm) === 'number') return sendErrorMsg(interaction, rm);

				if(server.queue.length == 1) rm.content = '재생 시작!';

				requestType == 'command' ? 
					interaction.editReply(rm) :
					interaction.channel.send(rm);

				if(!server.streamInfo.audioPlayer && server.queue.length > 0)
					startStream(interaction, server);
				//refresh player message.
			});
			break;

		case 'playlist':
			break;
	}
}

async function startStream(interaction, server){
	const wait = require('util').promisify(setTimeout);
	let errorhandling = 0;
	
	//first playing
	const audioPlayer = createAudioPlayer();
	server.streamInfo.audioPlayer = audioPlayer;

	await getSongStream(interaction, server);
	

	//status handler
	audioPlayer.on(AudioPlayerStatus.Playing, async () => {
		server.streamInfo.playStatus = '▶️ 지금 재생 중';

		if(server.queue.length > 0){
			if(!server.queue[0].author.thumbnail){
				const info = await ytdl.getInfo(server.queue[0].url, {
					requestOptions: {
						headers: {
							cookie: process.env.YOUTUBE_COOKIE,
						}
					}
				});
				server.queue[0].author.thumbnail = info.videoDetails.author.thumbnails[0].url;
			}
		}

		//refresh player embed.
	});

	audioPlayer.on(AudioPlayerStatus.Idle, async () => {
		if(errorhandling == 1) {
			//기타 핸들링..
			errorhandling = 0;
			return;
		}
		server.streamInfo.playStatus = '⏹️ 재생 중이 아님';

		switch(server.streamInfo.playInfo.loopmode){
			case '반복 모드 꺼짐':
				server.queue.shift();
				break;

			case '🔂 싱글 루프 모드':
				//카운트 세는거 등등.. 지금은 추가 안함ㅅㄱ
				break;

			case '🔁 대기열 반복 모드':
				if(server.queue.length > 1) server.queue.push(server.queue.shift());
				break;

			case '♾️ 자동 재생 모드':
				if(server.queue.length == 2){
					//autoplaying
				}else
					server.queue.shift();
				break;
		}

		if(server.queue.length > 0) {
			await getSongStream(interaction, server); //다음곡 존재하면 새로 틀기
			server.streamInfo.playStatus = '▶️ 지금 재생 중';
			interaction.channel.send(`지금 재생 중 : **${server.queue[0].title}**`);
		}	

		if(server.queue.length == 0) {
			/* if player not created */await interaction.channel.send('대기열에 노래가 없습니다.');
			await server.enterstop();
			server.streamInfo.audioPlayer = null;
		}

		//update player embed
	});

	audioPlayer.on(AudioPlayerStatus.Buffering, () => {
		server.streamInfo.playStatus = '*️⃣ 버퍼링 중..';

		//update player embed
	});

	audioPlayer.on(AudioPlayerStatus.Paused, () => {
		server.streamInfo.playStatus = '⏸️ 일시정지됨';

		//update player embed
	});

	audioPlayer.on('error', e => {
		errorhandling = 1;
		console.log(e);
		getSongStream(interaction, server);
	});
}

//play-dl function.
async function getSongStream(interaction, server){
	try{
		let streamSong = yturlReg.test(server.queue[0].url) ?
			await playdl.stream(server.queue[0].url) : 
			await scdl.download(server.queue[0].url);

		server.streamInfo.audioResource = yturlReg.test(server.queue[0].url) ? 
			await createAudioResource(streamSong.stream, {
				inlineVolume: true,
				inputType: streamSong.type
			}) :
			await createAudioResource(streamSong,{
				inlineVolume: true,
			});
		server.streamInfo.audioResource.volume.setVolume(server.streamInfo.playInfo.volume);

		await server.streamInfo.audioPlayer.play(server.streamInfo.audioResource);
		await server.streamInfo.connection.subscribe(server.streamInfo.audioPlayer);	
	}catch(error){
		interaction.editReply('스트리밍 중 오류가 발생했습니다.');
		console.log(error);

		if(error.message.includes('UnrecoverableError')) {
			server.queue.shift();
			(interaction instanceof Interaction) ? 
				interaction.editReply('이 링크는 사용할 수 없습니다. 스킵합니다..') :
				interaction.channel.send('이 링크는 사용할 수 없습니다. 스킵합니다..');
		}

	}
}

/* ytdl version(has aborting issue)
async function getSongStream(interaction, server){
	let streamSong = yturlReg.test(server.queue[0].url) ?
		await ytdl(server.queue[0].url, {
			quality: 'highestaudio',
			highWaterMark: 1024 * 1024 * 10,
			requestOptions: {
				headers: {
					cookie: process.env.YOUTUBE_COOKIE,
				}
			}
		}).on('error', (e) => {
			console.log(`\nStreamingError at ${server.guild.name}@${server.guild.id}.`);
			console.log(`User ${server.queue[0].request.tag} sent ${server.queue[0].title}(${server.queue[0].url})`);
			console.log('-----------');
			console.log(e);
			console.log('-----------\n');

			if(e.message.includes('UnrecoverableError')) {
				server.queue.shift();
				(interaction instanceof Interaction) ? 
					interaction.editReply('이 링크는 사용할 수 없습니다. 스킵합니다..') :
					interaction.channel.send('이 링크는 사용할 수 없습니다. 스킵합니다..');
			}

		}) : await scdl.download(server.queue[0].url);

	server.streamInfo.audioResource = await createAudioResource(streamSong, {
		inlineVolume: true
	});
	server.streamInfo.audioResource.volume.setVolume(server.streamInfo.playInfo.volume);

	await server.streamInfo.audioPlayer.play(server.streamInfo.audioResource);
	await server.streamInfo.connection.subscribe(server.streamInfo.audioPlayer);
}
*/

function sendErrorMsg(interaction, errorCode){
	/* list of errorMsg
	 * 0 is not error.
	 * errorcode 1 : 'playlistError', 
	 * errorcode 2 : 'ytUrlError',
	 * errorcode 3 : 'scsetError',
	 * errorcode 4 : 'scError',
	 * errorcode 5 : 'searchFailed',
	 * erorrcode 6 : 'searchError',
	 * errorcode 7 : 'error'
	 */
	console.log(`this error message was sent to ${interaction.guild.id}@${interaction.guild.name}\n`);
	if(typeof(errorCode) === 'number') interaction.editReply(streamScript.errormsg[errorCode]);
	else interaction.editReply(streamScript.errormsg[0]);
}

module.exports = {
	streamTrigger,
}
