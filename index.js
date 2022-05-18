//developed by teddypicker
process.chdir(__dirname);
//0-1. pre-settings

require('dotenv').config();
const fs = require('fs');
const util = require('util');
const mongoose = require('mongoose');

process.on('unhandledRejection', (reason, p) => {
	console.log(`UnhandledRejectionError : ${(reason)?.stack ?? util.inspect(reason)}`);
});

String.prototype.interpolate = function (params){
	const names = Object.keys(params);
	const vals = Object.values(params);
	return new Function(...names, `return \`${this}\`;`)(...vals);
}

/*
 * dotenv list
 *
 * DISCORD_TOKEN = "token of this bot"
 * CLIENT_ID = "client id of this bot"
 * DEVGUILD_ID = "devguild id"
 * DBPASSWORD = "database access password of this bot"
 * ANNOUNCE = "default status message of this bot"
 * PLAYERCHANNEL_NAME = "default player channel name of this bot"
 * PLAYERCHANNEL_IMAGEURL = "default player image of this bot"
 * DEFAULT_COLOR = "default hex color of this bot"
 * YOUTUBE_COOKIE = "youtube cookie of this bot"
 */

//0-2. discord.js pre-settings
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const Discord = require('discord.js');
const {
	serverInfoList,
	serverInfo,
	musicFunctions
} = require('./musicdata/structures/musicServerInfo.js');
const {
	serverData,
	serverPlayerData
} = require('./musicdata/structures/schema.js');
const {
	syncPlayerChannel
} = require('./musicdata/functions/syncplayer.js');
const Intents = Discord.Intents;
const client = new Discord.Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
	],
	makeCache: Discord.Options.cacheWithLimits({
		MessageManager: {
			sweepInterval: 60,
			maxSize: 10,
		},
		ThreadManager: 0,
		GuildInviteManager: 0,
		GulidBanManager: 0,
		StageInstanceManager: 0,
		ThreadMemberManager: 0,
		GuildStickerManager: 0,
		ReactionUserManager: 0,
	}),
	partials: ["CHANNEL"]
});

//1. commands pre-settings
client.commands = new Discord.Collection();

const musicCommandFiles = fs.readdirSync('./commands/music').filter(f => f.endsWith('.js'));
const otherCommandFiles = fs.readdirSync('./commands/others').filter(f => f.endsWith('.js'));
const devCommandFiles = fs.readdirSync('./commands/dev').filter(f => f.endsWith('js'));
const commands = [];
const devCommands = [];

//1-1. pushing music commands
for(let file of musicCommandFiles){
	const cmd = require(`./commands/music/${file}`);
	commands.push(cmd.data.toJSON());
	devCommands.push(cmd.data.toJSON());
	client.commands.set(cmd.data.name, cmd);
}

//1-2. pushing other commands
for(let file of otherCommandFiles){
	const cmd = require(`./commands/others/${file}`);
	commands.push(cmd.data.toJSON());
	devCommands.push(cmd.data.toJSON());
	client.commands.set(cmd.data.name, cmd);
}

//1-3. pushing dev commands
for(let file of devCommandFiles){
	const cmd = require(`./commands/dev/${file}`);
	devCommands.push(cmd.data.toJSON());
	client.commands.set(cmd.data.name, cmd);
}


//2. event handler
client.events = new Discord.Collection();
const eventFiles = fs.readdirSync('./events').filter(f => f.endsWith('.js'));

for(let file of eventFiles){
	const event = require(`./events/${file}`);
	event.once ?
		client.once(event.name, (...args) => event.execute(...args, client)) :
		client.on(event.name, (...args) => event.execute(...args, client));
}

//3. database-handling
//3-1. if bot added to guild.
client.on('guildCreate', async (guild) => {
	try{
		//load slash commands
		console.log(`Bot added to guild ${guild.name}@${guild.id}`);
		console.log(`Slash Commands are loading...`);
		try{
			loadGuild(guild);
			console.log(`Slash Commands are successfully loaded.`);
		}catch(e){
			console.log(`Slash Commands are failed to load. Reason :`);
			console.log(e);
		}

		//load music info and dm to developer
	}catch(error){

	}
});

//3-2. bot removed from guild.
client.on('guildDelete', async (guild) => {
	console.log(`${guild.name}@${guild.id} removed bot.`);
	//removing player info from db.
})

//4. assigning informations to each guild.
const wait = util.promisify(setTimeout);
const rest = new REST({
	version: '9'
}).setToken(process.env.DISCORD_TOKEN);


async function loadGuild(guild){
	await console.log(`┌---${guild.id}@${guild.name} Loading Started----`);
	//refresh slash commands.
	try{
		await console.log('| Refresing slash commands...');
		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, guild.id),
			{ body: guild.id == process.env.DEVGUILD_ID ? devCommands : commands }
		);
		await console.log('| Slash commands are successfully refreshed.');
	}catch(error){
		await console.log('| Slash commands are not loaded. reason : ');
		await console.log(error);
	}

	//load default musicserver info.
	try{
		await console.log('| Loading default music system info...');
		serverInfoList.set(guild.id, new musicFunctions(guild));
		const musicserverShard = serverInfoList.get(guild.id);
		
		const serverdbInfo = await serverData.findOne({guildId: guild.id});
		if(serverdbInfo) {
			musicserverShard.playInfo.searchFilter = serverdbInfo.searchFilter;
			musicserverShard.streamInfo.commandChannel = serverdbInfo.commandChannel;
		}

		await console.log('| Successfully loaded.');
		
	//sync to the music server player.
		await console.log('| Syncing player infos from db...');
		const serverplayerdbInfo = await serverPlayerData.findOne({guildId: guild.id});

		if(serverplayerdbInfo){/*player exists from db*/
			const dataplayerchannel = await client.channels.cache.find(ch => ch.id == serverplayerdbInfo.channelId);
			if(dataplayerchannel){ //DB에 플레이어 정보 있고 그게 실제로 서버에 있으면

				musicserverShard.playerInfo.channelId = serverplayerdbInfo.channelId;
				musicserverShard.playerInfo.channelName = serverplayerdbInfo.channelName;
				musicserverShard.playerInfo.playermsg.banner.messageContent = serverplayerdbInfo.playermsg.banner.messageContent;
				musicserverShard.playerInfo.playermsg.banner.imageURL = serverplayerdbInfo.playermsg.banner.imageURL;
				musicserverShard.playerInfo.playermsg.embed.messageContent = serverplayerdbInfo.playermsg.embed.messageContent;
				musicserverShard.playerInfo.playermsg.embed.imageURL = serverplayerdbInfo.playermsg.embed.imageURL;

				await syncPlayerChannel(guild.id);
				musicserverShard.playerInfo.setupped = true;

			}else{ //DB상에는 남아있는데 서버에 없는경우 강제삭제
				await serverPlayerData.deleteMany({guildId: guild.id});
				console.log('DBerror Detected. deleted db.');
			}
		}else{
			await console.log("| Player infos are doesn't exist in this server at db." );
		}
		
	}catch(error){
		await console.log('| Failed to sync. reason : ');
		console.log(error);
	}

	await console.log(`└---- ${guild.name} successfully loaded. ----\n`);
	
}

client.once('ready', async () => {
	await console.log(`${client.user.tag} Logged in sucessfully`);
	await console.log(`${client.guilds.cache.size} guilds found.`);
	await client.user.setActivity(`부팅 시작`, {type: 'PLAYING'});
	await console.log('Devguild Loading...');

	//4-1. load devGuild.
	const devGuild = client.guilds.cache.find(g => g.id === process.env.DEVGUILD_ID);
	await loadGuild(devGuild);

	//4-2. load other guilds.
	let guildNumber = 1;
	for(let guild of client.guilds.cache){
		if(guild[0] == process.env.DEVGUILD_ID) continue;
		await wait(500); //socket awaiter
		await loadGuild(guild[1]);
		await client.user.setActivity(
			`${guildNumber}/${client.guilds.cache.size} 서버 로딩`, 
			{ type: 'PLAYING' }
		);
		guildNumber++;

		if(guildNumber == client.guilds.cache.size){
			await client.user.setActivity(
				`로딩 끝!`,
				{ type: 'PLAYING' }
			);
			await wait(3e3);
			await client.user.setActivity(
				`${process.env.ANNOUNCE}`,
				{ type: 'PLAYING' }
			);
		}
	}

	//4-3. show current status of bot on console.
	setInterval(async () => {
		const voiceGuilds = [];
		let voiceGuilds_formessage = '';
		const timestamp = () => {
			const today = new Date();
			today.setHours(today.getHours() + 9);
			return today.toISOString().replace('T', ' ').substring(0, 19);
		}
		console.log(`\n[${timestamp()}]\nMemory usage : ${Number(process.memoryUsage().rss) / 1024 / 1024}MB`);
		for(let voiceGuild of client.voice.adapters){
			const voiceGuildInfo = await client.guilds.fetch(voiceGuild[0]);
			voiceGuilds.push(`${voiceGuild[0]}@${voiceGuildInfo.name}`);
			voiceGuilds_formessage += `${voiceGuildInfo.name}\n`;
		}
		voiceGuilds_formessage = `현재 ${voiceGuilds.length}개의 서버에서 스트리밍 중 : \n` + voiceGuilds_formessage;

		await console.log('Now Streaming : ');
		await console.log(voiceGuilds);
		await client.user.setActivity(`${process.env.ANNOUNCE}`, { type: 'PLAYING' });

		client.channels.fetch("976314813326163968").then(ch => {
			ch.send(
				`메모리 사용량 : ${Number(process.memoryUsage().rss) / 1024 / 1024}MB\n${voiceGuilds_formessage}`
			);
		})
	}, 3e3);
});

mongoose.connect(`mongodb+srv://neoxenesis:${process.env.DBPASSWORD}@snowsantbottestcl.havf9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`);
client.login(process.env.DISCORD_TOKEN);

