const { SlashCommandBuilder } = require('@discordjs/builders');
const {
	Message,
	MessageEmbed,
	MessageActionRow,
	MessageButton,
} = require('discord.js');

const { 
	privatePlaylist,
	publicPlaylist,
	globalPlaylist
} = require('../structures/playlistStructure.js');

const privatePlaylistLibraryMap = new Map();
const publicPlaylistLibraryMap = new Map();
const wait = require('util').promisify(setTimeout);
const privatePlaylistModel = require('../structures/playlistStructure.js').privatePlaylistModel;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('playlist')
		.setDescription('플레이리스트 보관함을 설정해요')
		.addSubcommand(subcmd =>
			subcmd
				.setName('private')
				.setDescription('개인 플레이리스트 보관함을 설정해요')
		/*) 나중에 만들자
		.addSubcommand(subcmd =>
			subcmd
				.setName('public')
				.setDescription('서버 플레이리스트 보관함을 설정해요')
		)
		.addSubcommand(subcmd =>
			subcmd
				.setName('global')
				.setDescription('모두가 공유하는 플레이리스트 보관함을 설정해요')
		*/),
	async execute(interaction){
		await interaction.deferReply();
		switch(interaction.options.getSubcommand()){
			case 'private':
				const userDB = await privatePlaylistModel.find({userid: interaction.member.id}, {_id: 0});
				console.log(userDB);
				if(userDB.length != 0){
					const assignPlaylistArray = new privatePlaylist(interaction.member);
						assignPlaylistArray.playlistArray = userDB;
					for(const item of userDB){
						await assignPlaylistArray.createPlaylist(item.name, item.description);
					}
					await privatePlaylistLibraryMap.set(interaction.member.id, assignPlaylistArray);
				}
				const userLibrary = await privatePlaylistLibraryMap.get(interaction.member.id);
				console.log(userLibrary);
				if(!userLibrary){
					await assignUserPlaylistLibrary(interaction);
				}else{
					const interactionInfo = await editPlaylistLibrary(userLibrary, 'private', interaction);
					await customReactionPages(interaction, userLibrary, interactionInfo.libraryUI, interactionInfo.libraryPages, 'private');
				}
				break;

			case 'public':
				break;

			case 'global':
				break;
		}
	}
}

async function customReactionPages(interaction, library, libraryUIEmbed, libraryPages, type){
	let Pages = libraryPages; //계속 변경할거임 

	const pageButtons = new MessageActionRow()
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

	//GUI Button mode, 눌리면 다시 할당
	let selectModeButtons = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('edit')
				.setLabel('편집')
				.setStyle('SECONDARY'),
			new MessageButton()
				.setCustomId('play')
				.setLabel('재생')
				.setStyle('SECONDARY'),
			new MessageButton()
				.setCustomId('help')
				.setEmoji('❔')
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId('reset')
				.setLabel('초기화')
				.setStyle('DANGER')
		);

	const userfilter = i => {
		return i.member.id === interaction.member.id;
	}

	const userfilterA = i => {
		return (i.user.id == interaction.member.id) && (
			i.customId == 'next' ||
			i.customId == 'previous' ||
			i.customId == 'toEndPage' ||
			i.customId == 'toStartPage' ||
			i.customId == 'remove'
		)
	};
	const userfilterB = i => {
		return (i.user.id == interaction.member.id) && !(
			i.customId == 'next' ||
			i.customId == 'previous' ||
			i.customId == 'toEndPage' ||
			i.customId == 'toStartPage' ||
			i.customId == 'remove'
		)
	};

	let pgnum = 0;
	let pgnumlimit = Pages.length-1;
	let playlistlocate = 0;
	if(pgnumlimit == 0){
		pageButtons.components[0].disabled = true;
		pageButtons.components[1].disabled = true;
		pageButtons.components[2].disabled = true;
		pageButtons.components[3].disabled = true;
	}

	const functionMessage = await interaction.editReply({embeds:[libraryUIEmbed, Pages[0]], components: [pageButtons, selectModeButtons], fetchReply: true});
	
	const awaitInteraction = () => functionMessage.awaitMessageComponent({
		filter: (i) => i.user.id === interaction.user.id,
		time: 300e3,
	}).then((i) => (i.isButton()) ? i : null).catch(() => null);

	const awaitMessage = (msg) => msg.channel.awaitMessages({
		filter: (m) => m.author.id === msg.interaction.user.id && !!m.content && m.content.length < 120,
		time: 300e3,
		max: 1,
		errors: ['time'],
	}).then((c) => c.first()).catch(() => null);

	const awaitMessageInteger = (msg, range) => msg.channel.awaitMessages({
		filter: (m) => m.author.id === msg.interaction.user.id && 
			!!m.content && 
			m.content.length < 3 && 
			Number.isInteger(Number(m.content)) && 
			Number(m.content) <= range &&
			Number(m.content) > 0,
		time: 300e3,
		max: 1,
		errors: ['time'],
	}).then((c) => c.first()).catch(() => null);

	while(1){
		let button = await awaitInteraction(); //여기서 버튼 받아서
		if(!button) {
			interaction.deleteReply();
		}
	

		if(userfilterA(button)){ 
			pgnumlimit = Pages.length-1;
			switch(button.customId){
				case 'next':
					if(pgnum < pgnumlimit) pgnum++;
					break;

				case 'previous':
					if(pgnum > 0) pgnum--;
					break;
	
				case 'toEndPage':
					pgnum = pgnumlimit;
					break;

				case 'toStartPage':
					pgnum = 0;
					break;

				case 'remove':
					button = null; //초기화
					return interaction.deleteReply(); //창 닫음
					break;

			
			}
		if(pgnum == pgnumlimit) {
			pageButtons.components[0].disabled = false;
			pageButtons.components[1].disabled = false;
			pageButtons.components[2].disabled = true;
			pageButtons.components[3].disabled = true;
			}else if(pgnum == 0){
				pageButtons.components[0].disabled = true;
				pageButtons.components[1].disabled = true;
				pageButtons.components[2].disabled = false;
				pageButtons.components[3].disabled = false;
			}else if(pgnumlimit == 0){
				pageButtons.components[0].disabled = true;
				pageButtons.components[1].disabled = true;
				pageButtons.components[2].disabled = true;
				pageButtons.components[3].disabled = true;
			}else{
				pageButtons.components[0].disabled = false;
				pageButtons.components[1].disabled = false;
				pageButtons.components[2].disabled = false;
				pageButtons.components[3].disabled = false;
			}

		await button.update({embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons]});
		}

		if(userfilterB(button)){
			await button.deferUpdate();
			switch(button.customId){
				case 'edit':
					await library.enterEditMode(); //수정모드 진입
					selectModeButtons = new MessageActionRow().addComponents(
						new MessageButton()
							.setCustomId('libraryEdit')
							.setLabel('보관함 편집')
							.setStyle('SECONDARY'),
						new MessageButton()
							.setCustomId('playlistEdit')
							.setLabel('플레이리스트 편집')
							.setStyle('SECONDARY'),
						new MessageButton()
							.setCustomId('back1')
							.setLabel('뒤로')
							.setStyle('PRIMARY')
					);
					libraryUIEmbed.setTitle('무엇을 편집할지 선택해주세요');
					if(library.playlistArrayEditTemp.length == 0) selectModeButtons.components[1].disabled = true;
					break;
					//edit에서 파생된 버튼
						case 'libraryEdit':
							selectModeButtons = new MessageActionRow().addComponents(
								new MessageButton()
									.setCustomId('addplaylist')
									.setLabel('추가')
									.setStyle('SECONDARY'),
								new MessageButton()
									.setCustomId('removeplaylist')
									.setLabel('제거')
									.setStyle('SECONDARY'),
								new MessageButton()
									.setCustomId('moveplaylist')
									.setLabel('옮기기')
									.setStyle('SECONDARY'),
								new MessageButton()
									.setCustomId('savePlaylist')
									.setLabel('저장')
									.setStyle('PRIMARY'),
								new MessageButton()
									.setCustomId('back2')
									.setLabel('뒤로')
								.setStyle('PRIMARY')
							);
							if(library.playlistArrayEditTemp.length == 0){ //여기서 권한설정도 ㄱ
								selectModeButtons.components[1].disabled = true;
								selectModeButtons.components[2].disabled = true;
								selectModeButtons.components[3].disabled = true;
							}
							libraryUIEmbed.setTitle('플레이리스트 목록을 어떻게 편집할지 선택해주세요');
							break;
							// libraryEdit에서 파생된 버튼
									case 'addplaylist':
										selectModeButtons.components[0].disabled = true;
										selectModeButtons.components[1].disabled = true;
										selectModeButtons.components[2].disabled = true;
										selectModeButtons.components[3].disabled = true;
										let libraryEditTemp = library.playlistArrayEditTemp;
										let playlistDescription = '';
										let playlistName = '';

										libraryUIEmbed
											.setTitle('추가할 플레이리스트의 이름을 120자 이내로 채팅에 적어주세요')
										const editMessageA = await interaction.editReply({
											embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons], fetchReply: true
										});
										
										while(1){ //플레이리스트 이름 입력받기
											let temp = null;
											await awaitMessage(editMessageA).then(async (msgcollectorA) => {
												if(!msgcollectorA){
													libraryUIEmbed.setTitle('추가할 플레이리스트의 이름을 "120자 이내"로 적어주세요\n이름 불러오는데 에러 발생됨');
													await interaction.editReply({
														embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons], fetchReply: true
													});
												}else{
													playlistName = msgcollectorA.content;
													temp = msgcollectorA.content;
													msgcollectorA.delete();
												}
											});
											if(temp) break;
										}
										
										libraryUIEmbed
											.setTitle('추가할 플레이리스트의 설명을 120자 이내로 채팅에 적어주세요');
										const editMessageB = await interaction.editReply({
											embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons], fetchReply: true
										});
										
										while(1){ //플레이리스트 설명 입력받기
											let temp = null;
											await awaitMessage(editMessageB).then(async (msgcollectorB) => {
												if(!msgcollectorB){
													libraryUIEmbed.setTitle('추가할 플레이리스트의 설명을 "120자 이내"로 적어주세요\n이름 불러오는데 에러 발생됨');
													await interaction.editReply({
														embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons], fetchReply: true
													});
												}else{
													playlistDescription = msgcollectorB.content;
													temp = msgcollectorB.content;
													msgcollectorB.delete();
												}
											});
											if(temp) break;
										}
				
										await library.createPlaylist(playlistName, playlistDescription);

										libraryUIEmbed
											.setTitle('플레이리스트 목록을 어떻게 편집할지 선택해주세요')
											.setDescription(`플레이리스트 수 : ${libraryEditTemp.length}\n상태: 변경됨(저장 안됨)`)
										
										selectModeButtons.components[0].disabled = false;
										selectModeButtons.components[3].disabled = false;
										if(library.playlistArrayEditTemp.length != 0){
											selectModeButtons.components[1].disabled = false;
											if(library.playlistArrayEditTemp.length != 1) selectModeButtons.components[2].disabled = false;
										}
										
										Pages = await editPlaylistEmbed(libraryEditTemp);
										
										pgnumlimit = Pages.length-1;
										pgnum = pgnumlimit;
										library.saved = false;
										await button.editReply({embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons]});
										break;
	
									case 'removeplaylist':
										selectModeButtons.components[0].disabled = true;
										selectModeButtons.components[1].disabled = true;
										selectModeButtons.components[2].disabled = true;
										selectModeButtons.components[3].disabled = true;

										libraryUIEmbed.setTitle('삭제할 플레이리스트의 번호를 입력해주세요');
										const editMessageC = await interaction.editReply({
											embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons], fetchReply: true
										});
										const msgcollectorC = await awaitMessageInteger(editMessageC, library.playlistArrayEditTemp.length);
										
										library.removePlaylist(Number(msgcollectorC.content) - 1);
										msgcollectorC.delete();
										libraryUIEmbed
											.setTitle('플레이리스트 목록을 어떻게 편집할지 선택해주세요')
											.setDescription(`플레이리스트 수 : ${library.playlistArrayEditTemp.length}\n상태: 변경됨(저장 안됨)`);

										//이제 플레이리스트 목록만 하면됨
										Pages = await editPlaylistEmbed(library.playlistArrayEditTemp);
										pgnumlimit = Pages.length - 1;
										pgnum = 0;

										selectModeButtons.components[0].disabled = false;
										selectModeButtons.components[3].disabled = false;
										if(library.playlistArrayEditTemp.length != 0){
											selectModeButtons.components[1].disabled = false;
											if(library.playlistArrayEditTemp.length != 1) selectModeButtons.components[2].disabled = false;
										}
										await interaction.editReply({
											embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons], fetchReply: true
										});
										library.saved = false;
										break;
	
									case 'moveplaylist':
										selectModeButtons.components[0].disabled = true;
										selectModeButtons.components[1].disabled = true;
										selectModeButtons.components[2].disabled = true;
										selectModeButtons.components[3].disabled = true;
										selectModeButtons.components[4].disabled = true;

										//functions
										libraryUIEmbed.setTitle('옮길 플레이리스트의 번호를 입력해주세요');
										const editMessageD = await interaction.editReply({
											embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons], fetchReply: true
										});
										const msgcollectorD = await awaitMessageInteger(editMessageD, library.playlistArrayEditTemp.length);
										
										libraryUIEmbed.setTitle('옮길 위치를 입력해주세요');
										const editMessageE = await interaction.editReply({
											embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons], fetchReply: true
										});
										const msgcollectorE = await awaitMessageInteger(editMessageE, library.playlistArrayEditTemp.length);

										await library.movePlaylist(Number(msgcollectorD.content)-1, Number(msgcollectorE.content)-1);
										msgcollectorD.delete();
										msgcollectorE.delete();
										libraryUIEmbed
											.setTitle('플레이리스트 목록을 어떻게 편집할지 선택해주세요')
											.setDescription(`플레이리스트 수 : ${library.playlistArrayEditTemp.length}\n상태: 변경됨(저장 안됨)`);
										Pages = await editPlaylistEmbed(library.playlistArrayEditTemp);
										
										console.log(Pages);

										selectModeButtons.components[0].disabled = false;
										selectModeButtons.components[3].disabled = false;
										selectModeButtons.components[4].disabled = false;
										if(library.playlistArrayEditTemp.length != 0){
											selectModeButtons.components[1].disabled = false;
											if(library.playlistArrayEditTemp.length != 1) selectModeButtons.components[2].disabled = false;
										}
										await interaction.editReply({
											embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons], fetchReply: true
										});
										library.saved = false;
										break;
	
									case 'savePlaylist':
										libraryUIEmbed
											.setTitle('변경 사항을 저장 중...')
											.setDescription(`플레이리스트 수 : ${library.playlistArrayEditTemp.length}\n상태: 저장 중...(X버튼을 절대로 누르지 마세요)`);
										await interaction.editReply({
											embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons], fetchReply: true
										});

										const saveProgress = await library.saveResult();
										switch(saveProgress){
											case 'success':
												libraryUIEmbed
													.setTitle('작업을 선택해주세요')
													.setDescription(`플레이리스트 수 : ${library.playlistArray.length}\n상태: ✅ 저장 완료`);
												selectModeButtons = new MessageActionRow().addComponents(
													new MessageButton()
														.setCustomId('edit')
														.setLabel('편집')
														.setStyle('SECONDARY'),
													new MessageButton()
														.setCustomId('play')
														.setLabel('재생')
														.setStyle('SECONDARY'),
													new MessageButton()
														.setCustomId('help')
														.setEmoji('❔')
														.setStyle('PRIMARY'),
													new MessageButton()
														.setCustomId('reset')
														.setLabel('초기화')
														.setStyle('DANGER')
												);
												library.saved = true;
												Pages = await editPlaylistEmbed(library.playlistArray);
												break;

											case 'DBerror':
												libraryUIEmbed
													.setTitle('저장하는데 에러 발생')
													.setDescription(`플레이리스트 수 : ${library.playlistArrayEditTemp.length}\n상태: ❌ 저장 실패(DB 등록 실패. 다시 시도해주세요)`);
												break;

											case 'emptysongsError':
												libraryUIEmbed
													.setTitle('저장하는데 에러 발생')
													.setDescription(`플레이리스트 수 : ${library.playlistArrayEditTemp.length}\n상태: ❌ 저장 실패(곡이 들어있지 않은 플레이리스트가 존재. 각 플레이리스트는 적어도 하나의 노래가 있어야 합니다)`);
												break;
										}
										break;
									
									case 'back2':
										selectModeButtons = new MessageActionRow().addComponents(
											new MessageButton()
												.setCustomId('libraryEdit')
												.setLabel('보관함 편집')
												.setStyle('SECONDARY'),
											new MessageButton()
												.setCustomId('playlistEdit')
												.setLabel('플레이리스트 편집')
												.setStyle('SECONDARY'),
											new MessageButton()
												.setCustomId('back1')
												.setLabel('뒤로')
												.setStyle('PRIMARY')
										);
										libraryUIEmbed.setTitle('무엇을 편집할지 선택해주세요');
										if(library.playlistArrayEditTemp.length == 0) selectModeButtons.components[1].disabled = true;
										break;
										
						case 'playlistEdit':
							libraryUIEmbed.setTitle('편집하실 플레이리스트의 번호를 입력해주세요');
							selectModeButtons.components[0].disabled = true;
							selectModeButtons.components[1].disabled = true;
							selectModeButtons.components[2].disabled = true;
							const editMessageF = await interaction.editReply({
								embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons], fetchReply: true
							});
							const msgcollectorF = await awaitMessageInteger(editMessageF, library.playlistArrayEditTemp.length);
							playlistlocate = Number(msgcollectorF.content)-1;
							msgcollectorF.delete();
							
							libraryUIEmbed
								.setTitle('플레이리스트를 어떻게 편집할지 선택해주세요')
								.setDescription(`노래 총 ${library.playlistArrayEditTemp[Number(msgcollectorF.content)-1].items.length}곡\n상태: ${!library.saved ? '변경됨(저장 안됨)' : '탐색'}`);
							
							Pages = await editSongsEmbed(library.playlistArrayEditTemp[Number(msgcollectorF.content)-1]);
							pgnum = 0;
							pgnumlimit = Pages.length-1;
							
							selectModeButtons = new MessageActionRow().addComponents(
								new MessageButton()
									.setCustomId('addsong')
									.setLabel('추가')
									.setStyle('SECONDARY'),
								new MessageButton()
									.setCustomId('removesong')
									.setLabel('제거')
									.setStyle('SECONDARY'),
								new MessageButton()
									.setCustomId('movesong')
									.setLabel('옮기기')
									.setStyle('SECONDARY'),
								new MessageButton()
									.setCustomId('savePlaylist') //저장은 큰틀까지 playlist단위로 함
									.setLabel('저장')
									.setStyle('PRIMARY'),
								new MessageButton()
									.setCustomId('back3')
									.setLabel('뒤로')
								.setStyle('PRIMARY')
							);
							if(library.playlistArrayEditTemp[playlistlocate].items.length == 0){ //여기서 권한설정도 ㄱ
								selectModeButtons.components[1].disabled = true;
								selectModeButtons.components[2].disabled = true;
								selectModeButtons.components[3].disabled = true;
							}
							libraryUIEmbed.setTitle('플레이리스트를 어떻게 편집할지 선택해주세요');
	
							break;

								case 'addsong':
									console.log(playlistlocate);
									libraryUIEmbed.setTitle('추가할 노래의 제목/링크/플레이리스트 링크를 채팅으로 써 주세요');
									selectModeButtons.components[0].disabled = true;
									selectModeButtons.components[1].disabled = true;
									selectModeButtons.components[2].disabled = true;
									selectModeButtons.components[3].disabled = true;
									selectModeButtons.components[4].disabled = true;

									const editMessageG = await interaction.editReply({
										embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons], fetchReply: true
									});
									const msgcollectorG = await awaitMessage(editMessageG);
									const searchSongRes = await require('../musicdata/searchbase.js').searchandReturn(msgcollectorG.content);
									msgcollectorG.delete();
									if(Array.isArray(searchSongRes)){
										for(let i = 1; i < searchSongRes.length; i++){
											const song = searchSongRes[i];
											const topushSong = {
												title: song.title,
												url: song.url,
												duration: song.duration,
												thumbnail: song.thumbnail,
												added: 'me',
											}
											library.playlistArrayEditTemp[playlistlocate].items.push(topushSong);
										}
										libraryUIEmbed
											.setTitle('플레이리스트를 어떻게 편집할지 선택해주세요')
											.setDescription(`노래 총 ${library.playlistArrayEditTemp[playlistlocate].items.length}곡\n상태: 변경됨(저장 안됨) ✅ 플레이리스트에서 ${searchSongRes.length -1}곡 추가 완료`);
										Pages = await editSongsEmbed(library.playlistArrayEditTemp[playlistlocate]);
										pgnumlimit = Pages.length-1;
									library.saved = false;
									}else if(typeof(searchSongRes) == 'object'){
										const topushSong = {
												title: searchSongRes.title,
												url: searchSongRes.url,
												duration: searchSongRes.duration,
												thumbnail: searchSongRes.thumbnail,
												added: 'me',
										}
										library.playlistArrayEditTemp[playlistlocate].items.push(topushSong);
										libraryUIEmbed
											.setTitle('플레이리스트를 어떻게 편집할지 선택해주세요')
											.setDescription(`노래 총 ${library.playlistArrayEditTemp[playlistlocate].items.length}곡\n상태: 변경됨(저장 안됨) ✅ 노래 추가 완료`);
										Pages = await editSongsEmbed(library.playlistArrayEditTemp[playlistlocate]);
										pgnumlimit = Pages.length-1;
									library.saved = false;
									}else{
										switch(searchSongRes){
											case '410':
												libraryUIEmbed
													.setTitle('플레이리스트를 어떻게 편집할지 선택해주세요')
													.setDescription(`노래 총 ${library.playlistArrayEditTemp[playlistlocate].items.length}곡\n상태: ${!library.saved ? '변경됨(저장 안됨)' : '탐색'} \n ❗️ 이 노래는 외부에서 사용할 수 없게 막아뒀어요`);
												break;

											case 'playlistError':
												libraryUIEmbed
													.setTitle('플레이리스트를 어떻게 편집할지 선택해주세요')
													.setDescription(`노래 총 ${library.playlistArrayEditTemp[playlistlocate].items.length}곡\n상태: ${!library.saved ? '변경됨(저장 안됨)' : '탐색'} \n ❗️ 플레이리스트를 불러오는데 실패했어요`);
												break;

											case 'searchError':
												libraryUIEmbed
													.setTitle('플레이리스트를 어떻게 편집할지 선택해주세요')
													.setDescription(`노래 총 ${library.playlistArrayEditTemp[playlistlocate].items.length}곡\n상태: ${!library.saved ? '변경됨(저장 안됨)' : '탐색'} \n ❗️ 검색하는데 에러가 났어요`);
												break;

											case 'searchfailed':
												libraryUIEmbed
													.setTitle('플레이리스트를 어떻게 편집할지 선택해주세요')
													.setDescription(`노래 총 ${library.playlistArrayEditTemp[playlistlocate].items.length}곡\n상태: ${!library.saved ? '변경됨(저장 안됨)' : '탐색'} \n ❗️ 검색 결과가 없어요`);
												break;
										}
									}
									selectModeButtons.components[0].disabled = false;
									selectModeButtons.components[4].disabled = false;
									if(library.playlistArrayEditTemp[playlistlocate].items.length > 0){
										selectModeButtons.components[1].disabled = false;
										selectModeButtons.components[3].disabled = false;
										if(library.playlistArrayEditTemp[playlistlocate].items.length > 1){
											selectModeButtons.components[2].disabled = false;
										}
									}
									break;

								case 'removesong':
									selectModeButtons.components[0].disabled = true;
									selectModeButtons.components[1].disabled = true;
									selectModeButtons.components[2].disabled = true;
									selectModeButtons.components[3].disabled = true;
									selectModeButtons.components[4].disabled = true;

									libraryUIEmbed.setTitle('지울 노래의 번호를 입력해주세요');
									const editMessageH = await interaction.editReply({
										embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons], fetchReply: true
									});
									const msgcollectorH = await awaitMessageInteger(editMessageH, library.playlistArrayEditTemp[playlistlocate].items.length);
									library.playlistArrayEditTemp[playlistlocate].items.splice(Number(msgcollectorH.content) - 1, 1);
									msgcollectorH.delete();
									libraryUIEmbed
										.setTitle('플레이리스트를 어떻게 편집할지 선택해주세요')
										.setDescription(`노래 총 ${library.playlistArrayEditTemp[playlistlocate].items.length}곡\n상태: ${!library.saved ? '변경됨(저장 안됨)' : '탐색'} \n ✅ 노래 삭제됨`)
									library.saved = false;
									selectModeButtons.components[0].disabled = false;
									selectModeButtons.components[4].disabled = false;
									if(library.playlistArrayEditTemp[playlistlocate].items.length > 0){
										selectModeButtons.components[1].disabled = false;
										selectModeButtons.components[3].disabled = false;
										if(library.playlistArrayEditTemp[playlistlocate].items.length > 1){
											selectModeButtons.components[2].disabled = false;
										}
									}
									Pages = await editSongsEmbed(library.playlistArrayEditTemp[playlistlocate]);
									pgnumlimit = Pages.length-1;
									break;

								case 'movesong':
								//위에 move베끼기
									selectModeButtons.components[0].disabled = true;
									selectModeButtons.components[1].disabled = true;
									selectModeButtons.components[2].disabled = true;
									selectModeButtons.components[3].disabled = true;
									selectModeButtons.components[4].disabled = true;

									libraryUIEmbed.setTitle('옮길 노래의 번호를 입력해주세요');
									const editMessageI = await interaction.editReply({
										embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons], fetchReply: true
									});
									const msgcollectorI = await awaitMessageInteger(editMessageI, library.playlistArrayEditTemp[playlistlocate].items.length);
									libraryUIEmbed
										.setTitle('노래를 옮길 위치의 번호를 입력해주세요')
									const editMessageJ = await interaction.editReply({
										embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons], fetchReply: true
									});
									const msgcollectorJ = await awaitMessageInteger(editMessageJ, library.playlistArrayEditTemp[playlistlocate].items.length);

										async function movearray(list, target, moveValue){
											const newpos = Number(target) + Number(moveValue);
											const tempList = await require('lodash.clonedeep')(list);
											const totarget = tempList.splice(target, 1)[0];
											tempList.splice(newpos, 0, totarget);
											return tempList;
										}
										if(Number(msgcollectorI.content) != Number(msgcollectorJ.content)) library.playlistArrayEditTemp[playlistlocate].items = await movearray(library.playlistArrayEditTemp[playlistlocate].items, Number(msgcollectorI.content)-1, Number(msgcollectorJ.content) - Number(msgcollectorI.content));

									libraryUIEmbed
										.setTitle('플레이리스트를 어떻게 편집할지 선택해주세요')
										.setDescription(`노래 총 ${library.playlistArrayEditTemp[playlistlocate].items.length}곡\n상태: ${!library.saved ? '변경됨(저장 안됨)' : '탐색'} \n ✅ 노래 옮겨짐`)
									library.saved = false;
									selectModeButtons.components[0].disabled = false;
									selectModeButtons.components[4].disabled = false;
									if(library.playlistArrayEditTemp[playlistlocate].items.length > 0){
										selectModeButtons.components[1].disabled = false;
										selectModeButtons.components[3].disabled = false;
										if(library.playlistArrayEditTemp[playlistlocate].items.length > 1){
											selectModeButtons.components[2].disabled = false;
										}
									}
									msgcollectorI.delete();
									msgcollectorJ.delete();
									Pages = await editSongsEmbed(library.playlistArrayEditTemp[playlistlocate]);
									pgnumlimit = Pages.length-1;
									break;

								case 'back3':
								//Pages를 보관함으로 다시 init, pgnum, pgnumlimit을 다시 초기화, 버튼 되돌리기
									Pages = editPlaylistEmbed(library.playlistArrayEditTemp);
									pgnum = 0;
									pgnumlimit = Pages.length-1;
									selectModeButtons = new MessageActionRow().addComponents(
											new MessageButton()
												.setCustomId('libraryEdit')
												.setLabel('보관함 편집')
												.setStyle('SECONDARY'),
											new MessageButton()
												.setCustomId('playlistEdit')
												.setLabel('플레이리스트 편집')
												.setStyle('SECONDARY'),
											new MessageButton()
												.setCustomId('back1')
												.setLabel('뒤로')
												.setStyle('PRIMARY')
										);
										libraryUIEmbed.setTitle('무엇을 편집할지 선택해주세요');
										if(library.playlistArrayEditTemp.length == 0) selectModeButtons.components[1].disabled = true;
									break;

						case 'back1':
							if(!library.saved){
								libraryUIEmbed.setTitle('이대로 뒤로 가면 변경 사항이 저장되지 않습니다. 정말로 뒤로 갈건가요?');
								selectModeButtons = new MessageActionRow().addComponents(
									new MessageButton()
										.setCustomId('yes')
										.setLabel('ㅇㅇ')
										.setStyle('DANGER'),
									new MessageButton()
										.setCustomId('no')
										.setLabel('ㄴㄴ')
										.setStyle('PRIMARY'),
								);
							}else{
								selectModeButtons = new MessageActionRow().addComponents(
									new MessageButton()
										.setCustomId('edit')
										.setLabel('편집')
										.setStyle('SECONDARY'),
									new MessageButton()
										.setCustomId('play')
										.setLabel('재생')
										.setStyle('SECONDARY'),
									new MessageButton()
										.setCustomId('help')
										.setEmoji('❔')
										.setStyle('PRIMARY'),
									new MessageButton()
										.setCustomId('reset')
										.setLabel('초기화')
										.setStyle('DANGER')
								);
							}
							//저장하지 않았으면 저장하라고 뜸
							break;
								
								case 'yes':
									selectModeButtons = new MessageActionRow().addComponents(
									new MessageButton()
										.setCustomId('edit')
										.setLabel('편집')
										.setStyle('SECONDARY'),
									new MessageButton()
										.setCustomId('play')
										.setLabel('재생')
										.setStyle('SECONDARY'),
									new MessageButton()
										.setCustomId('help')
										.setEmoji('❔')
										.setStyle('PRIMARY'),
									new MessageButton()
										.setCustomId('reset')
										.setLabel('초기화')
										.setStyle('DANGER')
								);
								library.playlistArrayEditTemp = await require('lodash.clonedeep')(library.playlistArray);
								Pages = await editPlaylistEmbed(library.playlistArray);
								pgnum = 0;
								libraryUIEmbed.setTitle('작업을 선택해주세요').setDescription(`저장된 플레이리스트 수 : ${library.playlistArray.length}`);
								pgnumlimit = Pages.length-1;
									break;

								case 'no':
									selectModeButtons = new MessageActionRow().addComponents(
											new MessageButton()
												.setCustomId('libraryEdit')
												.setLabel('보관함 편집')
												.setStyle('SECONDARY'),
											new MessageButton()
												.setCustomId('playlistEdit')
												.setLabel('플레이리스트 편집')
												.setStyle('SECONDARY'),
											new MessageButton()
												.setCustomId('back1')
												.setLabel('뒤로')
												.setStyle('PRIMARY')
										);
										libraryUIEmbed.setTitle('무엇을 편집할지 선택해주세요');
										if(library.playlistArray.length == 0) selectModeButtons.components[1].disabled = true;
									break;
				
				case 'play':
					//음성채널에 있는지 검사, 없으면 먼저 들어가라고 하고 break
					if(!interaction.member.voice.channel) {
						libraryUIembed.setDescription(`저장된 플레이리스트 수 : ${library.playlistArray.length}\n음성 채널에 먼저 들어가주세요`); 
						break;
					}
					//있으면 플레이리스트 선택한다음에 url기반 enqueue하기
					selectModeButtons.components[0].disabled = true;
					selectModeButtons.components[1].disabled = true;
					selectModeButtons.components[2].disabled = true;
					selectModeButtons.components[3].disabled = true;
					libraryUIEmbed.setTitle('재생하실 플레이리스트의 번호를 입력해주세요').setDescription(`저장된 플레이리스트 수 : ${library.playlistArray.length}`);
					const editMessageK = await interaction.editReply({
						embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons], fetchReply: true
					});
					const msgcollectorK = await awaitMessageInteger(editMessageK, library.playlistArray.length);
					try{
						await require('../musicdata/stream.js').trigger(interaction, msgcollectorK.content, 'playlist');
						libraryUIEmbed.setTitle('작업을 선택해주세요').setDescription(`저장된 플레이리스트 수 : ${library.playlistArray.length}\n상태: ✅ 상호작용 성공`);
						selectModeButtons.components[0].disabled = false;
						selectModeButtons.components[1].disabled = false;
						selectModeButtons.components[2].disabled = false;
						selectModeButtons.components[3].disabled = false;
					}catch(error){
						console.log(error);
						libraryUIEmbed.setTitle('작업을 선택해주세요').setDescription(`저장된 플레이리스트 수 : ${library.playlistArray.length}\n상태: ❗️ 상호작용 실패. 오류 : ${error}`);  
						selectModeButtons.components[0].disabled = false;
						selectModeButtons.components[1].disabled = false;
						selectModeButtons.components[2].disabled = false;
						selectModeButtons.components[3].disabled = false;
					}
					msgcollectorK.delete();
					//410에러 있는 곡 남아있을수도 있어서 난다면 UI 갱신하고 이거는 실패했다고 ㄱㄱ
					//그리고 컨티뉴하기
					break;

				case 'help':
					break;

				case 'reset':
					libraryUIEmbed.setTitle('보관함의 모든 플레이리스트가 삭제되며 서버에서도 지워집니다. \n정말로 보관함을 초기화 하실건가요?');
					selectModeButtons = new MessageActionRow().addComponents(
									new MessageButton()
										.setCustomId('yeah')
										.setLabel('ㅇㅇ')
										.setStyle('DANGER'),
									new MessageButton()
										.setCustomId('nope')
										.setLabel('ㄴㄴ')
										.setStyle('PRIMARY'),
								);
					break;

				case 'yeah':
					library = new privatePlaylist(interaction.member);
					privatePlaylistLibraryMap.set(interaction.member.id, library);
					await privatePlaylistModel.deleteMany({userid: interaction.member.id});
					selectModeButtons = new MessageActionRow().addComponents(
									new MessageButton()
										.setCustomId('edit')
										.setLabel('편집')
										.setStyle('SECONDARY'),
									new MessageButton()
										.setCustomId('play')
										.setLabel('재생')
										.setStyle('SECONDARY'),
									new MessageButton()
										.setCustomId('help')
										.setEmoji('❔')
										.setStyle('PRIMARY'),
									new MessageButton()
										.setCustomId('reset')
										.setLabel('초기화')
										.setStyle('DANGER')
								);
								library.playlistArrayEditTemp = await require('lodash.clonedeep')(library.playlistArray);
								Pages = await editPlaylistEmbed(library.playlistArray);
								pgnum = 0;
								libraryUIEmbed.setTitle('작업을 선택해주세요').setDescription(`저장된 플레이리스트 수 : ${library.playlistArray.length}`);
								pgnumlimit = Pages.length-1;

					break;

				case 'nope':
					selectModeButtons = new MessageActionRow().addComponents(
									new MessageButton()
										.setCustomId('edit')
										.setLabel('편집')
										.setStyle('SECONDARY'),
									new MessageButton()
										.setCustomId('play')
										.setLabel('재생')
										.setStyle('SECONDARY'),
									new MessageButton()
										.setCustomId('help')
										.setEmoji('❔')
										.setStyle('PRIMARY'),
									new MessageButton()
										.setCustomId('reset')
										.setLabel('초기화')
										.setStyle('DANGER')
								);
								library.playlistArrayEditTemp = await require('lodash.clonedeep')(library.playlistArray);
								Pages = await editPlaylistEmbed(library.playlistArray);
								pgnum = 0;
								libraryUIEmbed.setTitle('작업을 선택해주세요').setDescription(`저장된 플레이리스트 수 : ${library.playlistArray.length}`);
								pgnumlimit = Pages.length-1;
					break;
			}//switch문 끝

				if(Pages.length > 1){
					if(pgnum == pgnumlimit) {
						pageButtons.components[0].disabled = false;
						pageButtons.components[1].disabled = false;
						pageButtons.components[2].disabled = true;
						pageButtons.components[3].disabled = true;
					}else if(pgnum == 0){
						pageButtons.components[0].disabled = true;
						pageButtons.components[1].disabled = true;
						pageButtons.components[2].disabled = false;
						pageButtons.components[3].disabled = false;
					}else if(pgnumlimit == 0){
						pageButtons.components[0].disabled = true;
						pageButtons.components[1].disabled = true;
						pageButtons.components[2].disabled = true;
						pageButtons.components[3].disabled = true;
					}else{
						pageButtons.components[0].disabled = false;
						pageButtons.components[1].disabled = false;
						pageButtons.components[2].disabled = false;
						pageButtons.components[3].disabled = false;
					}
				}
				await button.editReply({embeds: [libraryUIEmbed, Pages[pgnum]], components: [pageButtons, selectModeButtons]});
		}//if(userfilterB)문 끝
	}//while문 끝
}//함수 끝

async function editPlaylistLibrary(library, type, interaction){
	let setauthorName = '';
	const avatarUrl = await interaction.user.displayAvatarURL();
	switch(type){
		case 'private':
			setauthorName = `${library.defaultInfo.name}님의 플레이리스트 보관함`;
			break;

		case 'public':
			setauthorName = `${library.defaultInfo.name} 서버의 플레이리스트 보관함`;
			break;

		case 'global':
			setauthorName = `공용 플레이리스트 보관함`
			break;
	}
	let libraryUIEmbed = new MessageEmbed()
		.setAuthor(setauthorName, avatarUrl)
		.setTitle(`작업을 선택해주세요`)
		.setDescription(`저장된 플레이리스트 수 : ${library.playlistArray.length}`)

	const libraryPages = await editPlaylistEmbed(library.playlistArray, type, setauthorName, library.defaultInfo);

	return {
		libraryUI: libraryUIEmbed, //type: Discord.MessageEmbed
		libraryPages: libraryPages //type: array
	}
}

function editPlaylistEmbed(playlistArray){
	const libraryPages = [];
	let libraryPageEmbed = new MessageEmbed();

	if(playlistArray.length == 0){
		libraryPageEmbed.addFields({
			name: '플레이리스트가 아직 추가되지 않았어요.', value: '아래 버튼에서 "편집"을 눌러 플레이리스트를 추가해주세요', inline: false
		});
		libraryPages.push(libraryPageEmbed);
	}else{
		for(let i = 0; i < playlistArray.length; i++){
			libraryPageEmbed.addFields({
				name: `#${i+1}. ${playlistArray[i].name}`, 
				value: `\n${playlistArray[i].description}\n\n${playlistArray[i].items.length}곡 저장됨`,
				inline: false
			});

			if((i+1) % 5 == 0){
				libraryPages.push(libraryPageEmbed);
				libraryPageEmbed = new MessageEmbed();
			}
		}
		if(playlistArray.length % 5 != 0) libraryPages.push(libraryPageEmbed);
	}
	return libraryPages;
}

function editSongsEmbed(playlist){
	const itemsPages = [];
	let itemsPageEmbed = new MessageEmbed().setTitle(`${playlist.name}\n총 ${playlist.items.length}곡`);

	if(playlist.items.length == 0){
		itemsPageEmbed.addFields({
			name: '노래가 아직 추가되지 않았어요.', value: '아래 버튼에서 "추가"를 눌러 노래를 추가해주세요', inline: false
		});
		itemsPages.push(itemsPageEmbed);
	}else{
		for(let i = 0; i < playlist.items.length; i++){
			itemsPageEmbed.addFields({
				name: `#${i+1}. ${playlist.items[i].title}`,
				value: `[${playlist.items[i].duration}] | ${playlist.items[i].url}`,
				inline: false
			});

			if((i+1) % 7 == 0){
				itemsPages.push(itemsPageEmbed);
				itemsPageEmbed = new MessageEmbed();
			}
		}
		if(playlist.items.length % 7 != 0) itemsPages.push(itemsPageEmbed);
	}
	return itemsPages;
}

async function assignUserPlaylistLibrary(interaction){

	const nothingEmbed = new MessageEmbed()
		.setAuthor(`${interaction.member.user.tag}님의 플레이리스트 보관함`, `${interaction.member.user.avatarURL()}`)
		.setTitle('아직 플레이리스트 보관함을 만들지 않으셨어요')
		.setDescription('아래 버튼을 눌러서 새로 만들거나 싫으시면 뒤로 가주세요');

	const selectButtons = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('make')
				.setLabel('만들래')
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId('cancel')
				.setLabel('싫어')
				.setStyle('DANGER')
		);

	await interaction.editReply({
		embeds: [nothingEmbed],
		components: [selectButtons],
	});

	const userfilter = i => {
		return i.user.id == interaction.user.id;
	};

	const collector = interaction.channel.createMessageComponentCollector();
					
	collector.on('collect', async i => {
		if(!userfilter(i)) return;
		switch (i.customId){
			case 'make':
				selectButtons.components[0].disabled = true;
				selectButtons.components[1].disabled = true;
				await i.update({embeds: [nothingEmbed], components: [selectButtons]});

				nothingEmbed
					.setTitle('플레이리스트 보관함 생성 중...')
					.setDescription('플레이리스트 보관함 구조를 불러오는 중...')
					.addFields({
						name: '1. 플레이리스트 보관함 구조 불러오기',  value: '진행 중...', inline: false
					});
				await interaction.editReply({ embeds: [nothingEmbed]});
				
				await privatePlaylistLibraryMap.set(interaction.member.id, new privatePlaylist(interaction.member));	
			
				nothingEmbed.fields[0].value = '✅ 완료'
				
				nothingEmbed
					.setDescription('생성된 보관함을 db에 등록하는 중..')
					.addFields({
						name: '2. 보관함을 서버 데이터베이스에 등록하기',  value: '진행 중...', inline: false
					});

				await interaction.editReply({embeds:[nothingEmbed]});
				//db 등록
				await wait(2000); //이거대신 등록하는거 ㄱ
				nothingEmbed.fields[1].value = '✅ 완료';
				nothingEmbed
					.setTitle(`${interaction.member.user.tag}님의 개인 플레이리스트 보관함이 생성되었어요`)
					.setDescription('/playlist private을 한번 더 치시면 생성된 보관함을 볼 수 있어요\n\n이 메시지는 20초 후 삭제됩니다');
				await interaction.editReply({embeds: [nothingEmbed]});
				collector.stop();
				await wait(20000);
				await interaction.deleteReply();
				break;

			case 'cancel':
				i.deferUpdate();
				interaction.deleteReply();
				collector.stop();
				break;
		}
	})
}

