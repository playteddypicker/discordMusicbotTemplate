const setqueue = require('../../commands/musiccontrol/setqueue.js');
const server_queue = setqueue.server_queue;

module.exports = async (Discord, client, newMember, oldMember) => {
  if(!newMember.channel) return
  let vmcount = newMember.channel.members.filter(member => !member.user.bot).size;
  let bot = newMember.channel.members.filter(member => member.user.bot);
  if(bot.size){
    let connection = server_queue.get(newMember.channel.guild.id).connection;
    if(vmcount == 0) {
      connection.disconnect();
      setqueue.initqueue(newMember.channel.guild.id);
    }
  } 
}
