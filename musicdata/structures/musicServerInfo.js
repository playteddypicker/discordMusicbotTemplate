const serverInfoList = new Map();
const { AudioPlayerStatus } = require('@discordjs/voice');

class serverInfo {
	constructor(guild){
		this.guild = guild; //get id, name, guild.
		this.queue = []; //can save songs maximum 1972.
		this.previousqueue = []; //maximum : 7 songs.
	this.streamInfo = {
			commandChannel: '0',
			currentCommandChannel : '',
			streaming: false,
			connection: null, //assigned by joinVoiceChannel or getVoiceStatus Function.
			audioPlayer: null, //assigned by createAudioPlayer();
			audioResource: null, //assigned by createAudioResource();
			playStatus: '⏹ 재생 중이 아님', //playing, idle(stopped, default), buffering, pause, error.
			searchFilter: { //필터는 DB에서 받아서 봇 켤때 적용
				durationLimit: 0,
				banKeywords: [],
			},
			playInfo : {
				loopmode: '반복 모드 꺼짐', //loop mode. off, single, queue, auto
				volume: 0.3, //default volume. [0, 1].
			}
		};
		this.playerInfo = { // *must save db.
			setupped: false,
			channelId: '941662357829066784',
			playermsg: {
				banner: {
					id: '950407098708164670',
					message: '',
					imageURL: [],
					swapmode: 0, //0: default, 1: 순서대로, 2: 랜덤
				},
				embed: {
					id: '950407100452995072',
					message: '',
					imageURL: [],
					swapmode: 0, //0: default, 1: 순서대로, 2: 랜덤
				}
			}
		};
	}

	enterstop(){
		this.streamInfo.playStatus = '⏹ 재생 중이 아님';
		this.streamInfo.audioResource = null;
		this.streamInfo.playInfo.loopmode = '반복 모드 꺼짐';
		this.streamInfo.playInfo.volume = 0.3;
		this.queue = [];
	}
}

//musicserver default commands.
class musicFunctions extends serverInfo {
	constructor(guild){
		super(guild);
	}
	//default funcitons. (dont need arguments.)
	//np, viewqueue는 command만 가능함. 여따 안넣고 defaultMusicCommands에다 넣기 ㄱ
	pause() {
		return this.streamInfo.audioPlayer.state.status == 'paused' ? 
			this.streamInfo.audioPlayer.unpause() :
			this.streamInfo.audioPlayer.pause(true);
	}

	async stop() {
		await super.enterstop();
		await this.streamInfo.audioPlayer?.stop(true); //force-stop.
		return true;
	}

	skip() {
		this.streamInfo.audioPlayer.stop(true);
	}


	async eject() {
		await this.streamInfo.connection.destroy();
		await super.enterstop(); //refresh streamInfo.
		if(this.streamInfo.audioPlayer) await this.streamInfo.audioPlayer.stop(true); //force-stop.
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
		this.streamInfo.audioPlayer.stop();
		return true;
	}

	remove(range1, range2){
		if(this.queue.length == 1) return 'rmWarn1';
		if(range1 < 1) return 'rmWarn2';

		if(range2){
			[range1, range2] = range1 <= range2 ? 
				[range1, range2] : 
				[range2, range1];
		}

		!range2 ? 
			this.queue.splice(range1, 1) :
			this.queue.splice(range1, range2 - range1 + 1);
		return range1 == 1 && range2 == this.queue.length-1 ? 'rmclear1' 
			: !range2 ? 'rmclear0'
			: 'rmclear2';
	}

	move(range1, range2){
		if(this.queue.length < 3 ) return 'moveWarn1';
		if(range1 > this.queue.length-1 || range1 < 1) return 'moveWarn2';
		if(range2 > this.queue.length-1 || range2 < 1) return 'moveWarn3';
		if(range1 == range2) return 'moveWarn4';

		function movearray(list, target, moveValue){
			const newpos = Number(target) + Number(moveValue);
			const tempList = JSON.parse(JSON.stringify(list));
			const totarget = tempList.splice(target, 1)[0];
			tempList.splice(newpos, 0, totarget);
			return tempList;
		}
		this.queue = movearray(this.queue, range1, range2 - range1);
		return true;
	}

	refresh(){
		super.enterstop();
		this.streamInfo.connection?.destroy();
	}
}

module.exports = {
	serverInfo,
	serverInfoList,
	musicFunctions
}
