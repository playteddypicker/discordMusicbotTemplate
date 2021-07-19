const Discord = require('discord.js');
require('dotenv').config();
const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACION" ]});
client.commands = new Discord.Collection();
client.events = new Discord.Collection();

client.on("ready", () =>{
  console.log(`${client.user.tag}!로 로그인 완료!`);
  client.user.setActivity("헤헤..박사님.. | 명령어는 ./help", {
    type: "PLAYING",
  });
  //client.channels.cache.find(channel => channel.name === '슨상이').send("이제 준비됐어요!");
});

client.on('message', async message => {
  if(!message.guild.me.voice.channel) return
  let countvm = message.guild.me.voice.channel.members.filter(member => !member.user.bot).size;
  console.log(`countvm = ${countvm}`);
  if(countvm == 0){
    message.guild.me.voice.channel.leave();
    message.channel.send("아무도 안계셔서 플레이어 끄고 나왔어요..");
  }
});
  
['command_handler', 'event_handler'].forEach(handler =>{
  require(`./handlers/${handler}`)(client, Discord);
})

client.login(process.env.DISCORD_TOKEN);
