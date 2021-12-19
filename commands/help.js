const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('도움말 보기'),
	async execute(interaction){
		const version = '슨상이 3.2';
		const color = process.env.DEFAULT_COLOR;
		const patchnote = '- 사운드클라우드 지원(플레이리스트, 링크 추가 가능)\n- 플레이어에 새로운 버튼 "대기열 초기화" 추가\n- 여러 버그 고침';

			//3.1 patch : '음악 검색, 추가 모듈을 갈아엎고 전체 함수를 싹 다시 짰습니다. 그리고 개인별 플레이리스트를 사용할 수 있습니다. 자세한 내용은 다음 페이지에서 직접 확인해 보세요. 이전 버전에 있던 기능(경험치 계산기 등)은 차근차근 추가할 예정입니다.'
		const thumbnail = 'https://static.wikia.nocookie.net/fantendo/images/d/d5/SMM2_Cape_Toadette.png/revision/latest/scale-to-width-down/250?cb=20190726170458';

		const msgEmbed = new MessageEmbed()
			.setTitle(version)
			.setDescription('봇 기본 정보')
			.setColor(color)
			.setThumbnail(thumbnail)
			.addFields(
				{
					name: '제작자', 
					value: 'Discord: TeddyPicker#0689\n[Github 소스코드](https://github.com/TeddyPickerAC/snowsantbotNEW)', 
					inline: false,
				},
				{
					name: '기능', 
					value: '간단한 봇 상호작용과 음악 플레이어 봇 기능이 있는 다기능성 봇입니다.', 
					inline: false,
				},
				{
					name: '기본 정보', 
					value: `현재 슨상이를 쓰고있는 서버 수: ${interaction.client.guilds.cache.size}개\n100개가 되면 더이상 초대 불가능합니다.`, 
					inline: false
				},
				{
					name: '패치노트', 
					value: patchnote, 
					inline: false,
				},
				{
					name: '초대 링크 및 개발자 디스코드 서버', 
					value: '[슨상이 초대 링크](https://discord.com/api/oauth2/authorize?client_id=858927584652820542&permissions=8&scope=bot%20applications.commands)\n[개발자 디스코드 서버](https://discord.gg/NrXWKynJRB)\n[변경사항 보기](https://gall.dcinside.com/mgallery/board/view/?id=hypergryph&no=1094322&exception_mode=recommend&page=1)', 
					inline: false
				}
			);

		const defaultCommandEmbed = new MessageEmbed()
			.setTitle(`${version} - 기본 명령어 목록`)
			.setColor(color)
			.setThumbnail(thumbnail)
			.addFields(
				{
					name: '/슨상', 
					value:'/슨상 줘팸 | /슨상 존나팸 | /슨상 개씨발존나게팸 | /슨상 호감도 | /슨상 애낌 | /슨상 아무말', 
					inline: false,
				},
				{
					name: '/대신말해줘',
					value: '대신 말해줍니다',
					inline: false,
				},
				{
					name: '/clear <지울 채팅 개수> => 관리자 권한 필요',
					value: '지울 채팅 개수만큼 채팅을 지웁니다. 클수록 시간이 오래걸려요. 2주 안에 보내진 채팅만 지울 수 있어요.',
					inline: false,
				},
				{
					name: '/playlist',
					value: '/playlist private : 개인 플레이리스트를 설정합니다.\n(추가예정)/playlist public : 서버별 플레이리스트를 설정합니다.\n(추가예정)/playlist global : 슨상이를 쓰는 모든 사람들이 공유하는 플레이리스트를 설정합니다.', 
					inline: false,
				}
			);

		const musicCommandEmbed = new MessageEmbed()
			.setTitle(`${version} - 음악 명령어 목록`)
			.setColor(color)
			.setThumbnail(thumbnail)
			.addFields(
				{
					name: '/setup',
					value: '이 서버의 음악 플레이어 채널을 설정하거나 삭제합니다.',
					inline: false,
				},
				{
					name: '/search',
					value: '키워드를 바탕으로 유튜브 검색결과를 보여줍니다. 일반 비디오 뿐만 아니라 플레이리스트도 검색합니다.',
					inline: false,
				},
				{
					name: '/play <노래제목|유튜브링크|유튜브플레이리스트링크>',
					value: '키워드를 바탕으로 유튜브에서 검색해서 노래를 재생합니다.',
					inline: false,
				},
				{
					name: '/m',
					value: '/m np - 현재 재생 중인 노래의 정보를 보여줍니다\n/m q - 현재 대기 중인 노래의 목록을 보여줍니다\n/m pause - 노래를 일시정지하거나 다시 틉니다\n/m skip - 노래를 스킵합니다\n/m stop - 노래를 멈추고 모든 대기열을 초기화합니다\n/m eject - stop명령어에 음성 채널을 나갑니다\n\n/m shuffle - 대기 중인 노래를 섞습니다\n/m loop - 반복 모드를 설정합니다\n/m volume - 볼륨을 설정합니다. 모두에게 적용되는 값이니 주의해주세요\n/m jump <숫자> - 대기열의 <숫자>번으로 스킵합니다\n/m remove <숫자1> <숫자2> - <숫자2>가 없으면 <숫자1>번째 대기열의 노래를 삭제합니다. <숫자2>가 있으면 <숫자1>번째 대기열부터 <숫자2>번째 대기열까지 지웁니다.\n/m move <숫자1> <숫자2> - <숫자1>번째 대기열의 노래를 <숫자2>의 대기열 위치로 옮깁니다',
					inline: false,
				}
			);

		require('../structures/reactionpages.js').reactionpages(interaction, [msgEmbed, defaultCommandEmbed, musicCommandEmbed], false);
	}
}
