const musicserverList = new Map();
const scReg = /^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/;
const ytdl = require('ytdl-core');
const {
	MessageEmbed,
	MessageActionRow,
	MessageButton
} = require('discord.js');
const {
	AudioPlayerStatus
} = require('@discordjs/voice');
const autoRecommandSearch = require('./autoRecommandSearch.js').autoRecommandSearch;
const guildPlayer = require('../musicdata/syncplayer.js').guildPlayer;
const { musicPreferenceScript } = require('../script.json');

class serverMusicInfo {
	constructor(guild){
		this.id = guild.id;
		this.name = guild.name;
		this.guild = guild;
		this.queue = {
			playinfo: {
				playmode: '반복 모드 꺼짐',
				volume: 0.3,
			},
			songs: [],
			channel: null, //player channel이 아니여야함
			prevsongUrl: '',
		};		
		this.connectionHandler = {
			connection: null,
			audioPlayer: null,
			audioResource: null,
			connectionStatus: '⏹️ 재생 중이 아님',
			paused: false,
		};
		this.playerInfo = {
			playerChannelId: '',
			playermsg: null,
			isSetupped: false,
		};
	}
		
	//np, q는 interaction이 무조건 commandMessage임
	async nowplaying(interaction){
		const queue = this.queue;
		const ytdl = require('ytdl-core');
		const curtime = require('./timestampcalculator.js')
			.getTimestamp(parseInt(this.connectionHandler.audioResource.playbackDuration / 1000));
		const author = queue.songs[0].author;

		if(!author.thumbnail){
			const info = await ytdl.getInfo(queue.songs[0].url);
			author.thumbnail = info.videoDetails.author.thumbnails[0].url;
		}
			
		const npEmbed = new MessageEmbed()
					.setColor(process.env.DEFAULT_COLOR)
					.setAuthor(`${author.name}`, `${author.thumbnail}`, `${author.channelURL}`)
					.setTitle(`${queue.songs[0].title}`)
					.setURL(`${queue.songs[0].url}`)
					.setDescription(`${this.connectionHandler.connectionStatus} | ${queue.playinfo.playmode} | 🔉: ${Math.round(queue.playinfo.volume * 100)}% | [${curtime} / ${queue.songs[0].duration}]`)
					.setFooter(`requested by ${queue.songs[0].request.name} | ${scReg.test(queue.songs[0].url) ? 'Soundcloud' : 'Youtube'}`, `${queue.songs[0].request.avatarURL}`)
					.setThumbnail(`${queue.songs[0].thumbnail}`)

		if(queue.songs.length > 1) npEmbed.addFields({
			name: '다음 곡',
			value: `${queue.songs[1].title}`,
			inline: false
		});

		return interaction.editReply({embeds: [npEmbed]});
	}

	async viewqueue(interaction){
		const queue = this.queue;
		const sec = require('./timestampcalculator.js').timestamptoSec(queue.songs);
		const timestampSec = require('./timestampcalculator.js').getTimestamp(sec);
		const pages = [];
				
		let queueembed = new MessageEmbed()
					.setTitle(`대기열 목록 : 총 ${queue.songs.length-1}곡`)
					.setColor(process.env.DEFAULT_COLOR)
					.setDescription(`${this.connectionHandler.connectionStatus} | ${queue.playinfo.playmode} | 🔉: ${Math.round(queue.playinfo.volume * 100)}% | 러닝타임: ${timestampSec}`);

		for(let i = 0; i < queue.songs.length; i++){
			let title = `#${i}. ${queue.songs[i].title}`;
			if(i == 0){
				title = `#NowPlaying>> ${queue.songs[i].title}`;
				queueembed.addFields({
					name: title, value: `[${queue.songs[i].duration}] | ${queue.songs[i].url}\nrequested by ${queue.songs[i].request.name}`, inline: false
				});
			}else{
				queueembed.addFields({
					name: title, value: `[${queue.songs[i].duration}] | ${queue.songs[i].url}`, inline: false
				});
			}
					
			if((i+1)%10 == 0){
				pages.push(queueembed);
				queueembed = new MessageEmbed()
					.setTitle(`대기열 목록 : 총 ${queue.songs.length-1}곡`)
					.setColor(process.env.DEFAULT_COLOR)
					.setDescription(`${this.connectionHandler.connectionStatus} | ${queue.playinfo.playmode} | 🔉: ${Math.round(queue.playinfo.volume * 100)}%`)
			}
		}	
		if(queue.songs.length % 10 != 0) pages.push(queueembed);

		await require('./reactionpages.js').reactionpages(interaction, pages, true);
		return interaction;
	}	

	pause(interaction){ //interaction을 Button인지 CommandMessage인지 나눠야함 
		let paused = this.connectionHandler.paused;
		if(paused){
			this.connectionHandler.audioPlayer.unpause();
			paused = false;
		}else{
			this.connectionHandler.audioPlayer.pause();
			paused = true;
		}

		const editmsg = !paused ? musicPreferenceScript.playmsg : musicPreferenceScript.pausemsg;
		if(interaction.isCommand()) interaction.editReply(editmsg);
		//if(this.playerInfo.isSetupped) updatePlayerMsg(); 이거는 cmd랑 button함수 맨 밑에 한번씩만 두기
		
		return paused;
	}

	async skip(interaction){
		await this.connectionHandler.audioPlayer?.stop();
		if(interaction.isCommand()) interaction.editReply(musicPreferenceScript.skipmsg);
	}

	async stop(interaction){
		await this.enterstop();
		await this.connectionHandler.audioPlayer?.stop(true);
		if(interaction.isCommand()) interaction.editReply(musicPreferenceScript.stopmsg);
	}

	async eject(interaction){
		await this.connectionHandler.connection.destroy();
		await this.enterstop();
		if(this.connectionHandler.audioPlayer) await this.connectionHandler.audioPlayer.stop(true);
		if(interaction.isCommand()) interaction.editReply(musicPreferenceScript.ejectmsg);
	}

	async shuffle(interaction){
		if(this.queue.songs.length < 3) {
			if(interaction.isCommand()) interaction.editReply('대기열에 노래가 최소 두 곡 이상이어야 합니다');
			if(interaction.isButton()) interaction.channel.send('대기열에 노래가 최소 두 곡 이상이어야 합니다');
			return;
		}
		for(let i = this.queue.songs.length - 1; i >= 0; i--){
			let j = Math.floor((Math.random() * i)) + 1;
			if(j == 0 || i == 0) continue;
			[this.queue.songs[i], this.queue.songs[j]] = [this.queue.songs[j], this.queue.songs[i]];
		}

		if(interaction.isCommand()) await interaction.editReply(musicPreferenceScript.shufmsg);
	}

	async loop(interaction){
		if(interaction.isCommand()){ //Command면
			if(interaction.channel.id == this.playerInfo.playerChannelId) return interaction.channel.send(musicPreferenceScript.loopwarn);
			const selectmodeEmbed = new MessageEmbed()
				.setTitle(`재생 모드를 선택해주세요`)
				.setDescription(`현재 모드: **${this.queue.playinfo.playmode}**`)
				.addFields({
					name: '🔂 싱글 루프 모드', value: musicPreferenceScript.loopsingledes, inline: false
				})
				.addFields({
					name: '🔁 대기열 반복 모드', value: musicPreferenceScript.loopqueuedes, inline: false
				})
				.addFields({
					name: '♾️ 자동 재생 모드', value: musicPreferenceScript.loopautodes, inline: false
				})
				.setFooter(musicPreferenceScript.loopoffdes)
				.setColor(process.env.DEFAULT_COLOR);

			const selectbuttons = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('single')
						.setEmoji('🔂')
						.setStyle('SECONDARY'),
					new MessageButton()
						.setCustomId('queue')
						.setEmoji('🔁')
						.setStyle('SECONDARY'),
					new MessageButton()
						.setCustomId('autoplay')
						.setEmoji('♾️')
						.setStyle('SECONDARY'),
					new MessageButton()
						.setCustomId('off')
						.setLabel('끄기')
						.setStyle('SECONDARY')
						.setDisabled(true), //기본값
				);

			if(this.queue.playinfo.playmode == '반복 모드 꺼짐'){
				selectbuttons.components[0].disabled = false;
				selectbuttons.components[1].disabled = false;
				selectbuttons.components[2].disabled = false;
				selectbuttons.components[3].disabled = true;
			}else{
				if(this.queue.playinfo.playmode == '🔂 싱글 루프 모드'){
					selectbuttons.components[0].disabled = true;
					selectbuttons.components[1].disabled = false;
					selectbuttons.components[2].disabled = false;
					selectbuttons.components[3].disabled = false;
				}else if(this.queue.playinfo.playmode == '🔁 대기열 반복 모드'){
					selectbuttons.components[0].disabled = false;
					selectbuttons.components[1].disabled = true;
					selectbuttons.components[2].disabled = false;
					selectbuttons.components[3].disabled = false;
				}else if(this.queue.playinfo.playmode == '♾️ 자동 재생 모드'){
					selectbuttons.components[0].disabled = false;
					selectbuttons.components[1].disabled = false;
					selectbuttons.components[2].disabled = true;
					selectbuttons.components[3].disabled = false;
					}
			}

			await interaction.editReply({embeds:[selectmodeEmbed], components: [selectbuttons]});
				const filter = i => i.user.id == interaction.member.id;
				const collector = interaction.channel.createMessageComponentCollector({filter, time:300000});

				collector.on('collect', async button => {
					switch(button.customId){
						case 'single':
							this.queue.playinfo.playmode = '🔂 싱글 루프 모드';
							break;

						case 'queue':
							this.queue.playinfo.playmode = '🔁 대기열 반복 모드';
							break;

						case 'autoplay':
							this.queue.playinfo.playmode = '♾️ 자동 재생 모드';
							break;

						case 'off':
							this.queue.playinfo.playmode = '반복 모드 꺼짐'
							break;
					}

					await collector.stop();
					if(this.queue.playinfo.playmode == '반복 모드 꺼짐'){
						await interaction.deleteReply();
						await interaction.channel.send({content: musicPreferenceScript.loopoffmsg})
					}else{
						await interaction.deleteReply();
						await interaction.channel.send({content: musicPreferenceScript.loopchmsg.interpolate({playmode: this.queue.playinfo.playmode})});
					}
			});
		}else{ //button이면
			switch(interaction.customId){
				case 'singleloop':
					if(this.queue.playinfo.playmode == '🔂 싱글 루프 모드') {
						this.queue.playinfo.playmode = '반복 모드 꺼짐';
						break;
					}else{
						this.queue.playinfo.playmode = '🔂 싱글 루프 모드';
					}
					break;

				case 'queueloop':
					if(this.queue.playinfo.playmode == '🔁 대기열 반복 모드') {
						this.queue.playinfo.playmode = '반복 모드 꺼짐';
						break;
					}else{
						this.queue.playinfo.playmode = '🔁 대기열 반복 모드';
					}

					break;

				case 'autoplay':
					if(this.queue.playinfo.playmode == '♾️ 자동 재생 모드') {
						this.queue.playinfo.playmode = '반복 모드 꺼짐';
						break;
					}else{
						this.queue.playinfo.playmode = '♾️ 자동 재생 모드';
					}

					break;
			}
		}

		if(this.queue.songs.length == 1 && this.queue.playinfo.playmode == '♾️ 자동 재생 모드'){
			const recRes = await autoRecommandSearch(this.queue.songs[0].url, interaction, null);
			this.queue.songs.push(recRes);
		}
	}

	volume(interaction, size){ //얘도 interaction이 무적권 Command임
		if(size < 1 || size > 100) return interaction.editReply(musicPreferenceScript.volRangeWarn);
		this.connectionHandler.audioResource.volume.setVolume(size / 100);
		this.queue.playinfo.volume = size / 100;
		return interaction.editReply(musicPreferenceScript.volset.interpolate({size: `${size}`}));
	}

	async jump(interaction, goto){ //얘는 interaction이 무조건 Command임
		if(goto >= this.queue.songs.length) return interaction.editReply(musicPreferenceScript.jumpRangeWarn);
		await interaction.editReply(musicPreferenceScript.jumped.interpolate({goto: `${goto}`, title: `${this.queue.songs[goto].title}`}));
		if(this.queue.playinfo.playmode == '🔁 대기열 반복 모드'){
			this.queue.songs = this.queue.songs.concat(this.queue.songs.splice(0, goto-1));
		}else{
			this.queue.songs.splice(1, goto-1);
		}
		await this.connectionHandler.audioPlayer.stop();
	}

	async removequeue(interaction, target1, endpoint){ //얘도
		if(this.queue.songs.length == 1) return interaction.editReply(musicPreferenceScript.rmWarn1);
		if(target1 < 1) return interaction.editReply(musicPreferenceScript.rmWarn2);
		
		//노래 지워진거 보여주는 임베드	
		//가슴이 웅장해진다..
		const DeletedSingleEmbed = new MessageEmbed()
			.setTitle('대기열 편집됨')
			.setColor(process.env.DEFAULT_COLOR);
			
		if(!endpoint){
			if(target1 == 1){ //한곡만 지움
				DeletedSingleEmbed
					.addFields({
						name: `#NowPlaying>> ${this.queue.songs[0].title}`, value: `[${this.queue.songs[0].duration}] | ${this.queue.songs[0].url}\n${this.queue.songs[0].request.name}`, inline: false
						})
					.addFields({
						name: `~~#1. ${this.queue.songs[1].title}~~`, value: `~~[${this.queue.songs[1].duration}] | ${this.queue.songs[1].url}~~`, inline: false
					});
				
				//대기열에 두곡 이상이면 번호 옮겨졌다는거 표시
				if(this.queue.songs.length > 2){
					DeletedSingleEmbed
						.addFields({
							name: `~~#2.~~ #1. ${this.queue.songs[2].title}`, value: `[${this.queue.songs[2].duration}] | ${this.queue.songs[2].url}`, inline: false
						})
					if(this.queue.songs.length > 3){ //대기열에 세곡 이상이면 이외에 곡들 있다고 표시
						DeletedSingleEmbed
							.addFields({
								name: `.....`, value: `....\n...\n..이외에 ${this.queue.songs.length -2}곡 대기 중`, inline: false
							});
					}
				}
			}else if(target1 == this.queue.songs.length - 1 && target1 != 1){
				DeletedSingleEmbed
					.addFields({
						name: `.\n..\n...`, value: `....위에 ${this.queue.songs.length -2}곡 대기 중`, inline: false
					})
					.addFields({
						name: `~~#${target1}. ${this.queue.songs[target1].title}~~ **<< 지워짐**`, value: `~~[${this.queue.songs[target1].duration}] | ${this.queue.songs[target1].url}~~`, inline: false
					});
			}else{
				DeletedSingleEmbed
					.addFields({
						name: `.\n..\n...`, value: `....위에 ${target1 -1}곡 대기 중`, inline: false
					})	
					.addFields({
						name: `~~#${target1}. ${this.queue.songs[target1].title}~~ **<< 지워짐**`, value: `~~[${this.queue.songs[target1].duration}] | ${this.queue.songs[target1].url}~~`, inline: false
					})
					.addFields({
						name: `.....`, value: `....\n...\n..이외에 ${this.queue.songs.length - target1}곡 대기 중`, inline: false
					});
			}

			if(interaction.channel.id != this.playerInfo.playerChannelId) {
				await interaction.editReply({content: musicPreferenceScript.rmclear2, embeds:[DeletedSingleEmbed]});
			}else{
				await interaction.editReply({content: musicPreferenceScript.rmclear0.interpolate({target: `${target1}`, title: `${this.queue.songs[target1]/title}`})});
			}
			this.queue.songs.splice(target1, 1);

		}else{
			if(endpoint > this.queue.songs.length - 1 || endpoint <= target1) return interaction.editReply(musicPreferenceScript.rmWarn3);

			if(target1 == 1 && endpoint == this.queue.songs.length -1){
				//대기열 전부 삭제
				interaction.editReply(musicPreferenceScript.rmclear1);
				this.queue.songs.splice(target1, endpoint-target1+1);
				return;

			}else if(target1 == 1 && endpoint != this.queue.songs.length-1){
				//대기열 처음부터 일부까지 삭제
				DeletedSingleEmbed
					.addFields({
						name: `................................`, value:`//// ${endpoint-target1+1}곡 삭제됨 ////\n.....................................` , inline: false
					})
					.addFields({
						name: `~~#${endpoint+1}.~~ #1. ${this.queue.songs[endpoint+1].title}`, value: `[${this.queue.songs[endpoint+1].duration}] | ${this.queue.songs[endpoint+1].url}`, inline: false
					})
					.addFields({
						name: `.....`, value: `....\n...\n..이외에 ${this.queue.songs.length - endpoint}곡 대기 중`, inline: false
					})

			}else if(target1 != 1 && endpoint == this.queue.songs.length-1){
						//대기열 일부부터 끝까지 삭제
				DeletedSingleEmbed
					.addFields({
						name: `.\n..\n...`, value: `....위에 ${target1 -2}곡 대기 중`, inline: false
					})
					.addFields({
						name: `#${target1-1}. ${this.queue.songs[target1-1].title}`, value: `[${this.queue.songs[target1-1].duration}] | ${this.queue.songs[target1-1].url}`, inline: false
					})
					.addFields({
						name: `................................`, value:`//// 밑에 ${endpoint-target1+1}곡 삭제됨 ////\n.....................................` , inline: false
					})

			}else if(target1 != 1 && endpoint != this.queue.songs.length-1){
				//대기열 일부부터 일부까지 삭제
				DeletedSingleEmbed
					.addFields({
						name: `.\n..\n...`, value: `....위에 ${target1 -2}곡 대기 중`, inline: false
					})
					.addFields({
						name: `#${target1-1}. ${this.queue.songs[target1-1].title}`, value: `[${this.queue.songs[target1-1].duration}] | ${this.queue.songs[target1-1].url}`, inline: false
					})
					.addFields({
						name: `................................`, value:`//// ${endpoint-target1+1}곡 삭제됨 ////\n.....................................` , inline: false
					})
					.addFields({
						name: `#${endpoint+1}. ${this.queue.songs[endpoint+1].title}`, value: `[${this.queue.songs[endpoint+1].duration}] | ${this.queue.songs[endpoint+1].url}`, inline: false
					})
					.addFields({
						name: `.....`, value: `....\n...\n..이외에 ${this.queue.songs.length - endpoint -1}곡 대기 중`, inline: false
					})
			}

			if(interaction.channel.id != this.playerInfo.playerChannelId) {
				await interaction.editReply({content: musicPreferenceScript.rmclear2, embeds:[DeletedSingleEmbed]});
			}else{
				await interaction.editReply({content: musicPreferenceScript.rmclear3.interpolate({target: `${target1}`, endpt: `${endpoint}`})});
			}
			this.queue.songs.splice(target1, endpoint - target1 + 1);
			
		}
	}

	async move(interaction, target, locate){ //얘도
		if(this.queue.songs.length < 3) return interaction.editReply(musicPreferenceScript.moveWarn1);
		if(target > this.queue.songs.length-1 || target < 1) return interaction.editReply(musicPreferenceScript.moveWarn2);
		if(locate == target || locate > this.queue.songs.length - 1 || locate < 1) return interaction.editReply(musicPreferenceScript.moveWarn3);
		function movearray(list, target, moveValue){
			const newpos = Number(target) + Number(moveValue);
			const tempList = JSON.parse(JSON.stringify(list));
			const totarget = tempList.splice(target, 1)[0];
			tempList.splice(newpos, 0, totarget);
			return tempList;
		}
		await interaction.editReply(musicPreferenceScript.moved.interpolate({target: target, title: this.queue.songs[target].title, locate: locate}));
		this.queue.songs = movearray(this.queue.songs, target, locate - target);
	}

	enterstop(){
		this.connectionHandler.connectionStatus = '⏹️ 재생 중이 아님';
		this.connectionHandler.paused = false;
		this.connectionHandler.audioResource = null;
		this.queue = {
			playinfo: {
				playmode: '반복 모드 꺼짐',
				volume: 0.3,
				isplaying: false,
			},
			songs: [],
			prevsongUrl: '',
			channel: null,
		}
	}
}

module.exports = {
	musicserverList,
	serverMusicInfo
}
