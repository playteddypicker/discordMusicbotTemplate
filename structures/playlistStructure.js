const shangus = require('mongoose');
const clonedeep = require('lodash.clonedeep');

//public playlist DB Assign
const publicPlaylistSchema = new shangus.Schema({	
	//플레이리스트 하나만 들어감. 등록하고 불러올때 배열로 반환되기때문에 
	//굳이 배열로 짤필요 X
	playlistType: String, //public
	guild: { //서버정보
		id: String,
		name: String,
	},
	madeby: {
		name: String,
		id: String,
	},
	items: [new shangus.Schema({
		title: String,
		url: String,
		duration: String,
		thumbnail: String,
	})],
});

class globalPlaylist{
	constructor(client){
		this.defaultInfo = {
			name: client.user.username,
			id: client.user.id
		};
		this.playlistArray = [];
	}

	createPlaylist(playlistname){
		const createPL = new playlistStructure(playlistname, playlistDescription, 'global', this.defaultInfo);
		this.playlistArray.push(createPL);
	}

}

class publicPlaylist{
	constructor(guild){
		this.defaultInfo = {
			name: guild.name,
			id: guild.id,
		};
		this.playlistArray = [];
	}

	createPlaylist(playlistname){
		const createPL = new playlistStructure(playlistname, playlistDescription, 'public', this.defaultInfo);
		this.playlistArray.push(createPL);
	}
}


//private playlist DB Assign
const privatePlaylistSchema = new shangus.Schema({ 
	//플레이리스트 하나만 들어감. 등록하고 불러올때 배열로 반환되기때문에 
	//굳이 배열로 짤필요 X
	playlistType: String, //private
	name: String,
	description: String,
	userid: String,
	madeby: {
		name: String,
		id: String,
	},
	items: [new shangus.Schema({
		title: String,
		url: String,
		duration: String,
		thumbnail: String,
	})]
});
const privatePlaylistModel = shangus.model('privatePlaylists', privatePlaylistSchema);


class privatePlaylist{
	constructor(member){ //playlist public assign 명령어로 유저 정보 받아서 등록
		this.defaultInfo = {
			name: member.user.tag, //닉네임 대신 태그로 저장함
			id: member.user.id, //식별용 ID
		},
		this.playlistArray = []; //플레이리스트 저장용 배열
		this.playlistArrayEditTemp = []; //플레이리스트 수정용 배열
		this.saved = true;
	}

	createPlaylist(playlistname, playlistDescription){
		const createPL = new playlistStructure(playlistname, playlistDescription, 'private', this.defaultInfo);
		this.playlistArrayEditTemp.push(createPL);
	}

	removePlaylist(target){
		try{
		  this.playlistArrayEditTemp.splice(target, 1);
		}catch (error){
			console.log(`playlistRemoveError: remove failed\n${error}`);
		}
	}

	async movePlaylist(target, towhere){
		if(target == towhere) return;
		async function movearray(list, target, moveValue){
			const newpos = Number(target) + Number(moveValue);
			const tempList = await clonedeep(list);
			const totarget = tempList.splice(target, 1)[0];
			tempList.splice(newpos, 0, totarget);
			return tempList;
		}
		this.playlistArrayEditTemp = await movearray(this.playlistArrayEditTemp, target, towhere - target);
	}

	async saveResult(){
		for(const playlist of this.playlistArrayEditTemp){
			if(playlist.items.length == 0) return 'emptysongsError';
		}

		const playlistDBchecker = await privatePlaylistModel.find({userid: this.defaultInfo.id});
		if(playlistDBchecker){
			await privatePlaylistModel.deleteMany({userid: this.defaultInfo.id});
		}

		this.playlistArray = await clonedeep(this.playlistArrayEditTemp);
		for(const playlist of this.playlistArray){
			try{
				const playlistDB = new privatePlaylistModel(
					{
						name: playlist.name,
						description: playlist.description,
						playlistType: 'private',
						userid: this.defaultInfo.id,
						madeby: {
							name: this.defaultInfo.name,
							id: this.defaultInfo.id,
						},
						items: playlist.items, //이게된다고?
					},
				);
				await playlistDB.save();
			}catch(error){
				console.log(error);
				console.log(`playlist${playlist.name} added Failed`);
				return 'DBerror';
			}
		}
		this.playlistArrayEditTemp = [];
		this.saved = true;
		return 'success';
	}

	async enterEditMode(){
		this.playlistArrayEditTemp = await clonedeep(this.playlistArray);
		this.saved = false;
	}
}//서버 데이터로 저장 필요


class playlistStructure{
	constructor(name, description, type, defaultInfo){
		this.name = name;
		this.description = description;
		this.playlistType = type;
		this.madeby = {
				name: defaultInfo.name,
				id: defaultInfo.id,
			};
		this.items = [];
	}	
}

/*  기본 구조 : private / public
 *  
 *  defaultInfo: {
 *  	name: 'TeddyPicker#0689',
 *  	profileURL: 'https://knowhow.or.kr',
 * 		id: 2009052320090518,
 *  },
 *  playlistArray:[
 * 	 	{
 * 	 		name: 'MC무현 모음집',
 * 	 		description: '2021년, 올해도 세계의 여러 아티스트들을 휩쓸어버린 그의 전설적인 노래를 담았다.',
 * 	 		playlistType: 'private', //or 'public',
 * 	 		madeby: {
 * 	 			name: 'TeddyPicker#0689', //or 서버 이름
 * 	 			profileURL: //대충 url,
 * 	 			id: '653157614452211712' //or 서버 아이디
 * 	 		},
 * 	 		items: [
 * 				{
 * 					title: 'MC무현-MC무현',
 * 					url: 'https://www.youtube.com/watch?v=cwI1cubjGY0',
 * 					duration: '05:23',
 * 				},
 * 				{
 * 					title: 'MC무현 - 메이플스토리'
 * 					url: 'https://www.youtube.com/watch?v=2Digtk0KB0c',
 * 					duration: '05:18',
 * 				},
 * 				{
 * 					/...노래 더 많이 계속 이어짐
 * 				}
 * 			]
 * 		},
 * 		{
 * 			...다른 플레이리스트 정보
 * 		}
 *  ]
*/

module.exports = {
	globalPlaylist,
	publicPlaylist,
	privatePlaylist,
	privatePlaylistModel,
	playlistStructure,
}
