const { Message, MessageEmbed } = require('discord.js');

async function reactionpages(
  message,
  pages
){
  let emoji = ["⏮️", "⏪", "⏩", "⏭️", "❌"];
  if(!message) throw new ReferenceError("message is not defined");
  if(!pages || typeof pages !== "object") throw new SyntaxError("Invalid form body [pages]");
  if(message.guild.me.permissions.has("MANAGE_MESSAGES")) {
    message.channel.send(pages[0]).then(async (msg) => {
      const msg1 = await message.channel.send(`Page 1 / ${pages.length}`);
      await msg.react(emoji[0]);
      await msg.react(emoji[1]);
      await msg.react(emoji[2]);
      await msg.react(emoji[3]);
      await msg.react(emoji[4]);

      const filter = (reaction, user) => 
        emoji.includes(reaction.emoji.name) &&
        user.id === message.author.id;
        
      const collector = msg.createReactionCollector(filter, {
        time: 120000,
      });
      let i = 0;
      collector.on("collect", async (reaction, user) => {
        reaction.users.remove(user);
        if(reaction.emoji.name == emoji[4]) {
          msg.delete();
          msg1.delete();
        }
        switch(reaction.emoji.name){
          case emoji[0]:
            if(i == 0) return;
            i = 0;
            msg1.edit(`Page 1 / ${pages.length}`);
            break;

          case emoji[1]:
            if(i == 0) return;
            i--;
            msg1.edit(`Page ${i+1} / ${pages.length}`);
            break;

          case emoji[2]:
            if(i == pages.length - 1) return;
            i++;
            msg1.edit(`Page ${i+1} / ${pages.length}`);
            break;

          case emoji[3]:
            if(i == pages.length - 1) return;
            i = pages.length - 1;
            msg1.edit(`Page ${i + 1} / ${pages.length}`);
            break;
        }
        await msg.edit(pages[i]);
      });

      collector.on("end", () => msg.reactions.removeAll());
    })
  }
}

module.exports = reactionpages;
