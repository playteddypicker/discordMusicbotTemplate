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
	playermsg: {
		banner: {
			messageContent: String,
			imageURL: [String],
		},
		embed: {
			messageContent: String,
			imageURL: [String],
		}
	}
});

const serverData = mongoose.model('serverData', serverSchema);
const serverPlayerData = mongoose.model('serverPlayerData', playerSchema);

module.exports = {
	serverData,
	serverPlayerData	
}

