const { serverPlayerData } = require('../musicdata/structures/schema.js');
const { serverInfoList } = require('../musicdata/structures/musicServerInfo.js');
require('dotenv').config();
module.exports = {
	name: 'channelDelete',
	once: false,
	async execute(channel, client){
		try{
			const GetserverPlayerData = await serverPlayerData.findOne({guildId: channel.guild.id});
			if(!GetserverPlayerData || GetserverPlayerData.channelId != channel.id) return;

			await console.log(`${channel.guild.id}@${channel.guild.name} force-deleted player channel.`);
			await console.log('Deleting playerchannel Infos at DB..');
			await serverPlayerData.deleteMany({guildId: channel.guild.id});
			await console.log('Deleted playerchannel Infos successfully.');
			await console.log('Deleted playerchannel Infos at LocalData..');
			serverInfoList.get(channel.guild.id).playerInfo = {
				setupped: false,
				channelId: '',
				channelName: '',
				playermsg: {
					banner: {
						id: '',
						messageContent: 'default',
						message: null,
						imageURL: ['./imgs/playerbanner.jpg'],
					},
					embed: {
						id: '',
						messageContent: 'default',
						message: null,
						imageURL: [`${process.env.PLAYEREMBED_IMAGEURL}`],
					}
				}
			};
			await console.log('Deleted.');
			
		}catch(e){
			console.log('failed to delete.');
			console.log(e);
		}
	}
}
