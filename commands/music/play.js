const { SlashCommandBuilder } = require('@discordjs/builders');
const { serverInfoList } = require('../../musicdata/structures/musicServerInfo.js');
const { streamTrigger } = require('../../musicdata/functions/stream.js');
const { searchsongScript } = require('../../script.json');
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('음악 재생/노래 추가 명령어')
		.addStringOption(option =>
			option.setName('request')
				.setDescription('재생할 노래 제목이나 링크를 적어주세요')
				.setRequired(true))
		.addBooleanOption(option =>
			option.setName('playlistsearch')
				.setDescription('플레이리스트만 검색할건지 선택해요')
				.setRequired(false)),
	async execute(interaction){
		await interaction.deferReply();
		const server = serverInfoList.get(interaction.guild.id);
		//play 명령어는 어디에서든지 쓸수있게끔
		await streamTrigger(interaction, interaction.options.getString('request'), 'command');
	}
}
