const { SlashCommandBuilder } = require('@discordjs/builders');
const { serverInfoList } = require('../../musicdata/structures/musicServerInfo.js');
const { defaultMusicCommandScript } = require('../../script.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('π λκΈ°μ΄μ λΈλλ₯Ό μμ΄μ'),
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
				
		await interaction.editReply(server.shuffle() ? 
			defaultMusicCommandScript.shufmsg :
			defaultMusicCommandScript.shuferr);

		return;
	}
}
