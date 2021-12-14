const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('대신말해줘')
		.setDescription('슨상이가 대신 말해줄게요')
		.addStringOption(option => 
			option
				.setName('tellmewhat')
				.setDescription('대사를 적어주세요')
				.setRequired(true)),
	async execute(interaction){
		const text = interaction.options.getString('tellmewhat');
		interaction.reply({content: text});
	}
}
