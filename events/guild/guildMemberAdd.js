module.exports = (Discord, client, Guildmember) => {
  const guild = Guildmember.guild;
  if(guild.id != '853993299593789440') return;

  const noticechannels = client.channels.cache.filter(channel => channel.id === '853993849042501662');
  const noticechannel = noticechannels.get('853993849042501662');

  const welcomemsgkor = new Discord.MessageEmbed()
    .setAuthor(`${Guildmember.user.tag}님이 들어오셨어요!`, Guildmember.user.avatarURL())
    .setColor('#FF6F61')
    .setDescription(`${guild.name} 서버에 오신 것을 환영해요! <#873635882912079923>에 있는 공지를 꼭 읽어주세요.`);

  const welcomemsgeng = new Discord.MessageEmbed()
    .setAuthor(`${Guildmember.user.tag} just joined!`, Guildmember.user.avatarURL())
    .setColor('#FF6F61')
    .setDescription(`Welcome to ${guild.name}! Don't forget to read the <#873635882912079923>.`);

  noticechannel.send(welcomemsgkor);
  noticechannel.send(welcomemsgeng);

}
