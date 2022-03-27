const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
require('dotenv').config();
const { reactionpages } = require('../../musicdata/structures/reactionpages.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fasthelp')
		.setDescription('❔ 봇 사용법을 간단하게 보여줘요'),
	async execute(interaction){
		await interaction.deferReply();

		const fastGuideEmbedPages = [
			new MessageEmbed()
				.setTitle("빠른 도움말 - 봇 기본 정보")
				.setColor(process.env.DEFAULT_COLOR)
				.addFields(
					{
						name: '제작자',
						value: 'Discord: TeddyPicker#0689' + '\n' + 
							'[Github 소스코드](https://github.com/playteddypicker/discordMusicbotTemplate)',
						inline: false,
					},
					{
						name: '기본 정보',
						value: '현재 이 봇을 쓰고 있는 서버 수: ' + `**${interaction.client.guilds.cache.size}**개`,
						inline: false,
					},
					{
						name: '개발자 디스코드 서버',
						value: '봇 개발 현황과 패치노트, 봇 테스트, 초대 링크 등 개발 관련 다양한 것을 볼 수 있습니다.' + '\n' +
							'https://discord.gg/NrXWKynJRB',
						inline: false,
					},
					{
						name: '후원',
						value: '자취생 개발자는 항상 돈에 쪼들려 삽니다.. ' + '\n' + 
							   '적은 돈이라도 서버 호스팅 비용에 쓸 수 있으니 많은 후원 부탁드립니다.' + '\n' +
							   '후원 링크 : https://toon.at/donate/playteddypicker',
						inline: false
					},
				),
			new MessageEmbed()
				.setTitle("빠른 가이드 - 1페이지: 봇 재생 1")
				.setColor(process.env.DEFAULT_COLOR)
				.addFields(
					{
						name: '봇으로 노래 듣기',
						value: '기본적으로 이 봇은 "빗금 명령어"를 사용합니다.' + '\n' + 
							   '/play 입력 후 Tab키를 누르면 노래 제목을 입력할 수 있습니다.',
						inline: false
					}				)
				.setImage(
					'https://media.discordapp.net/attachments/934297359209340939/957560790569877584/2022-03-27_17.44.38.png'
				),
			new MessageEmbed()
				.setTitle("빠른 가이드 - 2페이지: 플레이어 사용하기")
				.addFields(
					{
						name: '플레이어 채널 생성하기',
						value: '/setup 명령어로 플레이어 채널을 생성할 수 있습니다.' + '\n' +
							   '생성된 플레이어 채널에서는 명령어 없이 노래를 바로 추가할 수 있습니다.',
						inline: false
					}
				)
				.setImage(
					'https://media.discordapp.net/attachments/934297359209340939/957564341933182996/2022-03-27_17.58.44.png?width=786&height=1053'
				),
			new MessageEmbed()
				.setTitle("빠른 가이드 - 3페이지: 음악 명령어")
				.setColor(process.env.DEFAULT_COLOR)
				.addFields(
					{
						name: '음악 명령어 사용하기',
						value: '\n다른 봇과 마찬가지로 스킵, 정지 등 여러 기능을 쓸 수 있습니다.' + '\n' +
							   '\n플레이어 채널이 있다면 버튼으로 기능을 쓸 수 있습니다.',
						inline: false,
					}
				)
				.setImage(
					'https://media.discordapp.net/attachments/934297359209340939/957565770353754132/2022-03-27_18.04.28.png'
				),
			new MessageEmbed()
				.setTitle("빠른 가이드 끝")
				.setColor(process.env.DEFAULT_COLOR)
				.addFields(
					{
						name: '더 많은 정보',
						value: '이 봇의 최고 장점은 플레이어와 명령어가 모두 같이 작동하는 것입니다.' + '\n' +
							   '플레이어에서 재생해도, 명령어로 재생해도 전부 서버 하나에 추가됩니다.' + '\n' +
							   '이외에 아주 많은 명령어가 있으니 궁금하면 /help 명령어를 써주세요.',
						inline: false,
					}
				)
				.setImage(
					process.env.PLAYEREMBED_IMAGEURL
				),
		];

		await reactionpages(interaction, fastGuideEmbedPages, true);
	}
}
