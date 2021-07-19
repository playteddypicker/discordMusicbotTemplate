const cooldowns = new Map();

module.exports = (Discord, client, message) => {
  const prefix = './';

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
