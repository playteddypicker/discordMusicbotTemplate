const {
	totalSongDuration,
	getTimestamp,
	timestamptoSecond
} = require('../structures/timestamp.js');
const { MessageEmbed } = require('discord.js');
const { syncplayerScript } = require('../../script.json');
const scurlReg = /^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/;

function getPlayerEmbed(server){

	let queuelist = '<여기에 대기 중인 노래 표시됨>';
	if(server.queue.length > 1){
		queuelist = '';
		for(let i = server.queue.length - 1; i > 0; i--){
			if(i > 19){
				i = 19;
				queuelist = `...이외에 ${Number(server.queue.length) - 20}곡 대기 중\n`;
			}
			queuelist += `#${i}.` + 
				'`' +`[${server.queue[i].duration}]` + '`' + 
				` **${server.queue[i].title}** ` + 
				'`' + `by ${server.queue[i].request.name}` + '`\n';
		}
	}

	return server.queue.length > 0 ?
		{
			content: queuelist,
			embeds: [
				new MessageEmbed({
					author: {
						name: `${server.queue[0].author.name}`,
						icon_url: `${server.queue[0].author.thumbnail}`,
						url: `${server.queue[0].author.channelURL}`,
					},
					title: server.queue[0].title,
					color: process.env.DEFAULT_COLOR,
					description: 
					`${server.playInfo.playStatus[server.playInfo.playStatusCode]} | ` + 
					`${server.playInfo.loopmode[server.playInfo.loopcode]} | 🔉 : ${Math.round(server.playInfo.volume * 100)}%` + '\n' +
					`⏳ 러닝타임: 현재 ${server.queue[0].duration} | 전체 ${getTimestamp(totalSongDuration(server.queue))}` + '\n' +
					`🎵 스트리밍 <#${server.streamInfo.connection.joinConfig.channelId}> | ` +
					`명령어 ${server.streamInfo.commandChannel != '0' ? server.streamInfo.commandChannel : server.streamInfo.currentCommandChannel}`,
					url: server.queue[0].url,
					image: {url: server.queue[0].thumbnail},
					footer:{
						text: `requested by ${server.queue[0].request.name} | ${scurlReg.test(server.queue[0].url) ? 'Soundcloud' : 'Youtube'}`,
						icon_url: server.queue[0].request.avatarURL,
					}
				})
			]
		} :
		{
			content: queuelist,
			embeds: [
				new MessageEmbed({
					title: syncplayerScript.emptyPlayerTitle,
					color: process.env.DEFAULT_COLOR,
					description: 
					`${syncplayerScript.emptyPlayerDescription}
					연결: ${server.streamInfo.connection && server.streamInfo.connection?.state.status != 'destroyed' ? 
							`<#${server.streamInfo.connection.joinConfig.channelId}>` : 
							'❌'}`,
					image: {
						url: server.playerInfo.playermsg.embed.imageURL.length == 1 ? 
							process.env.PLAYEREMBED_IMAGEURL : server.playerInfo.playermsg.embed.imageURL[1]
					},
				})
			]
		}
}

module.exports = {
	getPlayerEmbed
}

