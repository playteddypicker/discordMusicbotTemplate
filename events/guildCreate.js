const musicserver = require('../structures/musicPreference.js');

module.exports = {
	name: 'guildCreate',
	once: false,
	async execute(guild, client){

		//musicserver에 추가
		const musicserverShard = new musicserver.serverMusicInfo(guild);
		musicserver.musicserverList.set(guild.id, musicserverShard);

		//나에게 dm하기
		const teddypicker = await client.users.fetch('653157614452211712');
		teddypicker.send(`봇이 **${guild.name}** 서버에 추가됨`);

	}
}

