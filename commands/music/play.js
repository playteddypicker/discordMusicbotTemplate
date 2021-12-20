const { SlashCommandBuilder } = require('@discordjs/builders');
const stream = require('../../musicdata/stream.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('음악 재생/노래 추가 명령어')
		.addStringOption(option => 
			option.setName('request')
				.setDescription('재생할 노래 제목이나 링크를 적어주세요')
				.setRequired(true)),
	async execute(interaction){
		await interaction.deferReply();
		stream.trigger(interaction, interaction.options.getString('request'), 'command');
	}
}
