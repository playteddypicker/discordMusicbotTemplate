

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction, client){
		if(!interaction.isCommand()) return;
		const cmd = client.commands.get(interaction.commandName);
		if(!cmd) return;

		//channel handling
		
		try{
			await cmd.execute(interaction);
		}catch(error){
			console.log(`an error occured in ${interaction.guild.name}@${interaction.guild.id}\n`);
			console.log(error);
			console.log('\n');
			await interaction.reply({
				content: '명령어 처리하는데 오류가 발생했어요!',
				ephemeral: true
			}).catch(e => {
				throw e;
			});
		}
	}
}
