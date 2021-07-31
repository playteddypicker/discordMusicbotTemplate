module.exports = {
  name: 'ping',
  description: '핑 확인',
  execute (client, message, cmd, args, Discord){
    message.channel.send("핑 구하는 중...").then(m => {
      var ping = m.createdTimestamp - message.createdTimestamp;

      message.channel.send(`현재 핑 : ${ping}ms`)
    })






  }
}
