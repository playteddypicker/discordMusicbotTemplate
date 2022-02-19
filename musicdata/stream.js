const musicserverList = require('../structures/musicPreference.js').musicserverList;
const {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	VoiceConnectionStatus,
	getVoiceConnection,
	AudioPlayerStatus,
	entersState,
} = require('@discordjs/voice');
const {
	MessageEmbed,
	Message,
	Interaction
} = require('discord.js');
const { streamScript } = require('../script.json');
const ytdl = require('ytdl-core');
const scdl = require('soundcloud-downloader').default;

require('dotenv').config();
const autoRecommandSearch = require('../structures/autoRecommandSearch.js').autoRecommandSearch;
const privatePlaylistModel = require('../structures/playlistStructure.js').privatePlaylistModel;

async function trigger(interaction, text, requestType){
	//voice-channel Handling
	if(!interaction.member.voice.channel)
		return (interaction instanceof Interaction && interaction.isCommand()) ?
			interaction.editReply({content: streamScript.firstJoinVc}) :
			interaction.channel.send(`${interaction.member.user}, ` + streamScript.firstJoinVc);
	if(interaction.guild.me.voice.channel
		&& (interaction.member.voice.channel.id
		!= interaction.guild.me.voice.channel.id))
		return (interaction instanceof Interaction && interaction.isCommand()) ?
			interaction.editReply({content: streamScript.alreadyStreaming.interpolate({vc: `${interaction.guild.me.voice.channel}`}), ephemeral: true}) :
			interaction.channel.send({content: `${interaction.member.user}, ` + streamScript.alreadyStreaming.interpolate({vc: `${interaction.guild.me.voice.channel}`})});

	const server = musicserverList.get(interaction.guild.id);

	if(!server.connectionHandler.connection || !server.guild.me.voice.channel){
		server.connectionHandler.connection = await joinVoiceChannel({
			channelId: interaction.member.voice.channel.id,
			guildId: interaction.guild.id,
			adapterCreator: interaction.guild.voiceAdapterCreator
		});
	}

	switch(requestType){
		case 'command':
		case 'player':
			server.queue.channel = interaction.channel;
			require('./searchsong.js').pushqueue(interaction, text).then((rm)=> {
				if(typeof(rm) == 'string'){
					let ermsg = '';
					switch(rm){
						case 'playlistError':
							ermsg = streamScript.playlistError;
							break;

						case '410':
							ermsg = streamScript.getUrlError; 
							break;

						case 'searchError':
						case 'searchfailed':
							ermsg = streamScript.searchError;
							break;

						case 'scError':
							ermsg = streamScript.scError;
							break;
					}
					return requestType == 'command' ? interaction.editReply(ermsg) : interaction.channel.send(ermsg);
				}
				if(requestType == 'command') interaction.editReply(rm);
				if(!server.connectionHandler.audioPlayer && server.queue.songs.length > 0)
					startstream(server, interaction);
				if(server.playerInfo.isSetupped)
					require('./syncplayer.js').updatePlayerMsg(server);
			});
			break;

		case 'playlist':
			server.queue.channel = interaction.channel;
			const userDB = await privatePlaylistModel.find({userid: interaction.member.id}, {_id: 0});
			for(const song of userDB[Number(text)-1].items){
				await server.queue.songs.push({
					author: null,
					title: song.title,
					url: song.url,
					thumbnail: song.thumbnail,
					duration: song.duration,
					request: {
						name: interaction.member.displayName,
						avatarURL: interaction.member.user.avatarURL(),
						tag: interaction.member.user.tag,
						id: interaction.member.id,
					}
				});
			}
			if(!server.connectionHandler.audioPlayer && server.queue.songs.length > 0)
				startstream(server, interaction);
			if(server.playerInfo.isSetupped)
				require('./syncplayer.js').updatePlayerMsg(server);
			break;
	}
}

async function startstream(server, interaction){
	const queue = server.queue;
	const connection = server.connectionHandler.connection;
	const wait = require('util').promisify(setTimeout);
	let errorhandling = 0;
	//first playing
	let song = queue.songs[0];
	let streamSong = server.queue.songs[0].url.includes('soundcloud') ? 
		await scdl.download(server.queue.songs[0].url) : 
		await ytdl(server.queue.songs[0].url, {
			quality: 'highestaudio',
			highWaterMark: 1024  * 1024 * 10,
			requestOptions: {
				headers: {
					cookie: process.env.YOUTUBE_COOKIE,
				}
			}
	});

	const audioPlayer = createAudioPlayer();
	server.connectionHandler.audioPlayer = audioPlayer;

	let resource = await createAudioResource(streamSong, { inlineVolume: true });
	server.connectionHandler.audioResource = resource;
	resource.volume.setVolume(queue.playinfo.volume);

	await audioPlayer.play(resource);
	connection.subscribe(audioPlayer);

	//stream Handler
	audioPlayer.on(AudioPlayerStatus.Playing, async () => {
		server.connectionHandler.connectionStatus = '▶️ 지금 재생 중';

		if(server.queue.songs.length > 0){
			const author = server.queue.songs[0].author;

			if(!author){
				const info = await ytdl.getInfo(server.queue.songs[0].url, {
					requestOptions: {
						headers: {
							cookie: process.env.YOUTUBE_COOKIE,
						},
					},
				});
				server.queue.songs[0].author = {
					name: info.videoDetails.author.name,
					thumbnail: info.videoDetails.author.thumbnails[0].url,
					channelURL: info.videoDetails.author.channel_url,
				}
			}else if(!author.thumbnail){
				const info = await ytdl.getInfo(server.queue.songs[0].url, {
					requestOptions: {
						headers: {
							cookie: process.env.YOUTUBE_COOKIE,
						},
					},
				});
				author.thumbnail = info.videoDetails.author.thumbnails[0].url;
			}
		}
		
		server.playerInfo.isSetupped ? 
			require('./syncplayer.js').updatePlayerMsg(server) :
			queue.channel.send(`지금 재생 중 : **${song.title}**`);
	});

	audioPlayer.on(AudioPlayerStatus.Idle, async () => {
		server.connectionHandler.connectionStatus = '⏹️ 재생 중이 아님';

		if(errorhandling == 0){
			switch(server.queue.playinfo.playmode){
				case '반복 모드 꺼짐':
					queue.songs.shift();
					break;

				case '🔂 싱글 루프 모드':
					//카운트..등
					break;

				case '🔁 대기열 반복 모드':
					if(queue.songs.length > 1) queue.songs.push(queue.songs.shift());
					break;

				case '♾️ 자동 재생 모드':
					if(queue.songs.length == 2){
						queue.prevsongUrl = queue.songs.shift().url;
						autoRecommandSearch(queue.songs[0].url, interaction, queue.prevsongUrl).then(recRes => {
							server.queue.songs.push(recRes);
							if(server.playerInfo.isSetupped)
								require('./syncplayer.js').updatePlayerMsg(server);
						})
					}else{
						queue.songs.shift();
					}
					break;
			}
		}else{
			errorhandling = 0;
		}

		if(server.queue.songs.length == 0){
			if(!server.playerInfo.isSetupped) interaction.channel.send(streamScript.queueEmpty);
			server.enterstop();
			server.connectionHandler.audioPlayer = null;
		}else{
			song = queue.songs[0];
			streamSong = server.queue.songs[0].url.includes('soundcloud') ? 
				await scdl.download(server.queue.songs[0].url) : 
				await ytdl(server.queue.songs[0].url, {
					quality: 'highestaudio',
					highWaterMark: 1024  * 1024 * 10,
					requestOptions: {
						headers: {
							cookie: process.env.YOUTUBE_COOKIE,
						}
					}
				});

			resource = await createAudioResource(streamSong, { inlineVolume: true });
			server.connectionHandler.audioResource = resource;
			resource.volume.setVolume(queue.playinfo.volume);

			await audioPlayer.play(resource);
			connection.subscribe(audioPlayer);
		}

		if(server.playerInfo.isSetupped)
			require('./syncplayer.js').updatePlayerMsg(server);
	});

	audioPlayer.on(AudioPlayerStatus.Buffering, () => {
		server.connectionHandler.connectionStatus = '*️⃣ 버퍼링 중..';

		if(server.playerInfo.isSetupped)
			require('./syncplayer.js').updatePlayerMsg(server);
	});

	audioPlayer.on('error', error => {
		errorhandling = 1;
		if(error.message.includes('410')){
			console.log(error);
			queue.channel.send(streamScript.error410);
			queue.songs.shift();
		}else if(error.message.includes('403')){
			console.log(`error 403: 노래 요청을 너무 빨리 했습니다. ${song.title} 다시 재생하는 중..`);
			wait(500);
		}else if(error.message.includes('502')){
			queue.channel.send(streamScript.error502);
			queue.songs.shift();
		}else{
			queue.channel.send(`노래 재생하는 데 에러 발생! \n${error.message}`);	
			console.log(error);

			if(server.playerInfo.isSetupped)
			require('./syncplayer.js').updatePlayerMsg(server);
		}
	});

	audioPlayer.on(AudioPlayerStatus.Paused, () => {
		server.connectionHandler.connectionStatus = '⏸️ 일시정지됨';
		server.connectionHandler.paused = true;
	});
	
}

module.exports = {
	trigger
}
