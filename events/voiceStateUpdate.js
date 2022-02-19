const { 
	VoiceConnectionStatus,
	getVoiceConnection
} = require('@discordjs/voice');

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

					connection.destroy();
					curserver.enterstop();
					
				}else{ //모종의 이유로 connection이 undefined로 되어있을 때
					getVoiceConnection(curserver.id)?.destroy();
					curserver.enterstop();
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
				//final connection error handler
				getVoiceConnection(newState.channel.guild.id)?.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
					try{
						await Promise.race([
							entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
							entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
						]);	
					}catch(error){
						connection.destroy();
						curserver.enterstop();
					}
				});		
				if(curserver.playerInfo.isSetupped){
					await require('../musicdata/syncplayer.js').updatePlayerMsg(curserver, undefined);
				} 

			}
		}

	}
}
