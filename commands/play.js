const { SlashCommandBuilder } = require('@discordjs/builders');
const stream = require('../musicdata/stream.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('음악 재생/노래 추가 명령어')
		.addStringOption(option => 
			option.setName('request')
				.setDescription('재생할 노래 제목이나 링크를 적어주세요')
				.setRequired(true)),
	async execute(interaction){
		const server = require('../structures/musicPreference.js').musicserverList.get(interaction.guild.id);
		server.queue.recentmsg = interaction;
		if(server.queue.recentmsg.member.voice.channel){
			stream.trigger(interaction.guild.id, interaction.options.getString('request'));
		}else{
			interaction.reply({content:"먼저 음성 채널에 들어와 주세요!", ephemeral: true});
		}
	}
}
