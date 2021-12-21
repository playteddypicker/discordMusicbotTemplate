const { SlashCommandBuilder } = require('@discordjs/builders');
const musicserverList = require('../../structures/musicPreference.js').musicserverList;
const { 
	MessageEmbed,
	MessageActionRow,
	MessageButton
} = require('discord.js');
const { defaultmusicCommandScript } = require('../../script.json');

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
						.setDescription('볼륨을 얼마로 설정할건지 써 주세요')
						.setRequired(true)
				))
		.addSubcommand(subcmd =>
			subcmd
				.setName('jump')
				.setDescription('🛹 대기열의 특정 노래로 스킵해요')
				.addIntegerOption(option =>
					option
						.setName('goto')
						.setDescription('어디로 스킵할지 써 주세요')
						.setRequired(true)
				))
		.addSubcommand(subcmd =>
			subcmd
				.setName('remove')
				.setDescription('🗑️ 대기열의 노래를 하나만 지우거나 한꺼번에 지워요')
				.addIntegerOption(option =>
					option
						.setName('target')
						.setDescription('어떤 노래를 지울지 써 주세요')
						.setRequired(true)
				)
				.addIntegerOption(option =>
					option
						.setName('toend')
						.setDescription('어디까지 지울지 써 주세요')
						.setRequired(false)
				))
		.addSubcommand(subcmd =>
			subcmd
				.setName('move')
				.setDescription('↪️ 대기열에 있는 특정 노래의 위치를 옮겨요')
				.addIntegerOption(option =>
					option
						.setName('target')
						.setDescription('옮길 노래를 선택해주세요')
						.setRequired(true)
				)
				.addIntegerOption(option =>
					option
						.setName('towhere')
						.setDescription('옮길 위치를 선택해주세요')
						.setRequired(true)
				)),
		async execute(interaction){
		const server = musicserverList.get(interaction.guild.id);
		const queue = server.queue;
		const curq = queue.playinfo.curq;

		if(queue.songs.length == 0) return interaction.reply(defaultmusicCommandScript.nothingPlay);

		//np나 queue는 음성채널 안드가있어도 가능, 나머지는 음성채널 들어가있어야하고 거기에 아리스가 있어야함
		if(interaction.options.getSubcommand() != 'np' && interaction.options.getSubcommand() != 'q'){
			if(interaction.member.voice.channel){ //멤버가 음성채널에 있으면
				//거기에 그 채널에 봇이 들어가있지 않으면
				if(!interaction.member.voice.channel.members.find( (mem) => mem.user.id == process.env.CLIENT_ID)){
					return interaction.reply(defaultmusicCommandScript.existOtherVc);
				}
			}else{ //멤버가 음성채널에 없으면
				return interaction.reply(defaultmusicCommandScript.firstJoinVc);
			}
		}
		
		await interaction.deferReply();

		switch (interaction.options.getSubcommand()){

			case 'np':
				server.nowplaying(interaction);
				break;
				
			case 'q':
				server.viewqueue(interaction);
				break;

			case 'pause':
				server.queue.channel = interaction.channel;//나중에 sql db로 서버별 봇 명령어 지정채널로 가게끔 바꾸기
				await server.pause(interaction);
				break;

			case 'skip':
				server.queue.channel = interaction.channel;//나중에 sql db로 서버별 봇 명령어 지정채널로 가게끔 바꾸기
				await server.skip(interaction);
				break;

			case 'stop':
				server.queue.recentmsg = interaction;//나중에 sql db로 서버별 봇 명령어 지정채널로 가게끔 바꾸기
				server.queue.channel = interaction.channel;//나중에 sql db로 서버별 봇 명령어 지정채널로 가게끔 바꾸기
				await server.stop(interaction);
				break;

			case 'eject':
				server.queue.channel = interaction.channel;//나중에 sql db로 서버별 봇 명령어 지정채널로 가게끔 바꾸기
				await server.eject(interaction);
				break;

			case 'shuffle':
				await server.shuffle(interaction);
				break;

			case 'loop':
				await server.loop(interaction);
				break;

			case 'volume':
				const size = interaction.options.getInteger('volume');
				await server.volume(interaction, size);
				break;

			case 'jump':
				server.queue.recentmsg = interaction;//나중에 sql db로 서버별 봇 명령어 지정채널로 가게끔 바꾸기

				const goto = interaction.options.getInteger('goto');
				await server.jump(interaction, goto);
				break;

			case 'remove':
				const target1 = interaction.options.getInteger('target');
				const endpoint =  interaction.options.getInteger('toend');
				await server.removequeue(interaction, target1, endpoint);
				break;

			case 'move':
				const target = interaction.options.getInteger('target');
				const locate = interaction.options.getInteger('towhere');
				await server.move(interaction, target, locate);
				break;
					
		}

		if(server.playerInfo.isSetupped) require('../../musicdata/syncplayer.js').updatePlayerMsg(server);
	}
}


