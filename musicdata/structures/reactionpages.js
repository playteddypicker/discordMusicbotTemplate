const { 
	MessageEmbed,
	MessageActionRow,
	MessageButton,
} = require('discord.js');

async function reactionpages(interaction, pages, isdeferred){
	if(!interaction) throw new ReferenceError("interaction/message is not defined");
	if(!pages || typeof pages !== "object") throw new SyntaxError("Invalid from body [pages]. pages must be array");
	let pgnum = 0;
	const pgnumlimit = pages.length-1;

	if(isdeferred){
		await interaction.editReply({ embeds:[pages[0]]});
	}else{
		await interaction.reply({ embeds: [pages[0]] });
	}

	const row = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('toStartPage')
				.setEmoji('⏮️')
				.setStyle('SECONDARY')
				.setDisabled(true),
			new MessageButton()
				.setCustomId('previous')
				.setEmoji('⬅️')
				.setStyle('SECONDARY')
				.setDisabled(true),
			new MessageButton()
				.setCustomId('next')
				.setEmoji('➡️')
				.setStyle('SECONDARY'),
			new MessageButton()
				.setCustomId('toEndPage')
				.setEmoji('⏭️')
				.setStyle('SECONDARY'),
			new MessageButton()
				.setCustomId('remove')
				.setEmoji('✖️')
				.setStyle('DANGER')
		);

	if(pgnumlimit == 0){
		row.components[0].disabled = true;
		row.components[1].disabled = true;
		row.components[2].disabled = true;
		row.components[3].disabled = true;
	}

	await interaction.editReply({ embeds:[pages[0]], components: [row]});

	const filter = i => i.user.id == interaction.member.id;
	const collector = interaction.channel.createMessageComponentCollector({filter, time:300000});

	collector.on('collect', async button => {
		switch (button.customId){
			case 'next':
				pgnum++;
				break;

			case 'previous':
				pgnum--;
				break;

			case 'toEndPage':
				pgnum = pgnumlimit;
				break;

			case 'toStartPage':
				pgnum = 0;
				break;

			case 'remove':
				interaction.deleteReply();
				return collector.stop();
				break;
		}

		if(pgnum == pgnumlimit) {
			row.components[0].disabled = false;
			row.components[1].disabled = false;
			row.components[2].disabled = true;
			row.components[3].disabled = true;
		}else if(pgnum == 0 ){
			row.components[0].disabled = true;
			row.components[1].disabled = true;
			row.components[2].disabled = false;
			row.components[3].disabled = false;
		}else if(pgnumlimit == 0){
			row.components[0].disabled = true;
			row.components[1].disabled = true;
			row.components[2].disabled = true;
			row.components[3].disabled = true;
		}else{
			row.components[0].disabled = false;
			row.components[1].disabled = false;
			row.components[2].disabled = false;
			row.components[3].disabled = false;
		}

		await button.update({
			embeds:[pages[pgnum]],
			components: [row],
		});
	});
}
module.exports = {
	reactionpages
}
