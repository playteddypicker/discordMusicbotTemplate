const { SlashCommandBuilder } = require('@discordjs/builders');
const { serverInfoList } = require('../../musicdata/structures/musicServerInfo.js');
const { MessageEmbed } = require('discord.js');
const { getTimestamp } = require('../../musicdata/structures/timestamp.js');
const ytReg = /^https:?\/\/(www.youtube.com|youtube.com|youtu.be)/;
const ytdl = require('ytdl-core');
const scdl = require('soundcloud-downloader').default;
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('history')
		.setDescription('↩️  최근에 틀었던 노래를 최대 5곡까지 보여줘요'),
	async execute(interaction){
		await interaction.deferReply();
		
		const server = serverInfoList.get(interaction.guild.id);

		if(server.previousqueue.length == 0) 
			return interaction.editReply('최근 재생한 노래가 없어요.\n/play 명령어로 노래를 먼저 틀어주세요.');

		const embed = new MessageEmbed()
			.setTitle('최근 재생 기록')
		for(let i = 0; i < server.previousqueue.length; i++){
			embed.addFields({
				name: `#${i+1}. ${server.previousqueue[i].title}`,
				value: `[${server.previousqueue[i].duration}] | ${server.previousqueue[i].url}\nrequested by ${server.previousqueue[i].request.name}`,
				inline: false
			});
		}

		await interaction.editReply({embeds: [embed]});
	}
}

