const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('도움말 보기'),
	async execute(interaction){
		interaction.reply({content: 'https://gall.dcinside.com/mgallery/board/view/?id=hypergryph&no=1094322&exception_mode=recommend&page=1 ㄱㄱ', ephemeral: true});
	}
}
