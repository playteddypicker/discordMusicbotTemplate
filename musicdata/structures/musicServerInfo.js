const serverInfoList = new Map();

class serverInfo {
	constructor(guild){
		this.guild = guild; //get id, name, guild.
		this.queue = []; //can save songs maximum 1972.
		this.streamInfo = {
			connection: null, //assigned by joinVoiceChannel or getVoiceStatus Function.
			audioPlayer: null, //assigned by createAudioPlayer();
			audioResource: null, //assigned by createAudioResource();
			playStatus: 'idle', //playing, idle(stopped, default), buffering, pause, error.
			playInfo : {
				loopmode: 'off', //loop mode. off, single, queue, auto
				volume: 0.3, //default volume. [0, 1].
				prevsong: [], //save previous songs maximum 10.
			}
		};
		this.playerInfo = { // *must save db.
			playerChannelId: '', //fetch by Id, load from database.
			playerChannelName: '', //load from fetch function.
			playermsg: {
				id: '',
				playerBannerImageUrl : '', //custom player banner, status image.
				playerEmbedImageUrl : '',
			} //fetch by Id, load from database. if not exist, refresh the channel.
		};
	}

	enterstop(){
		this.streamInfo.playStatus = 'idle';
		this.streamInfo.audioResource = null;
		this.streamInfo.playInfo.loopmode = 'off';
		this.streamInfo.playInfo.volume = 0.3;
		this.queue = [];
	}
}

class musicFunctions extends serverInfo { //function only.
	constructor(guild){
		super(guild);
	}
	//default funcitons. (dont need arguments.)
	//np, viewqueue는 command만 가능함. 여따 안넣고 defaultMusicCommands에다 넣기 ㄱ
	pause() {
		return this.streamInfo.connection.paused ? 
			this.streamInfo.connection.audioPlayer.unpause() :
			this.streamInfo.connection.pause();
	}

	skip() {
		this.streamInfo.connection.audioPlayer?.stop();
	}

	async stop() {
		await super.enterstop();
		return this.streamInfo.connection.audioPlayer?.stop(true); //force-stop.
	}

	async eject() {
		if(this.streamInfo.connection.audioPlayer) await this.streamInfo.connection.audioPlayer.stop(true); //force-stop.
		await super.enterstop(); //refresh streamInfo.
		await this.streamInfo.connection.destroy();
	}

	//advanced functions, but dont require arguments.
	async shuffle(){
		if(this.queue.length < 3) return false;
		for(let i = this.queue.length - 1; i >= 0; i--){
			let j = Math.floor((Math.random() * i)) + 1;
			if(j == 0 || i == 0) continue;
			[
				this.queue[i], this.queue[j]
			] = [
				this.queue[j], this.queue[i]
			];
		}
		return true;
	}

	async loop(selectedMode) {
		switch(selectedMode){
			case 'off':
				this.streamInfo.playInfo.loopmode = 'off';
				break;
				
			case 'single':
				this.streamInfo.playInfo.loopmode == 'single' ?
					this.streamInfo.playInfo.loopmode = 'off' :
					this.streamInfo.playInfo.loopmode = 'single';
				break;

			case 'queue':
				this.streamInfo.playInfo.loopmode == 'queue' ?
					this.streamInfo.playInfo.loopmode = 'off' :
					this.streamInfo.playInfo.loopmode = 'queue';
				break;

			case 'auto':
				this.streamInfo.playInfo.loopmode == 'auto' ?
					this.streamInfo.playInfo.loopmode = 'off' :
					this.streamInfo.playInfo.loopmode = 'auto';
				break;
		}

		if(this.streamInfo.playInfo.loopmode == 'auto' && this.streamInfo.playInfo.queue.length == 1){
			//search recommended song and push to the queue.
		}
	}

	volume(size){
		if(size < 1 || size > 100) return false;
		this.streamInfo.audioResource.volume.setVolume(size / 100);
		this.streamInfo.playInfo.volume = size / 100;
		return true;
	}

	jump(goto){
		if(goto >= this.queue.length) return false;
		this.streamInfo.playInfo.loopmode == 'queue' ? 
			this.queue = this.queue.concat(this.queue.splice(0, goto-1)) :
			this.queue.splice(0, goto-1);
		this.streamInfo.connection.audioPlayer.stop();
		return true;
	}

	remove(range1, range2){
		if(this.queue.length == 1) return 'rmWarn1';
		if(target < 1) return 'rmWarn2';

		if(range2){
			[range1, range2] = range1 <= range2 ? 
				[range1, range2] : 
				[range2, range1];
		}

		!range2 ? 
			this.queue.splice(range1, 1) :
			this.queue.splice(range1, range2 - range1 + 1);
		return range2 || range1 == range2 ? 
			'rmclear2' : 'rmclear3';
	}

	move(range1, range2){
		if(this.queue.length < 3 ) return 'moveWarm1';
		if(target > this.queue.length-1 || range1 < 1) return 'moveWarn2';
		if(range2 > this.queue.length-1 || range2 < 1) return 'moveWarn3';
		if(range1 == range2) return 'moveWarn4';

		function movearray(list, target, moveValue){
			const newpos = Number(target) + Number(moveValue);
			const tempList = JSON.parse(JSON>stringify(list));
			const totarget = tempList.splice(target, 1)[0];
			tempList.splice(newpos, 0, totarget);
			return tempList;
		}
		this.queue = movearray(this.queue, range1, ragne2 - range1);
		return true;
	}
}

module.exports = {
	serverInfo,
	serverInfoList
}
