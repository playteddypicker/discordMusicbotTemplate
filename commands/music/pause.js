const { SlashCommandBuilder } = require('@discordjs/builders');
const { serverInfoList } = require('../../musicdata/structures/musicServerInfo.js');
const { defaultMusicCommandScript } = require('../../script.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('⏸ 노래를 일시정지해요. 다시 입력하면 노래를 재개해요.'),
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
				
		await server.pause();
		await interaction.editReply(server.streamInfo.audioPlayer.state.status == 'paused' ?
			`${defaultMusicCommandScript.pausemsg}` :
			`${defaultMusicCommandScript.playmsg}`);

		return;
	}
}
