const {
	MessageEmbed,
	MessageActionRow,
	MessageButton,
} = require('discord.js');
const shangus = require('mongoose');
const serverPlayerInfo = require('../structures/musicPreference.js');
const playerSchema = new shangus.Schema({
	guildId: String,
	channelId: String,
	playermsgId: String,
	isSetupped: Boolean,
});
const { syncplayerScript } = require('../script.json');
const guildPlayer = shangus.model('serverPlayerList', playerSchema);

//index.js or /setup명령어 쓸때 ㄱㄱ

function updatePlayerMsg(server, interaction){
	let queuelist = '<여기에 대기열 목록 표시됨>';
	if(server.queue.songs.length > 1){
		queuelist = '';
		for(let i = server.queue.songs.length - 1; i >= 1; i--){
			if(i > 19){
				i = 19;
				queuelist = `...이외에 ${Number(server.queue.songs.length) - i - 1}개의 곡 대기 중\n`;
			}
			//이뻐짐
			queuelist += `#${i}.` + '`' + `[${server.queue.songs[i].duration}]` + '`' + ` **${server.queue.songs[i].title}** ` + '`' + `by ${server.queue.songs[i].request.name}` + '`\n';
		}
	}

	getPlayerEmbed(server).then( playerEmbed => {
		if(interaction != undefined){
			interaction.update({content: queuelist, embeds: [playerEmbed]});
		}else{
			server.playerInfo.playermsg.edit({content: queuelist, embeds: [playerEmbed]}).catch(e =>{
				console.log(`error occured in ${server.guild.name}\n${e}`);
			}
			);
		}
	});
}

async function getPlayerEmbed(server){
	const ytdl = require('ytdl-core');
	const timecalc = require('../structures/timestampcalculator.js');
	const scReg = /^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/;

	if(server.queue.songs.length > 0){
			const author = server.queue.songs[0].author;

			if(!author){
				const info = await ytdl.getInfo(server.queue.songs[0].url);
				server.queue.songs[0].author = {
					name: info.videoDetails.author.name,
					thumbnail: info.videoDetails.author.thumbnails[0].url,
					channelURL: info.videoDetails.author.channel_url,
				}
			}else if(!author.thumbnail){
				const info = await ytdl.getInfo(server.queue.songs[0].url);
				author.thumbnail = info.videoDetails.author.thumbnails[0].url;
			}
		}

	return server.queue.songs.length > 0 
		? new MessageEmbed({
			author: {
				name: `${server.queue.songs[0].author.name}`,
				icon_url: `${server.queue.songs[0].author.thumbnail}`,
				url: `${server.queue.songs[0].author.channelURL}`,
			},
			title: server.queue.songs[0].title,
			color: process.env.DEFAULT_COLOR,
			description: `${server.connectionHandler.connectionStatus} | ${server.queue.playinfo.playmode} | 🔉 : ${Math.round(server.queue.playinfo.volume * 100)}%\n⏳ 러닝타임: 현재 ${server.queue.songs[0].duration} | 전체 ${timecalc.getTimestamp(timecalc.timestamptoSec(server.queue.songs))}`,
			url: server.queue.songs[0].url,
			image: {url: server.queue.songs[0].thumbnail},
			footer:{
				text: `requested by ${server.queue.songs[0].request.name} | ${scReg.test(server.queue.songs[0].url) ? 'Soundcloud' : 'Youtube'}`,
				icon_url: server.queue.songs[0].request.avatarURL,
			}
		})
		: new MessageEmbed({
			title: syncplayerScript.emptyPlayerTitle,
			color: process.env.DEFAULT_COLOR,
			description: syncplayerScript.emptyPlayerDescription,
			image: {
				url: process.env.PLAYEREMBED_IMAGEURL 
			},
		});
}

async function syncChannel(channel){
	const server = require('../structures/musicPreference.js').musicserverList.get(channel.guild.id);
	await channel.bulkDelete(50)
		.catch(e => {
			console.log(e);
		});

	const toReactEmbed = await getPlayerEmbed(server);

	const playerBannerMsg = await channel.send({
		content: `**플레이어 사용법**\n\n이 채널에 채팅으로 노래제목/링크/플레이리스트 링크를 치면 노래가 재생됩니다.\n\n**기본 기능**\n⏯️ : 노래 일시정지 | 다시재생 \n⏏️ : 노래 멈추고 모든 노래 제거, 초기화, 음성 채널 나감 \n⏹️ : 노래 멈추고 대기 중인 모든 노래 제거, 모든 상태(루프 등) 초기화\n⏭️ : 노래 스킵\n✂️\: 대기열만 초기화\n\n**고급 기능**\n🔀 : 대기열 셔플 \n🔂 : 싱글 루프 모드 활성화/비활성화 \n🔁 : 대기열 반복 모드 활성화/비활성화 \n♾️ : 자동 재생 모드 활성화/비활성화\n⏳: 현재 타임라인 시간 보기\n\n**추가 기능**\n🔈 : 볼륨 10% 감소 \n🔊 : 볼륨 10% 증가 \n❌ : 대기열 맨 마지막 노래 지우기 \n⤴️ : 다음 곡을 대기열 맨 뒤로 옮기기 \n⤵️ : 대기열 맨 마지막 노래를 맨 앞으로 옮기기`,
		files: ['./attatchments/playerbanner.jpg'],
	});

	let queuelist = '<여기에 대기열 목록 표시됨>';
	if(server.queue.songs.length > 1){
		queuelist = '';
		for(let i = server.queue.songs.length - 1; i >= 1; i--){
			if(i > 19){
				i = 19;
				queuelist = `...이외에 ${Number(server.queue.songs.length) - i - 1}개의 곡 대기 중\n`;
			}
			queuelist += `#${i}. [${server.queue.songs[i].duration}] ${server.queue.songs[i].title} by ${server.queue.songs[i].request.name}\n`;
		}
	}

	const playermsg = await channel.send({
		content: queuelist,
		embeds: [toReactEmbed], //노래 틀어져있으면 정보 따라서 아니면 Default
		components: [
			{
				type: 'ACTION_ROW', //playpause | eject | stop | skip
				components: [
				{
					type: 'BUTTON',
					customId: 'playpause',
					emoji: '⏯️',
					style: 'PRIMARY',
				},
				{
					type: 'BUTTON',
					customId: 'eject',
					emoji: '⏏️',
					style: 'DANGER',
				},
				{
					type: 'BUTTON',
					customId: 'stop',
					emoji: '⏹️',
					style: 'DANGER',
				},
				{
					type: 'BUTTON',
					customId: 'skip',
					emoji: '⏭️',
					style: 'DANGER',
				},
				{
					type: 'BUTTON',
					customId: 'clear',
					emoji: '✂️',
					style: 'SECONDARY',
				}]
			},
			{
				type: 'ACTION_ROW', //shuffle | singleLoop | queueloop | autoplay
				components: [
				{
					type: 'BUTTON',
					customId: 'shuffle',
					emoji: '🔀',
					style: 'SECONDARY',
				},
				{
					type: 'BUTTON',
					customId: 'singleloop',
					emoji: '🔂',
					style: 'SECONDARY',
				},
				{
					type: 'BUTTON',
					customId: 'queueloop',
					emoji: '🔁',
					style: 'SECONDARY',

				},
				{
					type: 'BUTTON',
					customId: 'autoplay',
					emoji: '♾️',
					style: 'SECONDARY',
				},
				{
					type: 'BUTTON',
					customId: 'timeline',
					emoji: '⏳',
					style: 'SECONDARY',
				}]
			},
			{
				type: 'ACTION_ROW', //volumeReduce | volumeIncrease | deleteRecentSong | StackupNextSong | PushdownRecentSong
				components: [
				{
					type: 'BUTTON',
					customId: 'volumereduce',
					emoji: '🔈',
					style: 'SECONDARY',
				},
				{
					type: 'BUTTON',
					customId: 'volumeincrease',
					emoji: '🔊',
					style: 'SECONDARY',
				},
				{
					type: 'BUTTON',
					customId: 'deleterecentsong',
					emoji: '❌',
					style: 'SECONDARY',
				},
				{
					type: 'BUTTON',
					customId: 'stackup',
					emoji: '⤴️',
					style: 'SECONDARY',
				},
				{
					type: 'BUTTON',
					customId: 'pushdown',
					emoji: '⤵️',
					style: 'SECONDARY',
				}]
			}
		],
	});

	server.playerInfo.playermsg = playermsg;
	server.playerInfo.playerChannelId = channel.id;
	server.playerInfo.isSetupped = true;

	try{ //messageCollector section
		const messageCollector = channel.createMessageCollector();

		messageCollector.on('collect', async (message) => {
			const wait = require('util').promisify(setTimeout);

			if(message.author.id == `${process.env.CLIENT_ID}`){
				await wait(10000);
				if(message.deletable) message.delete(); //일단 킵해두자 개씨발 좆같은개발자 애미찾으러감
			}else{ //씬봇 감지용
				server.queue.channel = server.playerInfo.playermsg.channel;
				await require('./stream.js').trigger(message, message.content, 'player');
				await wait(1000);	
				await message.delete().catch(e => console.log(e));
			}
		});

	}catch(error){
		console.log(error);
		//몰라
	}

	try{ //buttoncollector section
		const buttonCollector = channel.createMessageComponentCollector();
		
		buttonCollector.on('collect', async (interaction) => {
			if(!interaction.isButton()) return;
			if(!interaction.member.voice.channel) {
				updatePlayerMsg(server, interaction);
				return interaction.channel.send(`${interaction.user}, ` + syncplayerScript.firstJoinVc);
			}
			if(server.queue.songs.length == 0 && interaction.customId != 'eject') {
				updatePlayerMsg(server, interaction);
				return interaction.channel.send(syncplayerScript.nothingPlay);
			}
			
			switch(interaction.customId){
				case 'playpause':
					await server.pause(interaction);
					break;

				case 'eject':
					await server.eject(interaction);
					break;

				case 'stop':
					await server.stop(interaction);
					break;

				case 'skip':
					await server.skip(interaction);
					break;

				case 'clear':
					if(server.queue.songs.length > 1) await server.queue.songs.splice(1);
					break;

				case 'shuffle':
					await server.shuffle(interaction);
					break;

				case 'singleloop':
				case 'queueloop':
				case 'autoplay':
					await server.loop(interaction);
					break;

				case 'timeline':
					let timeline = '';
					const curtime = parseInt(server.connectionHandler.audioResource.playbackDuration / 1000);
					const parts = server.queue.songs[0].duration.split(':');
					const songdurSec = parts.length == 3 ? 
						(Number(parts[0]) * 3600 + Number(parts[1] * 60) + Number(parts[2])) :
						(Number(parts[0]) * 60 + Number(parts[1]));
					const timelinelocate = parseInt(curtime / songdurSec * 25);

					for(let i = 0; i < 25; i++){
						timeline = (i != timelinelocate) ? timeline + '━' : timeline + '➤';
					}

					const timelineEmbed = new MessageEmbed()
						.setColor(process.env.DEFAULT_COLOR)
						.addFields(
							{
								name: `타임라인 [${require('../structures/timestampcalculator.js').getTimestamp(curtime)} / ${server.queue.songs[0].duration}]`, value: `${timeline}`, inline: false,
							}
						);

					server.playerInfo.playermsg.channel.send({embeds:[timelineEmbed]});
					break;

				case 'volumereduce':
					server.queue.playinfo.volume = (server.queue.playinfo.volume - 0.1 <= 0) ? 0 : server.queue.playinfo.volume - 0.1;
					await server.connectionHandler.audioResource.volume.setVolume(server.queue.playinfo.volume);
					break;

				case 'volumeincrease':
					server.queue.playinfo.volume = (server.queue.playinfo.volume + 0.1 >= 1) ? 0 : server.queue.playinfo.volume + 0.1;
					await server.connectionHandler.audioResource.volume.setVolume(server.queue.playinfo.volume);
					break;

				case 'deleterecentsong':
					if(server.queue.songs.length < 2) return interaction.channel.send('대기열에 적어도 곡을 한 개 이상 넣어주세요');
					server.queue.songs.pop();
					if(server.queue.songs.length == 1 && server.queue.playinfo.playmode == '♾️ 자동 재생 모드'){
						const recRes = await require('../structures/autoRecommandSearch.js').autoRecommandSearch(server.queue.songs[0].url, interaction, null);
						server.queue.songs.push(recRes);
					}
					break;

				case 'stackup':
					if(server.queue.songs.length < 3) return interaction.channel.send('대기열에 노래가 최소 두 곡 이상이어야 합니다');
					server.queue.songs.push(server.queue.songs.splice(1,1)[0]);
					break;

				case 'pushdown':
					if(server.queue.songs.length < 3) return interaction.channel.send('대기열에 노래가 최소 두 곡 이상이어야 합니다');
					server.queue.songs.splice(1, 0, server.queue.songs.pop());
					break;
			}
			updatePlayerMsg(server, interaction);
		});
	}catch (error){
		console.log(error);
		console.log(`error occured in ${interaction.guild.name}@${interaction.guild.id}`);

	}
}

module.exports = {
	updatePlayerMsg,
	syncChannel,
	guildPlayer,
}
