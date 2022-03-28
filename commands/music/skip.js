const { SlashCommandBuilder } = require('@discordjs/builders');
const { serverInfoList } = require('../../musicdata/structures/musicServerInfo.js');
const { defaultMusicCommandScript } = require('../../script.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('⏭ 현재 재생 중인 노래를 스킵해요'),
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
				
		await server.skip();
		return interaction.editReply(defaultMusicCommandScript.skipmsg);

	}
}
