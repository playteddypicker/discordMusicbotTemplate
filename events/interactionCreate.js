const serverList = require('../structures/musicPreference.js').musicserverList;

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction, client){
		if(!interaction.isCommand()) return;
		const cmd = client.commands.get(interaction.commandName);
		if(!cmd) return;

		//playerChannel handling
		const server = serverList.get(interaction.guild.id);
		if(!server) return;
		if(interaction.channel.id == server.playerInfo.playerChannelId){
			if(interaction.options._subcommand){
				if(interaction.options.getSubcommand() == 'volume'
				|| interaction.options.getSubcommand() == 'jump'
				|| interaction.options.getSubcommand() == 'remove'
				|| interaction.options.getSubcommand() == 'move'){
				
				}else{
					return interaction.reply({content: `${interaction.user}, 플레이어 채널에서는 지정 명령어 이외에는 쓸 수 없습니다`, ephemeral: true});
				}
			}else{
				return interaction.reply({content: `${interaction.user}, 플레이어 채널에서는 지정 명령어 이외에는 쓸 수 없습니다`, ephemeral: true});
			}
		}

		try{
			await cmd.execute(interaction);
		}catch (error){
			console.log(`an error occured in ${interaction.guild.name}@${interaction.guild.id}\n`);
			console.log(error);
			console.log(`\n`);
			await interaction.reply({ content: '명령어 처리하는데 오류가 발생했어요!', ephmeral: true }).catch(e => {
				interaction.editReply({ content: '명령어 처리하는데 오류가 발생했어요!' })
			});
		}
	},
};
