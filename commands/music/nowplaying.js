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
		.setName('np')
		.setDescription('ℹ️ 현재 재생 중인 노래의 정보를 보여줘요'),
	async execute(interaction){
		await interaction.deferReply();
		
		const server = serverInfoList.get(interaction.guild.id);
		
		if(server.queue.length == 0 || !server.streamInfo.connection || !server.streamInfo.audioResource)
			return interaction.editReply('현재 노래를 재생하고있지 않습니다.\n/play 명령어를 사용해서 노래를 먼저 틀어주세요.');
		
		const curtime = getTimestamp(parseInt(server.streamInfo.audioResource.playbackDuration / 1000));
		const queue = server.queue;
		const author = queue[0].author;
		if(!author.thumbnail){
			try{
				if(ytReg.test(queue[0].url)){
						const info = await ytdl.getInfo(queue[0].url);
						author.thumbnail = info.videoDetails.author.thumbnails[0].url;	
				}else{
					const info = await scdl.getSetInfo(text);
					author.thumbnail = res.user.avatar_url 
						?? 'https://cdn-icons-png.flaticon.com/512/51/51992.png';
				}
			}catch(error){
				console.log(error);
				author.thumbnail = interaction.client.user.avatarURL();
			}
		}

		const npEmbed = new MessageEmbed()
			.setColor(process.env.DEFAULT_COLOR)
			.setAuthor({
				name: `${author.name}`,
				url: `${author.channelURL}`, 
				iconURL: `${author.thumbnail}`
			})
			.setTitle(`${queue[0].title}`)
			.setURL(`${queue[0].url}`)
			.setDescription(
				`${server.playInfo.playStatus[server.playInfo.playStatusCode]} | ${server.playInfo.loopmode[server.playInfo.loopcode]} | ` + 
				`🔉: ${Math.round(server.playInfo.volume * 100)}% | [${curtime} / ${queue[0].duration}]` + `\n` +
				`스트리밍 <#${server.streamInfo.connection.joinConfig.channelId}> | 명령어${server.streamInfo.currentCommandChannel}`)
			.setFooter({
				text:`requested by ${queue[0].request.name} | ${ytReg.test(queue[0].url) ? 'Youtube' : 'Soundcloud'}`,
				iconURL: `${queue[0].request.avatarURL}`
			})
			.setThumbnail(`${queue[0].thumbnail}`)

		if(queue.length > 1) npEmbed.addFields({
			name: '다음 곡',
			value: `${queue[1].title}`,
			inline: false
		});

		return interaction.editReply({embeds: [npEmbed]});
	}
}
