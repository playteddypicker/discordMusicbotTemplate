const { SlashCommandBuilder } = require('@discordjs/builders');
const { setupPlayerScript } = require('../../script.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('플레이어를 만들거나 삭제해요'),
	async execute(interaction){
		const server = require('../../structures/musicPreference.js').musicserverList.get(interaction.guild.id);
		await interaction.deferReply();

		if(!server.playerInfo.isSetupped){
			//플레이어 채널 만들고 sync
			const createdChannel = await interaction.guild.channels.create(`${process.env.PLAYERCHANNEL_NAME}`, {
				type: 'GUILD_TEXT',
			}); 
			
			server.playerInfo.isSetupped = true;
			await require('../../musicdata/syncplayer.js').syncChannel(createdChannel);
			//db에 추가(syncplayer에서 자동으로 됨)
			await interaction.editReply(`음악 플레이어 채널 생성됨: ${createdChannel}\n(플레이어 채널의 이름을 마음대로 바꾸지 마세요)`);
		}else{
			//채널 삭제
			const toDeleteChannel = await interaction.guild.channels.fetch(server.playerInfo.playerChannelId);
			if(toDeleteChannel.id == interaction.channel.id) return interaction.editReply(setupPlayerScript.deleteWarn);
			
			await toDeleteChannel.delete();
			await interaction.editReply(setupPlayerScript.deleted);
			server.playerInfo = {
				playerChannelId: '',
				playermsg: null,
				isSetupped: false,
			};


			//db에서 삭제 => 일단 킵
			/*
			const dbInfo = require('../../musicdata/syncplayer.js').guildPlayer;
			await dbInfo.deleteOne({guildId: interaction.guild.id}).catch(e => console.log(e));
			*/
		}
	}
}
