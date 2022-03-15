/* Default Song Info.

song = {
	title: title of the song.
	url: youtube/soundcloud url of the song.
	thumbnail: url of thumbnail ?? youtube/soundcloud default thumbnail.
	duration : duration of the song. format: 0:00:00
	author: {
		name: name of author.
		thumbnail: profile picture of author ?? youtube/soundcloud default profile picture.
		url : channel or user info url.
	},
//여기까지가 search.js에서 제공해주는 info.
//request는 interaction에서 정보 받아서 입력 후
	request: {
		name: name that who requested current song.
		id: member.id,
		tag: discord tag of requester.
		avatar: avatar url of requester.
	}

	//each guild의 queue에 stack으로 push.
}

*/
const { serverInfoList } = require('../structures/musicServerInfo.js');
const {
	getTimestamp,
	timestamptoSecond
} = require('../structures/timestamp.js');
const {
	ytplGetInfo,	
	yturlGetInfo,
	scsetGetInfo,
	scurlGetInfo,
	ytsearchGetInfo,
	ytplsearchGetinfo
} = require('./search.js');
const {
	MessageEmbed,
	Interaction,
} = require('discord.js');
const { searchsongScript } = require('../../script.json');

const ytplReg1 = /^https:?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/;
const ytplReg2 = /^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/;
const yturlReg = /^https?:\/\/(www.youtube.com|youtube.com|youtu.be)\/(.*)$/;
const scurlReg = /^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/;
const scsetReg = /^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)\/(sets)\/(.*)$/;


//pushqueue는 기본적으로 음악 정보 수집에 성공하면 MessageEmbed를 return함.
async function pushqueue(interaction, text){ 	
	const server = serverInfoList.get(interaction.guild.id);
	const filter = {
		durationLimit: server.streamInfo.searchFilter.durationLimit,
		banKeywords: server.streamInfo.searchFilter.banKeywords
	};

	let res = (ytplReg1.test(text) || ytplReg2.test(text)) ? await ytplGetInfo(text)
		: scsetReg.test(text) ? await scsetGetInfo(text)
		: yturlReg.test(text) ? await yturlGetInfo(text)
		: scurlReg.test(text) ? await scurlGetInfo(text)
		: 'search';

	if(res == 'search'){
		const playlistSearchOption = (interaction instanceof Interaction) ?
			interaction.options.getString('playlistsearch') :
			null;

		res = playlistSearchOption ?
			await ytplsearchGetInfo(text) :
			await ytsearchGetInfo(text, filter);
	}
		
	if(typeof(res) === 'string' || !res) return res ?? 'error'; 
	//error나면 string이 그대로 return됨.

	let resultMessage;

	if(res.info){ //pl-형식으로 result가 나왔을때.
		for(let song of res.items){
			song.request = {
				name: interaction.member.displayName,
				id: interaction.member.id,
				avatarURL: interaction.member.user.avatarURL(),
				tag: interaction.member.user.tag
			}
			server.queue.push(song);
		}

		const doneEmbed = new MessageEmbed()
			.setColor(process.env.DEFAULT_COLOR)
			.setTitle(res.info.name)
			.setURL(res.info.url)
			.setThumbnail(res.info.thumbnail)
			.setAuthor({
				name: res.info.author.name,
				url: res.info.author.channelURL,
				iconURL: res.info.author.thumbnail
			})
			.setFooter({
				text: `requested by ${interaction.member.displayname}`,
				iconURL: interaction.member.user.avatarURL()
			});

		resultMessage = {
			content: searchsongScript.addedfromPlaylist.interpolate({found : `${res.items.length}`}),
			embeds: [doneEmbed],
		}

		console.log(`${res.items.length} songs added to ${interaction.guild.id}@${interaction.guild.name}`);
	}else{ //single-url 형식으로 result가 나왔을때.
		res.request = {
			name: interaction.member.displayName,
			id: interaction.member.id,
			avatarURL: interaction.member.user.avatarURL(),
			tag: interaction.member.user.tag
		};

		server.queue.push(res);

		const doneEmbed = new MessageEmbed()
			.setColor(process.env.DEFAULT_COLOR)
			.setTitle(res.title)
			.setURL(res.url)
			.setThumbnail(res.thumbnail)
			.setAuthor({
				name: res.author.name,
				url: res.author.channelURL,
				iconURL: res.author.thumbnail
			})
			.setFooter({
				text: `requested by ${interaction.member.displayName}`,
				iconURL: interaction.member.user.avatarURL()
			});

		resultMessage = {
			content: searchsongScript.enqueue.interpolate({locate : `${server.queue.length-1}`}),
			embeds: [doneEmbed],
		}
	}

	return resultMessage;
}

module.exports = {
	pushqueue
}
