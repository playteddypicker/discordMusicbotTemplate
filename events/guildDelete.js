const { serverPlayerData, serverData } = require('../musicdata/structures/schema.js');
const { serverInfoList } = require('../musicdata/structures/musicServerInfo.js');
module.exports = {
	name: 'guildDelete',
	once: false,
	async execute(deletedGuild, client){
		//serverdata가 제대로 삭제 안되는 버그
		console.log(`${deletedGuild.name} removed bot.`);
		serverPlayerData.deleteMany({guildId: deletedGuild.id});
		serverData.deleteMany({guildId: deletedGuild.id});
		serverInfoList.delete(deletedGuild.id);
	}
}
