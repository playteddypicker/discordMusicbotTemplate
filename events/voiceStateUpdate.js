const { VoiceConnectionStatus } = require('@discordjs/voice');

module.exports = {
	name: 'voiceStateUpdate',
	once: false,
	async execute(newState, oldState, client){
		if(!newState.channel) return;
		const curserver = require('../structures/musicPreference.js').musicserverList.get(newState.channel.guild.id);
		if(!curserver) return;
		const vmcount = newState.channel.members.filter(member => !member.user.bot).size;
		const bot = newState.channel.members.filter(member => member.user.bot);

		if(bot.size){
			const connection = curserver.connectionHandler.connection;
			if(vmcount == 0){
				if(connection){
					//disconnection handler
					connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
						try{
							await Promise.race([
								entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
								entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
							]);	
						}catch(error){
							connection.destroy();
							server.enterstop();
						}
					});
				}else{
					curserver.guild.me.voice.channel.disconnect();
				}
				curserver.queue.songs = [];
					curserver.queue.playinfo = {
						playmode: '반복 모드 꺼짐',
						volume: 0.3,
						curq: 0,
					};
					curserver.recentmsg = null;
					curserver.recentmessage = null;
				curserver.connectionHandler = {
					connection: null,
					audioPlayer: null,
					audioResource: null,
					connectionStatus: '⏹ 재생 중이 아님',
					paused: false,
				};
				if(curserver.playerInfo.isSetupped){
					await require('../musicdata/syncplayer.js').updatePlayerMsg(curserver, undefined);
				} 

			}
		}

	}
}
