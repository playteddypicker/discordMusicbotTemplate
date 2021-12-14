module.exports = {
	name: 'guildMemberAdd',
	once: false,
	async execute(guildMember, client){
		if(guildMember.guild.id != '853993299593789440') return;
		const noticechannels = client.channels.cache.filter(ch => ch.id === '904591110440095795');
		const noticechannel = noticechannels.get('904591110440095795');

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
}
