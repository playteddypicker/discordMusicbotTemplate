const { SlashCommandBuilder } = require('@discordjs/builders');
const { serverInfoList } = require('../../musicdata/structures/musicServerInfo.js');
const { defaultMusicCommandScript } = require('../../script.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('⏹ 현재 재생 중인 노래를 멈추고 음악 플레이어를 초기화해요'),
	async execute(interaction){

		await interaction.deferReply();
		const server = serverInfoList.get(interaction.guild.id);

		if(server.queue.length == 0 || !server.streamInfo.connection || !server.streamInfo.audioResource)
			return interaction.editReply(defaultMusicCommandScript.nothingPlay);

		if(interaction.member.voice.channel){
			if(!interaction.member.voice.channel.members.find(m => m.user.id == process.env.CLIENT_ID)) return interaction.editReply(defaultMusicCommandScript.existOtherVc);
		}else{
			return interaction.editReply(defaultMusicCommandScript.firstJoinVc);
		}
				
		await server.stop();
		return interaction.editReply(defaultMusicCommandScript.stopmsg);
	}
}
