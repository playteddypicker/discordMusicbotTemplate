module.exports = async(Discord, client, guild) => {
  let teddypicker = await client.users.fetch('653157614452211712');
  teddypicker.send(`봇이 **${guild.name}** 서버에 추가됨`);
}
