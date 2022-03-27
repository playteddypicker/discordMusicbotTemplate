const {
	VoiceConnectionStatus,
	getVoiceConnection
} = require('@discordjs/voice');
const { serverInfoList } = require('../musicdata/structures/musicServerInfo.js');
const { getPlayerEmbed } = require('../musicdata/functions/updateplayer.js');

module.exports = {
	name: 'voiceStateUpdate',
	once: false,
	async execute(oldState, newState, client){
		if(!oldState.channelId || newState.channelId) return; //채널을 나가는게 아니면 거름
		if(!oldState.channel.members.filter(m => m.user.id == client.user.id)) 
			return; //봇이 없으면 거름
		const memberCount = oldState.channel.members.filter(m => !m.user.bot).size;
		if(memberCount != 0) return; //사람 나갔는데 봇만 남은게 아니면 거름
		
		const server = serverInfoList.get(oldState.guild.id);
		const connection = server.streamInfo.connection;

		//음성채팅에 연결되어있고
		if(server.streamInfo.connection?.state.status != 'destroyed'){
			//노래가 틀어져있으면
			if(server.playInfo.playStatusCode == 1) {
				//일시정지 후 메시지
				server.streamInfo.audioPlayer.pause(true);
				server.playInfo.playStatusCode = 3;

				server.playerInfo.setupped ? 
					await server.playerInfo.playermsg.banner.message.channel.send(
						"모든 유저가 퇴장하여 일시정지 했습니다.") :
					await server.recentChannel.send(
						"모든 유저가 퇴장하여 일시정지 했습니다.");
			}
				server.playerInfo.setupped ? 
					await server.playerInfo.playermsg.banner.message.channel.send(
						"3분 뒤 아무런 활동이 없으면 퇴장합니다.") :
					await server.recentChannel.send(
						"3분 뒤 아무런 활동이 없으면 퇴장합니다.");
			
			let i = 0;
			//인터벌로 5초마다 유저가 들어왔는지 검사해서
			//한번 돌때마다 i 증가, 정해진 i값에 도달했는데도 유저가 들어온게 안걸렸으면
			//인터벌 끝내고 플레이어 초기화 및 음성채팅 퇴장
			const checker = setInterval(async () => {
				if(oldState.channel.members.filter(m => !m.user.bot).size){
					if(server.streamInfo.audioPlayer?.unpause()){
						server.playInfo.playStatusCode = 1;
						server.playerInfo.setupped ? 
							await server.playerInfo.playermsg.banner.message.channel.send(
								"노래를 다시 재생했습니다.") :
							await server.recentChannel.send(
								"노래를 다시 재생했습니다.");
					}else{
						server.playInfo.playStatusCode = 0;
					}
					server.playerInfo.playermsg.embed.message?.edit({
						content: getPlayerEmbed(server).content,
						embeds: getPlayerEmbed(server).embeds
					})
					await clearInterval(checker);
					return;
				}

				i++;
				
				if(i == 4){ //i == n에서 5n초 후 정지.
					await server.stop();
					server.streamInfo.audioPlayer = null;
					try{
						await server.streamInfo.connection.destroy();
					}catch(error){
						throw error;
					}

					server.playerInfo.setupped ? 
						await server.playerInfo.playermsg.banner.message.channel.send(
							"아무런 활동이 없어 퇴장했습니다.") :
						await server.recentChannel.send(
							"아무런 활동이 없어 퇴장했습니다.");
					await server.playerInfo.playermsg.embed.message?.edit({
						content: getPlayerEmbed(server).content,
						embeds: getPlayerEmbed(server).embeds
					})
					await clearInterval(checker);
					return;
				}
			}, 5e3);
				
		} 
	}
}
