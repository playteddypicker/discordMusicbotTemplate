//developed by teddypicker
//pre-settings
require('dotenv').config();
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
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
	] 
});

//commands handler
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];

for(let file of commandFiles){
	const cmd = require(`./commands/${file}`);
	commands.push(cmd.data.toJSON());
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
const announce = '헤헤...';

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

//Releasing Version
client.once('ready', async () => {
	await console.log(`${client.user.tag} Logged in successfully`);
	client.user.setActivity(`${announce}`, {type: 'PLAYING'});
	await console.log(`${client.guilds.cache.size} guilds found.`);
	await console.log(`syncing informations to each guilds...`);

	for(let guild of client.guilds.cache){
	//	const testguild = client.guilds.cache.find(g => g.id === '841337761431814165');
	//{ const guild = ['841337761431814165', testguild];
		//Slash Commands Loading
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
				(ch) => ch.type === "GUILD_TEXT" && !!guild[1].client.user && ch.name == '슨상플레이어'
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
					await console.log(`└---- ${guild[1].name} successfully synced(player doesnt exist) ----`);
					continue;
				}
			}
			await require('./musicdata/syncplayer.js').syncChannel(channel); //간격을 주자
			await console.log(`└---- syncing done.`);
		}catch(error){
			await console.log('└---sync failed.----');
			await console.log(error)
		}	
		await console.log(`└---- ${guild[1].name} successfully loaded. ----\n\n`);
	}
});

module.exports = {
	client,
	commands,
	rest
}
shangus.connect(`mongodb+srv://neoxenesis:${process.env.DBPASSWORD}@snowsantbottestcl.havf9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`);
client.login(process.env.DISCORD_TOKEN);
