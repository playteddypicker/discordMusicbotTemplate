const musicserverList = require('../structures/musicPreference.js').musicserverList;
const { 
	MessageEmbed,
} = require('discord.js');
const { searchsongScript } = require('../script.json');

async function pushqueue(interaction, text){ //push만 함
	const server = musicserverList.get(interaction.guild.id);
	const info = await require('./searchbase.js').searchandReturn(text);
	let result = require('./searchbase.js').organizeInfo(info, interaction.member);

	let resultMsg = {};

	if(typeof(result) === 'string') return result; //에러나면 스트링이 리턴됨

	if(result.length > 1){ //플레이리스트 검색이 무사히 끝났으면
		for(let i = 1; i < result.length; i++){ //0번 인덱스는 항상 플레이리스트 정보
			if(!result[i]) continue;
			await server.queue.songs.push(result[i]);
		}

		const doneEmbed = new MessageEmbed()
			.setColor(process.env.DEFAULT_COLOR)
			.setTitle(result[0].name)
			.setURL(result[0].url)
			.setThumbnail(result[0].thumbnail)
			.setFooter(`requested by ${interaction.member.displayName}`, `${interaction.member.user.avatarURL()}`)
			.setAuthor(result[0].author.name, result[0].author.thumbnail, result[0].author.channelURL);

		resultMsg = {
			content: searchsongScript.addedfromPlaylist.interpolate({ found : `${result.length-1}` }),
			embeds: [doneEmbed],
		};
		console.log(`playlist successfully added to\n${interaction.guild.id}@${interaction.guild.name} \nby ${interaction.member.user.tag}.`);
	}else{ //플레이리스트가 아닌 검색결과
		result = result[0];
		if(!result) return 'emptyError';
		server.queue.songs.push(result);

		const doneEmbed = new MessageEmbed()
			.setColor(process.env.DEFAULT_COLOR)
			.setTitle(result.title)
			.setURL(result.url)
			.setThumbnail(result.thumbnail)
			.setFooter(`requested by ${result.request.name}`, result.request.avatarURL);
		if(result.author) doneEmbed.setAuthor(result.author.name, result.author.thumbnail, result.author.channelURL);

		resultMsg = {
			content: searchsongScript.enqueue.interpolate({ locate: `${server.queue.songs.length-1}` }),
			embeds: [doneEmbed],
		};
		if(server.queue.songs.length == 1) resultMsg.content = `재생 시작!`; 
	}
	return resultMsg;
}

module.exports = {
	pushqueue
};
