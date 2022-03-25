const { SlashCommandBuilder } = require('@discordjs/builders');
const { serverInfoList } = require('../../musicdata/structures/musicServerInfo.js');
const { defaultMusicCommandScript } = require('../../script.json');
const {
	serverData,
	serverPlayerData
} = require('../../musicdata/structures/schema.js');
const {
	MessageEmbed,
	MessageButton,
	MessageActionRow,
	Permissions,
} = require('discord.js');
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setting')
		.setDescription('⚙️ 이 서버의 음악봇 설정을 편집해요(관리자만 사용 가능)'),
	async execute(interaction){
		await interaction.deferReply();

		if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
			return interaction.editReply({
				content: '이 명령어는 관리자 권한을 가진 유저만 쓸 수 있습니다',
				ephemeral: true,
			});

		const server = serverInfoList.get(interaction.guild.id);
		let GetserverData = await serverData.findOne({guildId: interaction.guild.id});

		const preferenceButtons = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('editmaxduration')
					.setLabel('최대 노래 길이 설정')
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('editblockedkeywords')
					.setLabel('검색 차단 키워드 설정')
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('editcommandchannel')
					.setLabel('명령어 채널 설정')
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('closepreference')
					.setLabel('닫기')
					.setStyle('DANGER'),
			);

		let bankeywordString = '';
		if(server.streamInfo.searchFilter.banKeywords.length != 0){
			for(let i = 0; i < server.streamInfo.searchFilter.banKeywords.length; i++){
				bankeywordString += `${server.streamInfo.searchFilter.banKeywords[i]} `;
			}
		}else
			bankeywordString = '없음';

		let preferenceEmbed = new MessageEmbed()
			.setTitle('음악봇 설정')
			.setDescription('설정하고 싶은 것을 선택해주세요')
			.setColor(process.env.DEFAULT_COLOR)
			.addFields(
				{
					name: '현재 최대 노래 길이',
					value: server.streamInfo.searchFilter.durationLimit != 0 ? `${parseInt(server.streamInfo.searchFilter.durationLimit / 60)}분` : '제한 없음',
					inline: false
				},
				{
					name: '검색 차단 키워드',
					value: bankeywordString,
					inline: false
				},
				{
					name: '명령어 채널',
					value: server.streamInfo.commandChannel == '0' ? 
						'제한 없음' : 
						`${server.streamInfo.commandChannel}\n이 채널 이외에는 음악 명령어를 쓸 수 없어요.`,
					inline: false
				}

			);

		const functionsMessage = await interaction.editReply({
			embeds: [preferenceEmbed],
			components: [preferenceButtons]
		});

		const userfilter = i => {
			return i.ember.id === interaction.member.id;
		}

		const awaitInteraction = () => functionsMessage.awaitMessageComponent({
			filter: i => i.user.id === interaction.user.id,
			time: 300e3,
		}).then(i => (i.isButton()) ? i : null).catch(() => null);

		const awaitBanKeywordMessage = msg => msg.channel.awaitMessages({
			filter: m => m.author.id === msg.interaction.user.id && 
				!!m.content && 
				m.content.length < 10 &&
				!m.content.includes(" "),
			time: 300e3,
			max: 1,
			errors: ['time'],
		}).then(c => c.first()).catch(() => null);

		const awaitCommandChannelMessage = msg => msg.channel.awaitMessages({
			filter: m => m.author.id === msg.interaction.user.id &&
				!!m.content &&
				(/^<#[0-9]*>$/.test(m.content) || m.content == '0000'),
			time: 300e3,
			max: 1,
			errors: ['time']
		}).then(c => c.first()).catch(() => null);

		const awaitMessageInteger = (msg, range) => msg.channel.awaitMessages({
			filter: m => m.author.id === msg.interaction.user.id &&
				!!m.content &&
				Number.isInteger(Number(m.content)) &&
				Number(m.content) <= range &&
				Number(m.content) >= 0,
			time: 300e3,
			max: 1,
			erros: ['time']
		}).then(c => c.first()).catch(() => null);

		while(1){
			let button = await awaitInteraction(); //button event 기다리기
			if(!button){ //buttonEvent가 expired됐을떄
				interaction.deleteReply();
				return; //종료
			}

			await button.deferUpdate();

			//버튼 클릭되면 클릭 비활성화
			preferenceButtons.components[0].disabled = true;
			preferenceButtons.components[1].disabled = true;
			preferenceButtons.components[2].disabled = true;
			preferenceButtons.components[3].disabled = true;

			//얘네는 serverInfo에만 저장하기
			switch(button.customId){
				case 'editmaxduration':
					preferenceEmbed.setTitle('검색할 때 영상 길이를 최대 몇 분으로 할건지 적어주세요');
					const editMessageA = await interaction.editReply({
						embeds: [preferenceEmbed],
						components: [preferenceButtons]
					});
					const msgcollectorA = await awaitMessageInteger(editMessageA, 180);
					//serverinfo에 저장
					server.streamInfo.searchFilter.durationLimit = Number(msgcollectorA.content) * 60;
					msgcollectorA.delete();
					break;

				case 'editblockedkeywords':
					preferenceEmbed
						.setTitle('추가/삭제할 차단 키워드를 입력해주세요')
						.setDescription(`새로운 단어를 입력하면 추가, 이미 저장된 단어를 입력하면 삭제할 수 있어요
										추가할 단어는 공백 없이 최대 10글자까지 추가 가능해요`);

					const editMessageB = await interaction.editReply({
						embeds: [preferenceEmbed],
						components: [preferenceButtons]
					});
					const msgcollectorB = await awaitBanKeywordMessage(editMessageB);
					msgcollectorB.delete();

					//비어있으면 그냥 push
					if(server.streamInfo.searchFilter.banKeywords.length == 0){
						server.streamInfo.searchFilter.banKeywords.push(msgcollectorB.content.toLowerCase());
						break;
					}

					//같은거 있는지 탐색, serverInfo에 저장
					for(let i = 0; i < server.streamInfo.searchFilter.banKeywords.length; i++){
						//lowercase로만 저장
						if(server.streamInfo.searchFilter.banKeywords[i] == msgcollectorB.content.toLowerCase()){
							server.streamInfo.searchFilter.banKeywords.splice(i, 1);
							break;
						}

						//탐색 다 돌았는데도 없으면 push
						if(i == server.streamInfo.searchFilter.banKeywords.length - 1 && 
						server.streamInfo.searchFilter.banKeywords[i] != msgcollectorB.content.toLowerCase()){
							server.streamInfo.searchFilter.banKeywords.push(msgcollectorB.content.toLowerCase());
							//혹시 모르니 break;
							break;
						}
					}
					break;

				case 'editcommandchannel':
					preferenceEmbed
						.setTitle('명령어를 쓰게 할 채널을 선택해주세요.')
						.setDescription(`설정하고 나면 봇 사용자들은 그 채널 말고는 음악 명령어를 쓸 수 없어요.\n
										채팅창에 #를 입력하면 선택할 수 있는 채널이 떠요. 그 중 하나를 선택해주세요.
										0000이라 입력하면 아무 채널에서나 명령어를 쓸 수 있게 할 수 있어요.`);

					const editMessageC = await interaction.editReply({
						embeds: [preferenceEmbed],
						components: [preferenceButtons]
					});
					const msgcollectorC = await awaitCommandChannelMessage(editMessageC);
					msgcollectorC.delete();

					msgcollectorC.content.includes('0000') ? 
						server.streamInfo.commandChannel = '0' :
						server.streamInfo.commandChannel = msgcollectorC.content; //<#1238912631213>형태 그대로 저장
					break;

				case 'closepreference':
					interaction.deleteReply();
					return;
					break;
			}

			//DB에 저장하기
			if(!GetserverData){
				GetserverData = new serverData({
					guildId: interaction.guild.id,
					commandChannel: server.streamInfo.commandChannel,
					searchFilter: {
						durationLimit: server.streamInfo.searchFilter.durationLimit,
						banKeywords: server.streamInfo.searchFilter.banKeywords
					}
				});
			}else{
				GetserverData.commandChannel = server.streamInfo.commandChannel;
				GetserverData.searchFilter.durationLimit = server.streamInfo.searchFilter.durationLimit;
				GetserverData.searchFilter.banKeywords = server.streamInfo.searchFilter.banKeywords;
			}
			await GetserverData.save();

			//durationLimit, banKeywords, commandChannel 설정하기
			if(server.streamInfo.searchFilter.banKeywords.length != 0){
				bankeywordString = '';
				for(let i = 0; i < server.streamInfo.searchFilter.banKeywords.length; i++){
					bankeywordString += `${server.streamInfo.searchFilter.banKeywords[i]} `;
				}
			}else
				bankeywordString = '없음';

			//편집한걸로 임베드 설정하기
			preferenceEmbed = new MessageEmbed()
				.setTitle('설정하고 싶은 것을 선택해주세요')
				.setDescription('✅ 저장 완료')
				.setColor(process.env.DEFAULT_COLOR)
				.addFields(
					{
						name: '현재 최대 노래 길이',
						value: (server.streamInfo.searchFilter.durationLimit != 0) ? 
							`${parseInt(server.streamInfo.searchFilter.durationLimit / 60)}분` : '제한 없음',
						inline: false
					},
					{
						name: '검색 차단 키워드',
						value: bankeywordString,
						inline: false
					},
					{
						name: '명령어 채널',
						value: server.streamInfo.commandChannel == '0' ? 
							'제한 없음' : 
							`${server.streamInfo.commandChannel}\n이 채널 이외에는 음악 명령어를 쓸 수 없어요.`,
						inline: false
					}
				);
					
			//작업 끝나면 버튼 활성화
			preferenceButtons.components[0].disabled = false;
			preferenceButtons.components[1].disabled = false;
			preferenceButtons.components[2].disabled = false;
			preferenceButtons.components[3].disabled = false;

			//편집된 임베드로 띄우기
			await interaction.editReply({
				embeds: [preferenceEmbed],
				components: [preferenceButtons]
			});

		} //다시 버튼이벤트 기다리기

	}
}
