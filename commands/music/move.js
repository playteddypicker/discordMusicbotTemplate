const { SlashCommandBuilder } = require('@discordjs/builders');
const { serverInfoList } = require('../../musicdata/structures/musicServerInfo.js');
const { defaultMusicCommandScript } = require('../../script.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('move')
		.setDescription('↪️ 대기열에 있는 특정 노래의 위치를 옮겨요')
		.addIntegerOption(option =>
			option
				.setName('mvrange1')
				.setDescription('옮길 노래를 선택해주세요')
				.setRequired(true))
		.addIntegerOption(option =>
			option
				.setName('mvrange2')
				.setDescription('옮길 위치를 선택해주세요')
				.setRequired(true)),
	async execute(interaction){

		await interaction.deferReply();
		const server = serverInfoList.get(interaction.guild.id);

		if(server.queue.length == 0 || !server.streamInfo.connection || !server.streamInfo.audioResource)
			return interaction.editReply('현재 노래를 재생하고있지 않습니다.\n/play 명령어를 사용해서 노래를 먼저 틀어주세요.');

		if(interaction.member.voice.channel){
			if(!interaction.member.voice.channel.members.find(m => m.user.id == process.env.CLIENT_ID)) return interaction.reply(defaultMusicCommandScript.existOtherVc);
		}else{
			return interaction.reply(defaultMusicCommandScript.firstJoinVc);
		}

		const moveres = await server.move(interaction.options.getInteger('mvrange1'), interaction.options.getInteger('mvrange2'));
			
		moveres == 'moveWarn1' ? interaction.editReply(defaultMusicCommandScript.moveWarn1)
			: moveres == 'moveWarn2' ? interaction.editReply(defaultMusicCommandScript.moveWarn2)
			: moveres == 'moveWarn3' ? interaction.editReply(defaultMusicCommandScript.moveWarn3)
			: moveres == 'moveWarn4' ? interaction.editReply(defaultMusicCommandScript.moveWarn4)
			: interaction.editReply({
				content: defaultMusicCommandScript.moved.interpolate({
					target: interaction.options.getInteger('mvrange1'),
					title: server.queue[interaction.options.getInteger('mvrange2')].title,
					locate: interaction.options.getInteger('mvrange2')	
				})
			});
		return;
	}
}
