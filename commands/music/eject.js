const { SlashCommandBuilder } = require('@discordjs/builders');
const { serverInfoList } = require('../../musicdata/structures/musicServerInfo.js');
const { defaultMusicCommandScript } = require('../../script.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eject')
		.setDescription('⏏️ 음악 플레이어를 초기화하고 음성 채널을 나가요'),
	async execute(interaction){

		await interaction.deferReply();
		const server = serverInfoList.get(interaction.guild.id);

		if(!server.streamInfo.connection) 
			return interaction.editReply(defaultMusicCommandScript.nothingPlay)

		if(interaction.member.voice.channel){
			if(!interaction.member.voice.channel.members.find(m => m.user.id == process.env.CLIENT_ID)) return interaction.reply(defaultMusicCommandScript.existOtherVc);
		}else{
			return interaction.reply(defaultMusicCommandScript.firstJoinVc);
		}
				
		await server.eject();
		return interaction.editReply(defaultMusicCommandScript.ejectmsg);
	}
}
