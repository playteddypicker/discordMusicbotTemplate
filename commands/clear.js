module.exports = {
  name: 'clear',
  description: "채팅 클리너",
  async execute(client, message, cmd, args, Discord){

      if(!args[0]) return message.reply("채팅 몇개를 지우실건지 말씀해주셔야해요!!");
      if(isNaN(args[0])) return message.reply("숫자로 입력해주세요..");

      if(args[0] > 500) return message.reply("그렇게까진 많이 못지워요..");
      if(args[0] < 1) return message.reply("0보다는 커야 채팅을 지울 수 있어요..");
    
      await message.channel.messages.fetch({limit: args[0]}).then(messages =>{
        message.channel.bulkDelete(messages);
      });
  }

}
