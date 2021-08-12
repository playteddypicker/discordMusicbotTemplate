module.exports = {
  name: 'checkguildlist',
  execute(client, message, cmd, args, Discord){
    
    if(message.member.id != '653157614452211712') {
      return message.channel.send(`${message.member}, 그런 명령어는 없어요!`);
    }
    for(const [key, value] of client.guilds.cache){
      message.member.send(`${key} => 서버 이름 : ${value.name}, 서버 인원수 : ${value.memberCount}`);
    }
  }
}
