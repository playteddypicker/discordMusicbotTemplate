const { SlashCommandBuilder } = require('@discordjs/builders');
const { serverInfoList } = require('../../musicdata/structures/musicServerInfo.js');
const { trigger } = require('../../musicdata/functions/stream.js');
const { searchsongScript } = require('../../script.json');
require('dotenv').config();

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
		const server = serverInfoList.get(interaction.guild.id);
		//play 명령어는 어디에서든지 쓸수있게끔
		await trigger(interaction, interaction.options.getString('request'), 'command');
		interaction.channel.id == server.playerInfo.playerChannelId ?
			await interaction.editReply({
				content: searchsongScript.enqueue.interpolate({
					locate: `${server.queue.length - 1}`
				}),
				embeds: [{
					color: Number('0x' + process.env.DEFAULT_COLOR),
					title: server.queue[server.queue.length-1].title,
					url: server.queue[server.queue.length-1].url,
					thumbnail: server.queue[server.queue.length-1].thumbnail,
					//author 관련 핸들링 필요.
				}]
			})

	}
}
