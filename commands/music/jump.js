const { SlashCommandBuilder } = require('@discordjs/builders');
const { serverInfoList } = require('../../musicdata/structures/musicServerInfo.js');
const { defaultMusicCommandScript } = require('../../script.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jump')
		.setDescription('🛹 대기열의 특정 노래로 스킵해요')
		.addIntegerOption(option =>
			option
				.setName('goto')
				.setDescription('스킵할 대기열의 번호를 입력해주세요')
				.setRequired(true)),
	async execute(interaction){

		await interaction.deferReply();
		const server = serverInfoList.get(interaction.guild.id);

		if(server.queue.length == 0 || !server.streamInfo.connection || !server.streamInfo.audioResource)
			return interaction.editReply(defaultMusicCommandScript.nothingPlay);

		if(interaction.member.voice.channel){
			if(!interaction.member.voice.channel.members.find(m => m.user.id == process.env.CLIENT_ID)) return interaction.reply(defaultMusicCommandScript.existOtherVc);
		}else{
			return interaction.reply(defaultMusicCommandScript.firstJoinVc);
		}
		
		const goto = interaction.options.getInteger('goto');
		const jumpres = await server.jump(goto);
		jumpres ?
			await interaction.editReply(defaultMusicCommandScript.jumped.interpolate({
				goto: `${goto}`,
			})) :
			await interaction.editReply(defaultMusicCommandScript.jumpRangeWarn);	
		return;
	}
}
