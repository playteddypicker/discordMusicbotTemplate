const musiccommandFilterList = [
	'play', 'eject', 'jump', 'loop', 'move', 'pause',
	'remove', 'shuffle', 'stop', 'volume'
];

const serverInfoList = require('../musicdata/structures/musicServerInfo.js').serverInfoList;

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction, client){
		if(!interaction.isCommand()) return;
		const cmd = client.commands.get(interaction.commandName);
		if(!cmd) return;

		const server = serverInfoList.get(interaction.guild.id);

		if(musiccommandFilterList.find(el => el === cmd.data.name) && //or interaction.guild.id == server.playerInfo.channel.id
		   server.streamInfo.commandChannel != '0') 
			return await interaction.reply({
				content: `음악 명령어는 ${server.streamInfo.commandChannel}에서만 사용 가능합니다`,
				ephemeral: true
			});

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
