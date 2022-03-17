const { SlashCommandBuilder } = require('@discordjs/builders');
const { serverInfoList } = require('../../musicdata/structures/musicServerInfo.js');
const { defaultMusicCommandScript } = require('../../script.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('🔀 대기열의 노래를 섞어요'),
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
				
		await interaction.editReply(server.shuffle() ? 
			defaultMusicCommandScript.shufmsg :
			defaultMusicCommandScript.shuferr);

		return;
	}
}
