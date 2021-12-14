const { SlashCommandBuilder } = require('./@discordjs.builders');
const {
	MessageEmbed,
	MessageActionRow,
	MessageButton,
} = require('discord.js');

const shangus = require('mongoose');
const welcomeChannelSchema = new shangus.Schema({
	channelId: String,
	guildId: String,
	welcomemsgs: [
		title: String,
		msg: String,
	],
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setwelcomechannel')
		.setDescription('이 서버에 새로운 멤버가 왔을 때의 환영 메시지를 설정해요'),
	async execute(interaction){
		let UIembed = new MessageEmbed().setTitle(`이 채널 ${interaction.channel}에 환영 메시지를 설정하실건가요?`);
		let UIbuttons = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId('yy')
				.setLabel('ㅇㅇ')
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId('nn')
				.setLabel('ㄴㄴ')
				.setStyle('SECONDARY')
		);

		const functionMessage = await interaction.reply({embeds: [UIembed], components: [UIbuttons]});	

		const awaitInteraction = () => functionMessage.awaitMessageComponent({
			filter: (i) => i.user.id === interaction.user.id,
			time: 300e3,
		}).then((i) => (i.isButton()) ? i : null).catch(() => null);

		const awaitMessage = (msg) => msg.channel.awaitMessages({
			filter: (m) => m.author.id === msg.interaction.user.id && !!m.content && m.content.length < 60,
			time: 300e3,
			max: 1,
			errors: ['time'],
		}).then((c) => c.first()).catch(() => null);
		
		const awaitMessageD = (msg) => msg.channel.awaitMessages({
			filter: (m) => m.author.id === msg.interaction.user.id && !!m.content && m.content.length < 200,
			time: 300e3,
			max: 1,
			errors: ['time'],
		}).then((c) => c.first()).catch(() => null);

		const hexcolorregexp = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
		const awaitMessageHexColor = (msg) => msg.channel.awaitMessages({
			filter: (m) => m.author.id === msg.interaction.user.id && !!m.content && hexcolorregexp.test(msg.content),
			time: 300e3,
			max: 1,
			errors: ['time'],
		}).then((c) => c.first()).catch(() => null);


		while(1){
			const button = await awaitInteraction();
			if(!button){
				interaction.deleteReply();
				break;
			}

			switch(button.customId){
				case 'yy':
					UIembed = new MessageEmbed()
						.setTitle('환영 메시지의 타이틀을 60자 이내로 설정해주세요')
						.setDescription('들어온 멤버를 표시하고싶으면 ${joinnedMember}\n이 서버를 나타내고싶으면 ${server}\n특정 채널을 나타내고 싶으시면 #<채널이름>으로 써 주세요\n\nex) ${joinedMember}님이 들어오셨어요!\n${server}에 오신걸 환영합니다. 채널 #공지 에서 공지를 꼭 읽어주세요.');
					button.components[0].disabled = true;
					button.components[1].disabled = true;

					const editMessageA = await interaction.reply({embeds: [UIembed], components: [UIbuttons]});
					const msgcollectorA = await awaitMessage(editMessageA);
					const titleMsg = msgcollectorA.content;
					
					UIembed = new MessageEmbed()
						.setTitle('환영 메시지의 설명을 200자 이내로 설정해주세요')
						.setDescription('들어온 멤버를 표시하고싶으면 ${joinnedMember}\n이 서버를 나타내고싶으면 ${server}\n특정 채널을 나타내고 싶으시면 #<채널이름>으로 써 주세요\n\nex) ${joinedMember}님이 들어오셨어요!\n${server}에 오신걸 환영합니다. 채널 #공지 에서 공지를 꼭 읽어주세요.');

					const editMessageB = await interaction.reply({embeds: [UIembed], components: [UIbuttons]});
					const msgcollectorB = await awaitMessageD(editMessageB);
					const descriptionMsg = msgcollectorB.content;

					UIembed = new MessageEmbed()
						.setTitle('환영 메시지 왼쪽에 표시될 색 코드를 설정해주세요')
						.setDescription('https://htmlcolorcodes.com 에서 색 코드를 따올수 있어요.\n#FF0523처럼 16진수로된 6자리 문자에요.');

					const editMessageC = await interaction.reply({embeds: [UIembed], components: [UIbuttons]});
					const msgcollectorC = await awaitMessageHexColor(editMessageC);
					const colorMsg = msgcollectorC.content;

					UIembed = new MessageEmbed()
						.setTitle('설정이 완료되었어요!')
						.setDescription('https://htmlcolorcodes.com 에서 색 코드를 따올수 있어요.\n#FF0523처럼 16진수로된 6자리 문자에요.');

					break;

				case 'nn':
					interaction.deleteReply();
					return;
			}

		}
		
	}
}
