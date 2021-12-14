const musicserverList = new Map();

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


class serverMusicInfo {
	constructor(guild){
		this.id = guild.id;
		this.name = guild.name;
		this.guild = guild;
		this.queue = {
			playinfo: {
				playmode: '반복 모드 꺼짐',
				volume: 0.3,
				curq: 0,
			},
			songs: [],
			channel: null,
			prevsongUrl: '',
		};		
		this.connectionHandler = {
			connection: null,
			audioplayer: null,
			audioResource: null,
			connectionStatus: '',
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
					.setColor('#023E8A')
					.setAuthor(`${author.name}`, `${author.thumbnail}`, `${author.channelURL}`)
					.setTitle(`${queue.songs[0].title}`)
					.setURL(`${queue.songs[0].url}`)
					.setDescription(`${this.connectionHandler.connectionStatus} | ${queue.playinfo.playmode} | 🔉: ${Math.round(queue.playinfo.volume * 100)}% | [${curtime} / ${queue.songs[0].duration}]`)
					.setFooter(`requested by ${queue.songs[0].requestedby}`, `${queue.songs[0].requestedbyAvatarURL}`)
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
					.setColor('#023E8A')
					.setDescription(`${this.connectionHandler.connectionStatus} | ${queue.playinfo.playmode} | 🔉: ${Math.round(queue.playinfo.volume * 100)}% | 러닝타임: ${timestampSec}`);

		for(let i = 0; i < queue.songs.length; i++){
			let title = `#${i}. ${queue.songs[i].title}`;
			if(i == queue.playinfo.curq){
				title = `#NowPlaying>> ${queue.songs[i].title}`;
				queueembed.addFields({
					name: title, value: `[${queue.songs[i].duration}] | ${queue.songs[i].url}\nrequested by ${queue.songs[i].requestedby}`, inline: false
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
					.setColor('#023E8A')
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
			this.connectionHandler.audioplayer.unpause();
			paused = false;
		}else{
			this.connectionHandler.audioplayer.pause(true);
		}

		const editmsg = !paused ? '▶️ 노래를 다시 틀었어요' : '⏸️ 노래를 일시정지했어요';
		if(interaction.isCommand()) interaction.editReply(editmsg);
		//if(this.playerInfo.isSetupped) updatePlayerMsg(); 이거는 cmd랑 button함수 맨 밑에 한번씩만 두기
		
		return paused;
	}

	async skip(interaction){
		await this.connectionHandler.audioplayer.stop();
		if(interaction.isCommand()) interaction.editReply('⏭ 노래를 스킵했어요');
	}

	async stop(interaction){
		this.queue.songs = await [];
		await this.connectionHandler.audioplayer.stop(true);
		if(interaction.isCommand()) interaction.editReply('⏹ 대기열을 초기화하고 노래를 멈췄어요');
	}

	async eject(interaction){
		this.queue.songs = [];
		if(this.connectionHandler.audioplayer) await this.connectionHandler.audioplayer.stop(true);
		if(this.connectionHandler.connection) {
			await this.connectionHandler.connection.destroy();
		} else if(interaction.guild.me.voice.channel) await interaction.guild.me.voice.channel.disconnect();
		this.connectionHandler.audioplayer = null;
		this.connectionHandler.audioResource = null;
		if(interaction.isCommand()) interaction.editReply('⏏️ 대기열을 초기화하고 음성 채널을 나갔아요.');
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

		if(interaction.isCommand()) await interaction.editReply('🔀 대기열에 있는 노래가 섞였어요');
	}

	async loop(interaction){
		if(interaction.isCommand()){ //Command면
			if(interaction.channel.id == this.playerInfo.playerChannelId) return interaction.channel.send('플레이어 채널에서 반복 모드 설정은 버튼을 이용해 주세요!');
			const selectmodeEmbed = new MessageEmbed()
				.setTitle(`재생 모드를 선택해주세요`)
				.setDescription(`현재 모드: **${this.queue.playinfo.playmode}**`)
				.addFields({
					name: '🔂 싱글 루프 모드', value: '한 곡만 반복해요', inline: false
				})
				.addFields({
					name: '🔁 대기열 반복 모드', value: '대기열의 노래를 계속 반복해요', inline: false
				})
				.addFields({
					name: '♾️ 자동 재생 모드', value: '유튜브에서 추천 노래를 찾아 대기열에 한곡씩 계속 추가해요', inline: false
				})
				.setFooter('아니면 모드를 끌 수도 있어요')
				.setColor('#023E8A');

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
						await interaction.channel.send({content:'반복 모드를 껐어요'})
					}else{
						await interaction.deleteReply();
						await interaction.channel.send({content:`반복 모드를 **${this.queue.playinfo.playmode}**로 설정했어요`});
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
		if(size < 1 || size > 100) return interaction.editReply('볼륨 범위는 1부터 100까지의 정수만 가능해요');
		this.connectionHandler.audioResource.volume.setVolume(size / 100);
		this.queue.playinfo.volume = size / 100;
		return interaction.editReply(`🔉 볼륨을 ${size}%로 설정했어요`);
	}

	async jump(interaction, goto){ //얘는 interaction이 무조건 Command임
		if(goto >= this.queue.songs.length) return interaction.editReply('범위를 제대로 설정해 주세요!');
		await interaction.editReply(`대기열 ${goto}번 **${this.queue.songs[goto].title}**로 스킵했어요!`);
		if(this.queue.playinfo.playmode == '🔁 대기열 반복 모드'){
			this.queue.songs = this.queue.songs.concat(this.queue.songs.splice(0, goto-1));
		}else{
			this.queue.songs.splice(1, goto-1);
		}
		await this.connectionHandler.audioplayer.stop();
	}

	async removequeue(interaction, target1, endpoint){ //얘도
		if(this.queue.songs.length == 1) return interaction.editReply('대기열에 아무 노래도 없어요..');
		if(target1 < 1) return interaction.editReply('지울 노래의 번호를 자연수로 입력해주세요');
		
		//노래 지워진거 보여주는 임베드	
		//가슴이 웅장해진다..
		const DeletedSingleEmbed = new MessageEmbed()
			.setTitle('대기열 편집됨')
			.setColor('#023E8A');
			
		if(!endpoint){
			if(target1 == 1){ //한곡만 지움
				DeletedSingleEmbed
					.addFields({
						name: `#NowPlaying>> ${this.queue.songs[0].title}`, value: `[${this.queue.songs[0].duration}] | ${this.queue.songs[0].url}\n${this.queue.songs[0].requestedby}`, inline: false
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
				await interaction.editReply({content: '대기열에 있는 노래가 이렇게 지워졌어요', embeds:[DeletedSingleEmbed]});
			}else{
				await interaction.editReply({content: `대기열 #${target1}번 **${this.queue.songs[target1].title}** 삭제했어요`})
			}
			this.queue.songs.splice(target1, 1);

		}else{
			if(endpoint > this.queue.songs.length - 1 || endpoint <= target1) return interaction.editReply('지우는 범위를 제대로 입력해주세요');

			if(target1 == 1 && endpoint == this.queue.songs.length -1){
				//대기열 전부 삭제
				interaction.editReply(`대기열에 있던 모든 노래 ${this.queue.songs.length-1}개를 지웠어요.`);
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
				await interaction.editReply({content: '대기열에 있는 노래가 이렇게 지워졌어요', embeds:[DeletedSingleEmbed]});
			}else{
				await interaction.editReply({content: `대기열 **${target1}**번부터 **${endpoint}**번까지 지웠어요`});
			}
			this.queue.songs.splice(target1, endpoint - target1 + 1);
			
		}
	}

	async move(interaction, target, locate){ //얘도
		if(this.queue.songs.length < 3) return interaction.editReply('노래를 옮길 곳이 없어요!');
		if(target > this.queue.songs.length-1 || target < 1) return interaction.editReply('대기열 내에 있는 노래를 선택해주세요!');
		if(locate == target || locate > this.queue.songs.length - 1 || locate < 1) return interaction.editReply('위치 범위를 제대로 설정해주세요!');
		function movearray(list, target, moveValue){
			const newpos = Number(target) + Number(moveValue);
			const tempList = JSON.parse(JSON.stringify(list));
			const totarget = tempList.splice(target, 1)[0];
			tempList.splice(newpos, 0, totarget);
			return tempList;
		}
		await interaction.editReply(`대기열 ${target}번: **${this.queue.songs[target].title}**의 대기 위치를 **${locate}**번으로 옮겼어요`);
		this.queue.songs = movearray(this.queue.songs, target, locate - target);
	}

}

module.exports = {
	musicserverList,
	serverMusicInfo
}

