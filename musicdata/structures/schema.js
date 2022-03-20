const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
	guildId: String,
	commandChannel: String,
	searchFilter: {
		durationLimit: Number,
		banKeywords: [String]
	},
});

const playerSchema = new mongoose.Schema({
	guildId: String,
	channelId: String,
	channelName: String,
	msg: {
		banner: {
			id: String,
			message: String,
			imageURL: [String],
			swapmode: Number,
		},
		embed: {
			id: String,
			message: String,
			imageURL: [String],
			swapmode: Number,
		}
	}
});

const serverData = mongoose.model('serverData', serverSchema);
const serverPlayerData = mongoose.model('serverPlayerData', playerSchema);

module.exports = {
	serverData,
	serverPlayerData	
}

