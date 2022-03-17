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

		if(!server.streamInfo.connection) return interaction.editReply('음성 채널에 연결되어있지 않습니다.\n/play 명령어를 사용해서 노래를 먼저 틀어주세요.');

		if(interaction.member.voice.channel){
			if(!interaction.member.voice.channel.members.find(m => m.user.id == process.env.CLIENT_ID)) return interaction.reply(defaultMusicCommandScript.existOtherVc);
		}else{
			return interaction.reply(defaultMusicCommandScript.firstJoinVc);
		}
				
		await server.eject();
		return interaction.editReply(defaultMusicCommandScript.ejectmsg);
	}
}
