const { SlashCommandBuilder } = require('@discordjs/builders');
const {
	MessageEmbed,
	MessageActionRow,
	MessageButton,
} = require('discord.js');

const ytsr = require('ytsr');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('유튜브에서 검색해요')
		.addStringOption(option =>
			option
				.setName('keyword')
				.setDescription('검색어를 입력해주세요')
				.setRequired(true)),
	async execute(interaction){
		interaction.deferReply();

		const keyword = interaction.options.getString('keyword');
		const firstRes = await ytsr(keyword);
		const resultAry = [];
		
		for(let item of firstRes.items){

			if(!item.isLive && (item.type == 'video' || item.type == 'playlist')){
				if(item.type == 'video'){

					const songInfo = {
						type: 'video',
						title: item.title,
						url: item.url,
						authorName: item.author.name ?? 'Youtube',
						thumbnail: `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
						duration: item.duration,
					}

					resultAry.push(songInfo);

				}else if(item.type == 'playlist'){

					const playlistInfo = {
						type: 'playlist',
						title: item.title,
						url: item.url,
						authorName: item.owner.name ?? 'Youtube',
						itemSize: item.length,
						thumbnail: item.firstVideo.bestThumbnail.url,
					}

					resultAry.push(playlistInfo);
				}
				if(resultAry.length > 99) break;
			}
		}
		if(resultAry.length == 0) return interaction.editReply('검색 결과가 없어요.');
		
		let resultEmbed = new MessageEmbed()
			.setTitle(`검색 결과 : ${resultAry.length}개`)
			.setColor('#03045E');
		let resultEmbedPages = [];

		for(let i = 0; i < resultAry.length; i++){
			let title = `#${i+1}. ${resultAry[i].title}`;
			if(resultAry[i].type == 'video'){
				resultEmbed.addFields({
					name: title, value: `타입: 비디오\n[${resultAry[i].duration}] ${resultAry[i].url}\nby ${resultAry[i].authorName}`, inline: false
				});
			}else if(resultAry[i].type == 'playlist'){
				resultEmbed.addFields({
					name: title, value: `타입: 플레이리스트\n[총 ${resultAry[i].itemSize}개] ${resultAry[i].url}\nby ${resultAry[i].authorName}`, inline: false
				})
			}

			if((i+1)%5 == 0){
				resultEmbedPages.push(resultEmbed);
				resultEmbed = new MessageEmbed()
					.setTitle(`검색 결과 : ${resultAry.length}개`)
					.setColor('#03045E');
			}
		}	
			
		if(resultAry.length % 5 != 0) resultEmbedPages.push(resultEmbed);

		await require('../structures/reactionpages.js').reactionpages(interaction, resultEmbedPages, true);
	}
}
