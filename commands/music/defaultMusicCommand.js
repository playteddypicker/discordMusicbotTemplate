const { SlashCommandBuilder } = require('@discordjs/builders');
const { serverInfoList } = require('../../musicdata/structures/musicServerInfo.js');
const {
	MessageEmbed,
	MessageActionRow,
	MessageButton,
} = require('discord.js');
const {
	totalSongDuration,
	getTimestamp
} = require('../../musicdata/structures/timestamp.js');
const { reactionpages } = require('../../musicdata/structures/reactionpages.js');
const { defaultMusicCommandScript } = require('../../script.json');
const ytReg = /^https:?\/\/(www.youtube.com|youtube.com|youtu.be)/;
const ytdl = require('ytdl-core');
const scdl = require('soundcloud-downloader').default;
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('m')
		.setDescription('음악 명령어 모음')
		.addSubcommand(subcmd =>
			subcmd
				.setName('np')
				.setDescription('ℹ️ 현재 재생 중인 노래의 정보를 보여줘요'))
		.addSubcommand(subcmd =>
			subcmd
				.setName('q')
				.setDescription('📜 현재 대기 중인 노래의 목록을 보여줘요'))
		.addSubcommand(subcmd =>
			subcmd
				.setName('pause')
				.setDescription('⏸ 노래를 일시정지해요. 다시 입력하면 노래를 재개해요.'))
		.addSubcommand(subcmd =>
			subcmd
				.setName('skip')
				.setDescription('⏭ 현재 재생 중인 노래를 스킵해요'))
		.addSubcommand(subcmd =>
			subcmd
				.setName('stop')
				.setDescription('⏹ 현재 재생 중인 노래를 멈추고 음악 플레이어를 초기화해요'))
		.addSubcommand(subcmd =>
			subcmd
				.setName('eject')
				.setDescription('⏏️ 음악 플레이어를 초기화하고 음성 채널을 나가요'))
		.addSubcommand(subcmd =>
			subcmd
				.setName('shuffle')
				.setDescription('🔀 대기열의 노래를 섞어요'))
		.addSubcommand(subcmd =>
			subcmd
				.setName('loop')
				.setDescription('🔁 반복 모드를 설정해요'))
		.addSubcommand(subcmd =>
			subcmd
				.setName('volume')
				.setDescription('🔉 스트리밍 할 때의 볼륨을 바꿔요. 모두에게 지정되는 값이에요')
				.addIntegerOption(option =>
					option
						.setName('volume')
						.setDescription('볼륨을 몇%로 설정할건지 1~100까지의 자연수를 써 주세요')
						.setRequired(true)
				))
		.addSubcommand(subcmd =>
			subcmd
				.setName('jump')
				.setDescription('🛹 대기열의 특정 노래로 스킵해요')
				.addIntegerOption(option =>
					option
						.setName('goto')
						.setDescription('어디로 스킵할지 번호를 써 주세요')
						.setRequired(true)
				))
		.addSubcommand(subcmd =>
			subcmd
				.setName('remove')
				.setDescription('🗑️ 대기열의 노래를 하나만 지우거나 한꺼번에 지워요')
				.addIntegerOption(option =>
					option
						.setName('range1')
						.setDescription('어떤 노래를 지울지 번호를 써 주세요')
						.setRequired(true)
				).addIntegerOption(option =>
					option
						.setName('range2')
						.setDescription('어디까지 지울지 써 주세요')
						.setRequired(false)
				))
		.addSubcommand(subcmd =>
			subcmd
				.setName('move')
				.setDescription('↪️ 대기열에 있는 특정 노래의 위치를 옮겨요')
				.addIntegerOption(option =>
					option
						.setName('range1')
						.setDescription('옮길 노래를 선택해주세요')
						.setRequired(true)
				).addIntegerOption(option =>
					option
						.setName('range2')
						.setDescription('옮길 위치를 선택해주세요')
						.setRequired(true)
				)),
	async execute(interaction){
		const server = serverInfoList.get(interaction.guild.id);

		//np나 queue는 음성채널 안 들어가있어도 가능
		//나머지는 음성채널 들어가 이써야 하고 거기에 봇이 있어야함
		const command = interaction.options.getSubcommand();

		if(server.queue.length == 0 && command != 'eject') return interaction.reply(defaultMusicCommandScript.nothingPlay);

		if(command != 'np' && command != 'q'){
			if(interaction.member.voice.channel){
				if(!interaction.member.voice.channel.members.find(m => m.user.id == process.env.CLIENT_ID)) return interaction.reply(defaultMusicCommandScript.existOtherVc);
			}else{
				return interaction.reply(defaultMusicCommandScript.firstJoinVc);
			}
		}
		await interaction.deferReply();

		switch(command){
			case 'np':
				nowplaying(interaction, server);
				break;

			case 'q':
				viewqueue(interaction, server);
				break;

			case 'pause':
				server.pause();
				interaction.editReply(server.streamInfo.audioPlayer.paused ?
					`${defaultMusicCommandScript.pausemsg}` :
					`${defaultMusicCommandScript.playmsg}`);
				break;

			case 'skip':
				await server.skip();
				interaction.editReply(defaultMusicCommandScript.skipmsg);
				break;

			case 'stop':
				await server.stop();
				interaction.editReply(defaultMusicCommandScript.stopmsg);
				break;

			case 'eject':
				await server.eject();
				interaction.editReply(defaultMusicCommandScript.ejectmsg);
				break;

			case 'shuffle':
				interaction.editReply(server.shuffle() ? 
					defaultMusicCommandScript.shuferr :
					defaultMusicCommandScript.shufmsg);
				break;

			case 'loop':
				if(interaction.channel.id == server.playerInfo.playerChannelId) 
					return interaction.channel.send(defaultMusicCommandScript.loopwarn);
				await loopMessage(interaction, server);
				break;

			case 'volume':
				await server.volume(interaction.options.getInteger('volume')) ? 
					interaction.editReply(defaultMusicCommandScript.volRangeWarn) :
					interaction.editReply(defaultMusicCommandScript.volset.interpolate({
						size: `${interaction.options.getInteger('volume')}`
					}));
				break;

			case 'jump':
				break;

			case 'remove':
				break;

			case 'move':
				break;
		}

		//if(server.playerInfo.playerChannelId) //edit player.
	}
}

async function nowplaying(interaction, server){
	const curtime = getTimestamp(parseInt(server.streamInfo.audioResource.playbackDuration / 1000));
	const queue = server.queue;
	const author = queue[0].author;
	if(!author.thumbnail){
		try{
			if(ytReg.test(queue[0].url)){
					const info = await ytdl.getInfo(queue[0].url);
					author.thumbnail = info.videoDetails.author.thumbnails[0].url;	
			}else{
				const info = await scdl.getSetInfo(text);
				author.thumbnail = res.user.avatar_url ?? 'https://cdn-icons-png.flaticon.com/512/51/51992.png';

			}
		}catch(error){
			console.log(error);
			author.thumbnail = interaction.client.user.avatarURL();
		}
	}

	const npEmbed = new MessageEmbed()
		.setColor(process.env.DEFAULT_COLOR)
		.setAuthor(`${author.name}`, `${author.thumbnail}`, `${author.channelURL}`)
		.setTitle(`${queue[0].title}`)
		.setURL(`${queue[0].url}`)
		.setDescription(`${server.streamInfo.playStatus} | ${server.streamInfo.playInfo.loopmode} | 🔉: ${Math.round(server.streamInfo.playInfo.volume * 100)}% | [${curtime} / ${queue[0].duration}]`)
		.setFooter(`requested by ${queue[0].request.name} | ${ytReg.test(queue[0].url) ? 'Youtube' : 'Soundcloud'}`, `${queue[0].request.avatarURL}`)
		.setThumbnail(`${queue[0].thumbnail}`)

	if(queue.length > 1) npEmbed.addFields({
		name: '다음 곡',
		value: `${queue[1].title}`,
		inline: false
	});

	return interaction.editReply({embeds: [npEmbed]});
}

async function viewqueue(interaction, server){
	const queue = server.queue;
	const sec = totalSongDuration(queue);
	const pages = [];

	let queueEmbed = new MessageEmbed()
		.setTitle(`대기 중인 노래 총 ${queue.length - 1}곡`)
		.setColor(process.env.DEFAULT_COLOR)
		.setDescription(`${server.streamInfo.playStatus} | ${server.streamInfo.playInfo.loopmode} | 🔉: ${Math.round(server.streamInfo.playInfo.volume * 100)}% | 러닝타임: ${getTimestamp(sec)}`);

	for(let i = 0; i < queue.length; i++){
		let title = `#${i}. ${queue[i].title}`;
		if(i == 0){
			title = `#Playing>> ${queue[i].title}`;
			queueEmbed.addFields({
				name: title,
				value: `[${queue[i].duration}] | ${queue[i].url}\nrequested by ${queue[i].request.name}`,
				inline: false
			});
		}else{
			queueEmbed.addFields({
				name: title,
				value: `[${queue[i].duration}] | ${queue[i].url}`,
				inline: false
			});
		}

		if((i+1)%10 == 0){
			pages.push(queueEmbed);
			queueEmbed = new MessageEmbed()
			.setTitle(`대기 중인 노래 총 ${queue.length - 1}곡`)
			.setColor(process.env.DEFAULT_COLOR)
			.setDescription(`${server.streamInfo.playStatus} | ${server.streamInfo.playInfo.loopmode} | 🔉: ${Math.round(server.streamInfo.playInfo.volume * 100)}% | 러닝타임: ${getTimestamp(sec)}`);
		}
	}
	if(queue.length % 10 != 0) pages.push(queueEmbed);
	await reactionpages(interaction, pages, true);
}

async function loopMessage(interaction, server){
	const selectmodeEmbed = new MessageEmbed()
		.setTitle('반복 모드를 선택해주세요')
		.setDescription(`현재 **${server.streamInfo.playInfo.loopmode}**`)
		.addFields({
			name: '🔂 싱글 루프 모드',
			value: defaultmusicCommandScript.loopsingledes,
			inline: false,
		})
		.addFields({
			name: '🔁 대기열 반복 모드',
			value: defaultmusicCommandScript.loopqueuedes,
			inline: false,
		})
		.addFields({
			name: '♾️ 자동 재생 모드',
			value: defaultmusicCommandScript.loopautodes,
			inline: false,
		})
		.setFooter(defaultMusicCommandScript.loopoffdes)
		.setColor(process.env.DEFAULT_COLOR);

	const selecbuttons = new MessageActionRow().addComponents(
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
			.setDisabled(true),
	);
	
	if(server.streamInfo.playInfo.loopmode == '반복 모드 꺼짐'){
		selecbuttons.components[0].disabled = false;
		selecbuttons.components[1].disabled = false;
		selecbuttons.components[2].disabled = false;
		selecbuttons.components[3].disabled = true;
	}else{
		if(server.streamInfo.playInfo.loopmode == '🔂 싱글 루프 모드'){
			selecbuttons.components[0].disabled = true;
			selecbuttons.components[1].disabled = false;
			selecbuttons.components[2].disabled = false;
			selecbuttons.components[3].disabled = false;
		}else if(server.streamInfo.playInfo.loopmode == '🔁 대기열 반복 모드'){
			selecbuttons.components[0].disabled = false;
			selecbuttons.components[1].disabled = true;
			selecbuttons.components[2].disabled = false;
			selecbuttons.components[3].disabled = false;
		}else if(server.streamInfo.playInfo.loopmode == '♾️ 자동 재생 모드'){
			selecbuttons.components[0].disabled = false;
			selecbuttons.components[1].disabled = false;
			selecbuttons.components[2].disabled = true;
			selecbuttons.components[3].disabled = false;
		}
	}
	
	await interaction.reply({embeds: [selectmodeEmbed], components: [selecbuttons]});
	
	const filter = i => i.user.id == interaction.member.id;
	const collector = interaction.channel.createMessageComponentCollector({filter, time: 300e3});

	collector.on('collect', async button => {
		switch(button.customId){
			case 'single':
				server.streamInfo.playInfo.loopmode = '🔂 싱글 루프 모드';
				break;

			case 'queue':
				server.streamInfo.playInfo.loopmode = '🔁 대기열 반복 모드';
				break;

			case 'autoplay':
				server.streamInfo.playInfo.loopmode = '♾️ 자동 재생 모드';
				break;

			case 'off':
				server.streamInfo.playInfo.loopmode = '반복 모드 꺼짐';
				break;
		}

		collector.stop();
		await interaction.deleteReply();
		server.streamInfo.playInfo.loopmode == '반복 모드 꺼짐' ?
			await interaction.channel.send({
				content: defaultMusicCommandScript.loopoffmsg
			}) :
			await interaction.channel.send({
				content: defaultMusicCommandScript.loopchmsg.interpolate({
					playmode: server.streamInfo.playInfo.loopmode
				})
			});
	});

	if(server.queue.length == 1 && server.streamInfo.playInfo.loopmode == '♾️ 자동 재생 모드'){
		//노래 자동추천 받아서 server.queue에 push
	}
}
