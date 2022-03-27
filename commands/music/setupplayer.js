const { SlashCommandBuilder } = require('@discordjs/builders');
const { serverInfoList } = require('../../musicdata/structures/musicServerInfo.js');
const {
	serverData,
	serverPlayerData
} = require('../../musicdata/structures/schema.js');
const { 
	syncPlayerChannel,
	defaultBannerMessage,
	defaultButtonComponents } = require('../../musicdata/functions/syncplayer.js');
const { getPlayerEmbed } = require('../../musicdata/functions/updateplayer.js');
const {
	MessageEmbed,
	MessageButton,
	MessageActionRow,
	Permissions,
} = require('discord.js');
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('⚙️ 이 서버의 음악 플레이어를 설정해요(관리자만 사용 가능)'),
	async execute(interaction){
		await interaction.deferReply();

		if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
			return interaction.editReply({
				content: '이 명령어는 관리자 권한을 가진 유저만 쓸 수 있습니다',
				ephemeral: true,
			});
		
		const server = serverInfoList.get(interaction.guild.id);

		if(interaction.channel.id == server.playerInfo.channelId)
			return interaction.editReply({
				content: '이 명령어는 플레이어 채널이 아닌 곳에서 쓸 수 있습니다',
				ephemral: true,
			});
		
		let GetserverData = await serverPlayerData.findOne({guildId: interaction.guild.id});

		//플레이어 채널 만들고 DB등록후 Return
		if(!GetserverData){
			try{
				const createdChannel = await interaction.guild.channels.create(
					`${process.env.PLAYERCHANNEL_NAME}`,
					{
						type: 'GUILD_TEXT'
					}
				);

				server.playerInfo.setupped = true;
				server.playerInfo.channelId = createdChannel.id;
				await syncPlayerChannel(interaction.guild.id);

				//DB등록
				GetserverData = new serverPlayerData({
					guildId: interaction.guild.id,
					channelId : createdChannel.id,
					channelName : process.env.PLAYERCHANNEL_NAME,
					playermsg: {
						banner: {
							messageContent: 'default',
							imageURL: ['./imgs/playerbanner.jpg']
						},
						embed: {
							messageContent: 'default',
							imageURL: [`${process.env.PLAYEREMBED_IMAGEURL}`]
						}
					}
				});
				await GetserverData.save();

				await interaction.editReply(`플레이어 채널 <#${createdChannel.id}>가 생성되었습니다.` 
					+ '\n' + '/setup을 다시 쳐서 커스텀 설정을 할 수도 있습니다.');

			}catch(e){
				await interaction.editReply("플레이어 채널을 생성하는데 오류가 발생했습니다.");
				console.log(`player-generate error at ${interaction.guild.id}@${interaction.guild.name}`);
				console.log(e);
				return;
			}
		}else{
			const preferenceButtons = new MessageActionRow().addComponents(
				new MessageButton()
					.setCustomId('editplayermessage')
					.setLabel('플레이어 텍스트 설정')
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('editplayerbanner')
					.setLabel('플레이어 배너 설정')
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('editplayerembedimage')
					.setLabel('플레이어 대기 이미지 설정')
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('closewindow')
					.setLabel('닫기')
					.setStyle('DANGER')
					);

			let manuelEmbed = new MessageEmbed()
				.setTitle('설정하고 싶은 것을 선택해주세요')
				.setDescription(
						'**플레이어 텍스트 설정**' + '\n' +
						'배너 위에 표시될 텍스트를 설정합니다.' + '\n\n' +
						'**플레이어 배너 설정**' + '\n' +
						'배너 이미지를 설정합니다.' + '\n\n' +
						'**플레이어 대기 이미지 설정**' + '\n' +
						'노래 재생 중이 아닐 때 플레이어에 표시할 사진을 설정합니다.' + '\n\n'
				)
				.setColor(process.env.DEFAULT_COLOR)

			const functionsMessage = await interaction.editReply({
				embeds: [manuelEmbed],
				components: [preferenceButtons]
			});

			const userfilter = i => {
				return i.ember.id === interaction.member.id;
			};

			const awaitInteraction = () => functionsMessage.awaitMessageComponent({
				filter: i => i.user.id === interaction.user.id,
				time: 300e3,
			}).then(i => (i.isButton()) ? i : null).catch(() => null);
		
			const awaitBannerTextMessage = msg => msg.channel.awaitMessages({
				filter: m => m.author.id === msg.interaction.user.id && 
					!!m.content && 
					m.content.length < 500,
				time: 300e3,
				max: 1,
				errors: ['time'],
			}).then(c => c.first()).catch(() => null);

			const awaitImageMessage = msg => msg.channel.awaitMessages({
				filter: m => m.author.id === msg.interaction.user.id &&
					(m.content == 'default' || m.attachments.size > 0)
				,
				time: 300e3,
				max: 1,
				errors:[ 'time' ],
			}).then(c => c.first()).catch(() => null);

			while(1){
				let button = await awaitInteraction();
				if(!button){ //buttonEvent가 expired됐을떄
					interaction.deleteReply();
					return; //종료
				}

				await button.deferUpdate();

				preferenceButtons.components[0].disabled = true;
				preferenceButtons.components[1].disabled = true;
				preferenceButtons.components[2].disabled = true;
				preferenceButtons.components[3].disabled = true;

				switch(button.customId){
					case 'editplayermessage':
						manuelEmbed.setTitle("배너 위에 나올 텍스트를 500자 이내로 입력해주세요." )
							.setDescription("줄은 쉬프트+엔터로 띄울 수 있습니다.\n\n기본값으로 설정하려면 default라고 입력해주세요.");
						
						const editMessageA = await interaction.editReply({
							embeds: [manuelEmbed],
							components: [preferenceButtons]
						});

						const msgcollectorA = await awaitBannerTextMessage(editMessageA);

						await server.playerInfo.playermsg.banner.message.edit({
							content: msgcollectorA.content == 'default' ? 
								defaultBannerMessage : msgcollectorA.content,
							files: [server.playerInfo.playermsg.banner.imageURL[0]]
						});
						msgcollectorA.delete();

						server.playerInfo.playermsg.banner.messageContent = msgcollectorA.content;
						//DB에 업로드
						GetserverData.playermsg.banner.messageContent = msgcollectorA.content;
						GetserverData.save();
						break;

					case 'editplayerbanner':
						manuelEmbed.setTitle("배너 이미지를 업로드해주세요.")
							.setDescription("용량이 너무 큰 파일은 시간이 오래 걸릴 수 있습니다.\n\n기본 이미지로 설정하려면 default라고 입력해주세요.");
						
						const editMessageB = await interaction.editReply({
							embeds: [manuelEmbed],
							components: [preferenceButtons]
						});

						const msgcollectorB = await awaitImageMessage(editMessageB);

						if(msgcollectorB.attachments.size > 0) 
							server.playerInfo.playermsg.banner.imageURL[1] = Array.from(msgcollectorB.attachments.values())[0].url;
						server.playerInfo.playermsg.banner.message.edit({
							content: server.playerInfo.playermsg.banner.messageContent == 'default' ? 
								defaultBannerMessage : server.playerInfo.playermsg.banner.messageContent,
							files: [msgcollectorB.content == 'default' ? 
								server.playerInfo.playermsg.banner.imageURL[0] : server.playerInfo.playermsg.banner.imageURL[1]]
						});

						if(msgcollectorB.content == 'default' && server.playerInfo.playermsg.banner.imageURL.length == 2) 
							server.playerInfo.playermsg.banner.imageURL.pop();
						msgcollectorB.delete();

						//DB저장
						GetserverData.playermsg.banner.imageURL = server.playerInfo.playermsg.banner.imageURL;
						GetserverData.save();
						break;

					case 'editplayerembedimage':
						manuelEmbed.setTitle("플레이어 이미지를 업로드해주세요.")
							.setDescription("용량이 너무 큰 파일은 시간이 오래 걸릴 수 있습니다.\n\n기본 이미지로 설정하려면 default라고 입력해주세요.");
						
						const editMessageC = await interaction.editReply({
							embeds: [manuelEmbed],
							components: [preferenceButtons]
						});


						const msgcollectorC = await awaitImageMessage(editMessageC);

						if(msgcollectorC.attachments.size > 0) 
							server.playerInfo.playermsg.embed.imageURL[1] = Array.from(msgcollectorC.attachments.values())[0].url;

						server.playerInfo.playermsg.embed.message.edit({
							content: getPlayerEmbed(server).content,
							embeds: getPlayerEmbed(server).embeds,
							components: defaultButtonComponents
						});

						if(msgcollectorC.content == 'default' && server.playerInfo.playermsg.embed.imageURL.length == 2)
							server.playerInfo.playermsg.embed.imageURL.pop();

						msgcollectorC.delete();

						//DB저장
						GetserverData.playermsg.embed.imageURL = server.playerInfo.playermsg.embed.imageURL;
						GetserverData.save();
						break;

					case 'closewindow':
						interaction.deleteReply();
						return;
						break;
				}

				manuelEmbed = new MessageEmbed()
					.setTitle('설정하고 싶은 것을 선택해주세요')
					.setDescription(
						'✅ 저장 완료' + '\n\n' + 
						'**플레이어 텍스트 설정**' + '\n' +
						'배너 위에 표시될 텍스트를 설정합니다.' + '\n\n' +
						'**플레이어 배너 설정**' + '\n' +
						'배너 이미지를 설정합니다.' + '\n\n' +
						'**플레이어 대기 이미지 설정**' + '\n' +
						'노래 재생 중이 아닐 때 플레이어에 표시할 사진을 설정합니다.' + '\n\n'
					)
					.setColor(process.env.DEFAULT_COLOR);

				preferenceButtons.components[0].disabled = false;
				preferenceButtons.components[1].disabled = false;
				preferenceButtons.components[2].disabled = false;
				preferenceButtons.components[3].disabled = false;

				await interaction.editReply({
					embeds: [manuelEmbed],
					components: [preferenceButtons]
				});

			}//while문 끝
		}
	}
}
