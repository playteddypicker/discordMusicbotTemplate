//developed by teddypicker
//pre-settings
require('dotenv').config();
/*
 * dotenv list
 * 
 * DISCORD_TOKEN = 'some token'
 * CLIENT_ID = 'client id'
 * DEVGUILD_ID = 'devguild id'
 * DBPASSWORD = asdf
 * ANNOUNCE = '대충 상메'
 * PLAYERCHANNEL_NAME = '대충 기본 플레이어채널 이름'
 * PLAYEREMBED_IMAGEURL = '플레이어 대기 이미지 주소'
 * DEFAULT_COLOR = '봇별 기본 컬러'
 *
 */
const fs = require('fs');
const musicserver = require('./structures/musicPreference.js');
const util = require('util');
const shangus = require('mongoose');

process.on("unhandledRejection", (reason, p) => {
	console.log(`error: ${(reason)?.stack ?? util.inspect(reason)}`)
});

//discord.js presettings
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const Discord = require('discord.js');
const Intents = Discord.Intents;
const client = new Discord.Client({ 
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
	] 
});
String.prototype.interpolate = function(params) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${this}\`;`)(...vals);
}

//commands handler
client.commands = new Discord.Collection();
const musicCommandFiles = fs.readdirSync('./commands/music').filter(file => file.endsWith('.js'));
const otherCommandFiles = fs.readdirSync('./commands/others').filter(file => file.endsWith('.js'));
const DevCommandFiles = fs.readdirSync('./commands/Dev').filter(file => file.endsWith('.js'));
const commands = [];
const DevCommands = [];
//음악 커맨드 푸시
for(let file of musicCommandFiles){
	const cmd = require(`./commands/music/${file}`);
	commands.push(cmd.data.toJSON());
	DevCommands.push(cmd.data.toJSON());
	client.commands.set(cmd.data.name, cmd);
}

//기타 커맨드(아무말 등등... => .gitignore에 추가)
for(let file of otherCommandFiles){
	const cmd = require(`./commands/others/${file}`);
	commands.push(cmd.data.toJSON());
	DevCommands.push(cmd.data.toJSON());
	client.commands.set(cmd.data.name, cmd);
}

//devServer Special Commands
for(let file of DevCommandFiles){
	const cmd = require(`./commands/Dev/${file}`);
	DevCommands.push(cmd.data.toJSON());
	client.commands.set(cmd.data.name, cmd);
}



//events handler
client.events = new Discord.Collection();
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for(let file of eventFiles){
	const event = require(`./events/${file}`);
	if(event.once){
		client.once(event.name, (...args) => event.execute(...args, client));
	}else{
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

const wait = require('util').promisify(setTimeout);
const rest = new REST({
		version: "9"
	}).setToken(process.env.DISCORD_TOKEN);
const announce = process.env.ANNOUNCE;

//DB Handling section
client.on('guildCreate', async (guild) => {
	console.log(`slash commands are loading at ${guild.name}...`);
	try{
		await rest.put(
		Routes.applicationGuildCommands(process.env.CLIENT_ID, guild.id),
		{body: commands}
		);	
		console.log(`slash commands are loaded.`);
	}catch(error){
		console.log(`slash commands failed to load.`);
		console.log(error);
	}
});

client.on('guildDelete', async guild => {
	console.log(`${guild.name} removed bot.`);
	const guildPlayer = require('./musicdata/syncplayer.js').guildPlayer;
	try{
		await guildPlayer.deleteMany({guildId: guild.id});	
		console.log(`DB Removing Succeed at ${guild.name}`);
	}catch(error){
		console.log(`DB Removing Failed at ${guild.name}, ${guild.id}`);
	}
});

client.on('channelDelete', async channel => {
	if(channel.name === process.env.PLAYERCHANNEL_NAME){
		console.log(`${channel.guild.name} force-deleted player channel. removing infos..`);
		musicserver.musicserverList.get(channel.guild.id).playerInfo = {
			playerChannelId: '',
			playermsg: null,
			isSetupped: false,
		}
		console.log('removed');
	}else{
		return;
	}
});

//Releasing Version
client.once('ready', async () => {
	await console.log(`${client.user.tag} Logged in successfully`);
	await client.user.setActivity(`부팅 시작..`, {type: 'PLAYING'});
	await console.log(`DevGuild Loading...`);
	try{
		const testguild = client.guilds.cache.find(g => g.id === '841337761431814165');
		const guild = ['841337761431814165', testguild];
		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, guild[1].id),
			{body: DevCommands}
		);
		const musicserverShard = new musicserver.serverMusicInfo(guild[1]);
		await musicserver.musicserverList.set(guild[0], musicserverShard);
			await console.log(`| Syncing player channel...`);
			let channel = await guild[1].channels.cache.find(
				(ch) => ch.type === "GUILD_TEXT" && !!guild[1].client.user && ch.name == `${process.env.PLAYERCHANNEL_NAME}`
			);
				
			if(!channel){ //플레이어 이름이 슨상플레이어가 아닌거 로딩
				const guildPlayer = require('./musicdata/syncplayer.js').guildPlayer;
				const syncPlayer = await guildPlayer.findOne({guildId: guild[0]}); //DB에 플레이어 정보가 있으면 
				if(syncPlayer){
					const Getserver = await musicserver.musicserverList.get(guild[0]);
					Getserver.playerInfo.playerChannelId = syncPlayer.channelId;
					Getserver.playerInfo.isSetupped = true;
					channel = await guild[1].channels.cache.find(ch => ch.id == syncPlayer.channelId);
					Getserver.playerInfo.playermsg = channel.messages.cache.find(m => m.id == syncPlayer.playermsgId);
					//console.log(pch);
				}else{
					await console.log(`DevGuild Loaded(player doesnt exist)`);
				}
			}else{
				await require('./musicdata/syncplayer.js').syncChannel(channel); //간격을 주자
				await console.log(`DevGuild Loaded.`);	
			}
		}catch(error){
			await console.log('DevGuild Loading Failed.');
			await console.log(error)
		}	

	await console.log(`${client.guilds.cache.size} guilds found.`);
	await console.log(`syncing informations to each guilds...`);
	for(let guild of client.guilds.cache){
		if(guild[0] == '841337761431814165') continue;
		//const testguild = client.guilds.cache.find(g => g.id === '841337761431814165');
	//{ const guild = ['841337761431814165', testguild];
		//Slash Commands Loading
		await client.user.setActivity(`${client.guilds.cache.size}개 서버 로딩`, {type: 'PLAYING'});
		try{
			await wait(500);
			await console.log(`┌---${guild[0]}@${guild[1].name} Loading Started----`);
			await console.log('| Refresing slash commands...')
			await rest.put(
				Routes.applicationGuildCommands(process.env.CLIENT_ID, guild[1].id),
					{body: commands}
				);
			await console.log('| Successfully refreshed.');
		}catch (error){
				await console.log(`| Refresh failed.`);
				await console.log(error);
		}

		//musicserver init section
		const musicserverShard = new musicserver.serverMusicInfo(guild[1]);
		await musicserver.musicserverList.set(guild[0], musicserverShard);
		await console.log(`| musicserver info Loaded.`);
		//player-sync section
		try{
			await console.log(`| Syncing player channel...`);
			let channel = await guild[1].channels.cache.find(
				(ch) => ch.type === "GUILD_TEXT" && !!guild[1].client.user && ch.name == `${process.env.PLAYERCHANNEL_NAME}`
			);
				
			if(!channel){ //플레이어 이름이 슨상플레이어가 아닌거 로딩
				const guildPlayer = require('./musicdata/syncplayer.js').guildPlayer;
				const syncPlayer = await guildPlayer.findOne({guildId: guild[0]}); //DB에 플레이어 정보가 있으면 
				if(syncPlayer){
					const Getserver = await musicserver.musicserverList.get(guild[0]);
					Getserver.playerInfo.playerChannelId = syncPlayer.channelId;
					Getserver.playerInfo.isSetupped = true;
					channel = await guild[1].channels.cache.find(ch => ch.id == syncPlayer.channelId);
					Getserver.playerInfo.playermsg = channel.messages.cache.find(m => m.id == syncPlayer.playermsgId);
					//console.log(pch);
				}else{
					await console.log(`└---- ${guild[1].name} successfully synced(player doesnt exist) ----\n`);
					continue;
				}
			}else{
				await require('./musicdata/syncplayer.js').syncChannel(channel); //간격을 주자
				await console.log(`| syncing done.`);	
			}
		}catch(error){
			await console.log('| sync failed.');
			await console.log(error)
		}	
		await console.log(`└---- ${guild[1].name} successfully loaded. ----\n`);
	}
	await client.user.setActivity(`${announce}`, {type: 'PLAYING'});

	setInterval(async () => {
		const voiceGuilds = [];
		console.log(`Memory usage : ${Number(process.memoryUsage().rss) / 1024 / 1024}MB`);
		for(let voiceGuild of client.voice.adapters){
			const voiceGuildInfo = await client.guilds.fetch(voiceGuild[0]);
			voiceGuilds.push(`${voiceGuild[0]}@${voiceGuildInfo.name}`);
		}
		await console.log('Now Streaming :');
		await console.log(voiceGuilds);
	}, 300e3);

});

shangus.connect(`mongodb+srv://neoxenesis:${process.env.DBPASSWORD}@snowsantbottestcl.havf9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`);
client.login(process.env.DISCORD_TOKEN);
