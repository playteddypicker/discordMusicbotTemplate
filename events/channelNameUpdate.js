const { serverPlayerData } = require('../musicdata/structures/schema.js');

module.exports = {
	name: 'channelUpdate',
	once: false,
	async execute(oldChannel, newChannel, client){
		const GetserverPlayerData = await serverPlayerData.findOne({guildId: oldChannel.guild.id});
		if(!GetserverPlayerData || GetserverPlayerData.channelId != oldChannel.id || oldChannel.name == newChannel.name) return;

		console.log(`guild ${oldChannel.guild.id}@${oldChannel.guild.name} changed playerchannel name : `);
		console.log(`${GetserverPlayerData.channelName} => ${newChannel.name}`);
		GetserverPlayerData.channelName = newChannel.name;
		await GetserverPlayerData.save();
	}
}
