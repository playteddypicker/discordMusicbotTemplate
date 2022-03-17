const { SlashCommandBuilder } = require('@discordjs/builders');
const { serverInfoList } = require('../../musicdata/structures/musicServerInfo.js');
const { defaultMusicCommandScript } = require('../../script.json');
const {
	MessageEmbed,
	MessageButton,
	MessageActionRow
} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('🔁 반복 모드를 설정해요'),
	async execute(interaction){

		await interaction.deferReply();
		const server = serverInfoList.get(interaction.guild.id);

		if(server.queue.length == 0 || !server.streamInfo.connection || !server.streamInfo.audioResource)
			return interaction.editReply('현재 노래를 재생하고있지 않습니다.\n/play 명령어를 사용해서 노래를 먼저 틀어주세요.');

		if(interaction.member.voice.channel){
			if(!interaction.member.voice.channel.members.find(m => m.user.id == process.env.CLIENT_ID)) return interaction.reply(defaultMusicCommandScript.existOtherVc);
		}else{
			return interaction.reply(defaultMusicCommandScript.firstJoinVc);
		}
				
		if(interaction.channel.id == server.playerInfo.playerChannelId) 
			return interaction.channel.send(defaultMusicCommandScript.loopwarn);
		await loopMessage(interaction, server);

		return;
	}
}

async function loopMessage(interaction, server){
	const selectmodeEmbed = new MessageEmbed()
		.setTitle('반복 모드를 선택해주세요')
		.setDescription(`현재 **${server.streamInfo.playInfo.loopmode}**`)
		.addFields({
			name: '🔂 싱글 루프 모드',
			value: defaultMusicCommandScript.loopsingledes,
			inline: false,
		})
		.addFields({
			name: '🔁 대기열 반복 모드',
			value: defaultMusicCommandScript.loopqueuedes,
			inline: false,
		})
		.addFields({
			name: '♾️ 자동 재생 모드',
			value: defaultMusicCommandScript.loopautodes,
			inline: false,
		})
		.setFooter({text: defaultMusicCommandScript.loopoffdes})
		.setColor(process.env.DEFAULT_COLOR);

	const selecbuttons = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId('single')
			.setEmoji('🔂')
			.setStyle('SECONDARY'),
		new MessageButton()
			.setCustomId('queue')
			.setEmoji('🔁')
			.setStyle('SECONDARY'),
		new MessageButton()
			.setCustomId('autoplay')
			.setEmoji('♾️')
			.setStyle('SECONDARY'),
		new MessageButton()
			.setCustomId('off')
			.setLabel('끄기')
			.setStyle('SECONDARY')
			.setDisabled(true),
	);
	
	if(server.streamInfo.playInfo.loopmode == '반복 모드 꺼짐'){
		selecbuttons.components[0].disabled = false;
		selecbuttons.components[1].disabled = false;
		selecbuttons.components[2].disabled = false;
		selecbuttons.components[3].disabled = true;
	}else{
		if(server.streamInfo.playInfo.loopmode == '🔂 싱글 루프 모드'){
			selecbuttons.components[0].disabled = true;
			selecbuttons.components[1].disabled = false;
			selecbuttons.components[2].disabled = false;
			selecbuttons.components[3].disabled = false;
		}else if(server.streamInfo.playInfo.loopmode == '🔁 대기열 반복 모드'){
			selecbuttons.components[0].disabled = false;
			selecbuttons.components[1].disabled = true;
			selecbuttons.components[2].disabled = false;
			selecbuttons.components[3].disabled = false;
		}else if(server.streamInfo.playInfo.loopmode == '♾️ 자동 재생 모드'){
			selecbuttons.components[0].disabled = false;
			selecbuttons.components[1].disabled = false;
			selecbuttons.components[2].disabled = true;
			selecbuttons.components[3].disabled = false;
		}
	}
	
	await interaction.editReply({embeds: [selectmodeEmbed], components: [selecbuttons]});
	
	const filter = i => i.user.id == interaction.member.id;
	const collector = interaction.channel.createMessageComponentCollector({filter, time: 300e3});

	collector.on('collect', async button => {
		switch(button.customId){
			case 'single':
				server.streamInfo.playInfo.loopmode = '🔂 싱글 루프 모드';
				break;

			case 'queue':
				server.streamInfo.playInfo.loopmode = '🔁 대기열 반복 모드';
				break;

			case 'autoplay':
				server.streamInfo.playInfo.loopmode = '♾️ 자동 재생 모드';
				break;

			case 'off':
				server.streamInfo.playInfo.loopmode = '반복 모드 꺼짐';
				break;
		}

		collector.stop();
		await interaction.deleteReply();
		server.streamInfo.playInfo.loopmode == '반복 모드 꺼짐' ?
			await interaction.channel.send({
				content: defaultMusicCommandScript.loopoffmsg
			}) :
			await interaction.channel.send({
				content: defaultMusicCommandScript.loopchmsg.interpolate({
					playmode: server.streamInfo.playInfo.loopmode
				})
			});
		if(server.queue.length == 1 && server.streamInfo.playInfo.loopmode == '♾️ 자동 재생 모드'){
			console.log('auto');
			require('../../musicdata/functions/stream.js').autosearchPush(interaction, server);
		}
	});

}
