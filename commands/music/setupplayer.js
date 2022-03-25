const { SlashCommandBuilder } = require('@discordjs/builders');
const { serverInfoList } = require('../../musicdata/structures/musicServerInfo.js');
const {
	serverData,
	serverPlayerData
} = require('../../musicdata/structures/schema.js');
const { syncPlayerChannel } = require('../../musicdata/functions/syncplayer.js');
const {
	MessageEmbed,
	MessageButton,
	MessageActionRow,
	Permissions,
} = require('discord.js');

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
							imageURL: ['../../imgs/playerbanner.jpg']
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
					.setCustomId('deleteplayer')
					.setLabel('플레이어 지우기')
					.setStyle('DANGER'),
				new MessageButton()
					.setCustomId('closewindow')
					.setLabel('닫기')
					.setStyle('DANGER')
					) 

			
		}
	}
}
