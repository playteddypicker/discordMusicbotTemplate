const cooldowns = new Map();
const server_playerchannel = require('../../commands/musiccontrol/setupplayer.js');
const queuepack = require('../../commands/musiccontrol/setqueue.js');
const stream = require('../../commands/stream.js');

module.exports = async (Discord, client, message) => {
  const prefix = ';;';


  const playerchannel = server_playerchannel.server_player.get(message.guild.id);
  if(!message.author.bot && message.channel == playerchannel && playerchannel && !message.content.startsWith(prefix)){ //플레이어 채널에 그냥 메시지 입력한 상태일때
    if(!message.guild.me.voice.channel) queuepack.server_queue.delete(message.guild.id); //음성채널에 없는 상태일때 시작하기 전 초기화
    if(!message.member.voice.channel) return message.member.send('먼저 음성 채널에 들어가 주세요!'); //음성채널 안들어간 상태에서 노래 틀려고 할때
    
    const queue = await queuepack.setqueue(message.guild.id, message.channel);
    const search = message.content.slice(0).split(" ");
    stream.startstream(message, queue, search, message.member.voice.channel);
  }

  if(!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(" ");
  const cmd = args.shift().toLowerCase();

  const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));
/*
  if(!cooldowns.has(command.name)){
    cooldowns.set(command.name, new Discord.Collection());
  }

  const current_time = Date.now();
  const time_stamps = cooldowns.get(command.name);
  const cooldown_amount = (command.cooldown) * 1000;

  if(time_stamps.has(message.author.id)){
    const expiration_time = time_stamps.get(message.author.id) + cooldown_amount;

    if(current_time < expiration_time){
      const time_left = (expiration_time - current_time) / 1000;

      return message.reply(`말이 너무 많으신 것 같아요.. ${time_left.toFixed(1)}초 있다가 다시 쳐주세요..`);
    }
  }

  time_stamps.set(message.author.id, current_time);
  setTimeout(() => time_stamps.delete(message.author.id), cooldown_amount);
*/

  try{
    command.execute(client, message, cmd, args, Discord);
  } catch (err){
    message.reply("그런 명령어는 없어요!");
    console.log(err);
  }
  
}
