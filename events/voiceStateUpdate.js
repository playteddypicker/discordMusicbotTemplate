const { 
	VoiceConnectionStatus,
	getVoiceConnection
} = require('@discordjs/voice');
const { serverInfoList } = require('../musicdata/structures/musicServerInfo.js');
const { getPlayerEmbed } = require('../musicdata/functions/updateplayer.js');
const { playerLeftScript } = require('../script.json');

module.exports = {
	name: 'voiceStateUpdate',
	once: false,
	async execute(oldState, newState, client){
		if(!oldState.channelId || newState.channelId) return;
		if(!oldState.channel.members.filter(m => m.user.id == client.user.id))
			return;
		const memberCount = oldState.channel.members.filter(m => !m.user.bot).size;
		if(memberCount != 0 ) return;
		if(getVoiceConnection(oldState.guild.id)?.joinConfig.channelId != oldState.channelId)
			return;

		const server = serverInfoList.get(oldState.guild.id);
		const connection = server.streamInfo.connection;
		if(connection?.state.status == 'destroyed')
			return;
		
		await connection?.destroy();
		server.enterstop();
		server.streamInfo.audioPlayer = null;

		server.playerInfo.setupped ? 
			await server.playerInfo.playermsg.banner.message.channel.send(
				playerLeftScript.left) :
			await server.recentChannel?.send(
				playerLeftScript.left);

		await server.playerInfo.playermsg.embed.message?.edit({
			content: getPlayerEmbed(server).content,
			embeds: getPlayerEmbed(server).embeds
		})

	}
}
