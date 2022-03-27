const { 
	MessageEmbed,
	MessageActionRow,
	MessageButton,
} = require('discord.js');

async function buttonreactionpages(button, pages){
	let pgnum = 0;
	const pgnumlimit = pages.length-1;

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

	const gay = await button.update({ embeds:[pages[0]], components: [row], fetchReply: true});

	const awaitInteraction = () => gay.awaitMessageComponent({
			filter: i => i.user.id === button.user.id && i.isButton(),
			time: 300e3,
		}).then(i => (i.isButton()) ? i : null).catch(() => null);

	while(1){
		let pagebutton = await awaitInteraction();
		if(!pagebutton){
			return;
		}

		switch (pagebutton.customId){
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
				return await gay.delete();
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

		await pagebutton.update({
			embeds:[pages[pgnum]],
			components: [row],
		});
	}
}
module.exports = {
	buttonreactionpages
}
