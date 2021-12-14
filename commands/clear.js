const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('정해진 개수만큼 채팅 내역을 지워요')
		.addIntegerOption(option =>
			option
				.setName('howmany')
				.setDescription('지울 채팅의 개수를 입력해주세요. ')
				.setRequired(true)
		),
	async execute(interaction){
		if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply('이 명령어는 관리자 권한을 가진 사람만 쓸 수 있어요');

		await interaction.deferReply({ephemeral: true});
		let num = interaction.options.getInteger('howmany') > 0 ? interaction.options.getInteger('howmany') : 1;
		//이상한거 넣으면 1개로 함
		let sum = 0;
		const limitNum = parseInt(num / 100);
		for(let i = 0; i <= limitNum; i++){
			try{
				const messages = await interaction.channel.messages.fetch({limit: Number(num) > 100 ? 100 : Number(num)});
				await interaction.channel.bulkDelete(messages, true);
				sum += Number(messages.size);
				num -= 100;
			}catch(error){
				throw error;
			}
		}
		await interaction.editReply({content: `채팅 ${sum}개를 지웠어요`, ephemeral: true});
	}
}
