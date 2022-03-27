const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { buttonreactionpages } = require('../../musicdata/structures/buttonreactionpages.js');
require('dotenv').config();

const row1 = new MessageActionRow()
	.addComponents(
		new MessageButton()
			.setCustomId('helpmusicplay')
			.setLabel('음악 명령어 도움말')
			.setStyle('PRIMARY'),
		new MessageButton()
			.setCustomId('helpmusicplayer')
			.setLabel('플레이어 도움말')
			.setStyle('PRIMARY'),
		new MessageButton()
			.setCustomId('helpadminsetting')
			.setLabel('관리자 명령어 도움말')
			.setStyle('PRIMARY')
	)
const row2 = new MessageActionRow()
	.addComponents(
		new MessageButton()
			.setCustomId('helpothers')
			.setLabel('다른 명령어 도움말')
			.setStyle('PRIMARY'),
		new MessageButton()
			.setCustomId('closehelpwindow')
			.setLabel('닫기')
			.setStyle('DANGER')
	);

const helpmusicplayEmbeds = [
	new MessageEmbed()
		.setTitle("음악 명령어 도움말 - 1-1. ▶️ 음악 재생")
		.addFields(
			{
				name:  "봇으로 노래 듣기",
				value: 
					"기본적으로 봇은 /play명령어로 노래를 재생하게됩니다." + "\n" +
					"/play 치고 탭을 누르거나 위에 뜨는 것 중 봇을 클릭하면" + "\n" +
					"request: 라고 뜨는데, 이때 노래 정보를 입력해 재생할 수 있습니다.",
				inline: false,
			}
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957560790569877584/2022-03-27_17.44.38.png"
		),
	new MessageEmbed()
		.setTitle("음악 명령어 도움말 - 1-2. ▶️ 음악 재생")
		.addFields(
			{
				name:  "request에 넣을 수 있는 것들",
				value: 
					"request: 항목에 쓸 수 있는것은 총 다섯가지입니다." + "\n" +
					"- 그냥 텍스트(영상 제목 등)" + "\n" +
					"- 유튜브 영상 링크" + "\n" +
					"- 유튜브 플레이리스트 링크" + "\n" +
					"- 사운드클라우드 음원 링크" + "\n" +
					"- 사운드클라우드 재생목록 링크",
				inline: false,
			}
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957620868941484032/2022-03-27_21.43.24.png?width=668&height=1053"
		),
	new MessageEmbed()
		.setTitle("음악 명령어 도움말 - 1-3. ▶️ 음악 재생")
		.addFields(
			{
				name:  "플레이리스트 검색 기능",
				value: 
					"플레이리스트를 검색해서 바로 추가할 수 있습니다." + "\n" +
					"사진처럼 검색할 플레이리스트의 이름을 입력한 후" + "\n" +
					"탭을 눌러 true를 누르거나 탭을 한 번 더 누릅니다." + "\n" +
					"엔터를 누르면 플레이리스트를 검색 후 대기열에 추가합니다.",
				inline: false,
			}
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957621643855921193/2022-03-27_21.46.29.png?width=789&height=1053"
		),
	new MessageEmbed()
		.setTitle("음악 명령어 도움말 - 2. 노래 정보 보기")
		.addFields(
			{
				name:  "/np, /q, /history 명령어",
				value: 
					"/np 명령어로 현재 재생 중인 곡의 정보와" + "\n" +
					"/q 로 현재 대기열에 있는 노래 정보를 볼 수 있습니다." + "\n" +
					"/history로 최근 재생한 노래를 최대 7곡까지 볼 수 있습니다.",
				inline: false,
			}
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957629071678910464/2022-03-27_22.15.59.png?width=1020&height=1055"
		),
	new MessageEmbed()
		.setTitle("음악 명령어 도움말 - 3. ⏹ 노래 멈추기")
		.addFields(
			{
				name:  "노래를 멈추는 명령어",
				value: 
					"/skip : 다음 곡으로 넘어갑니다." + "\n\n" +
					"/pause : 노래를 일시정지하거나, 다시 재개합니다." + "\n\n" +
					"/stop : 노래를 멈추고 대기열을 초기화합니다." + "\n\n" +
					"/eject : /stop 명령어를 실행한 후 봇이 음성 채널까지 나갑니다.",
				inline: false,
			}
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957625084212838490/2022-03-27_22.00.08.png"
		),
	new MessageEmbed()
		.setTitle("음악 명령어 도움말 - 4. 반복 모드")
		.addFields(
			{
				name:  "반복 모드 설정하기",
				value: 
					"/loop 명령어를 사용하면 반복 모드를 설정할 수 있습니다." + "\n\n" +
					"🔂 반복 재생 모드 : 현재 재생 중인 곡만 계속 반복합니다." + "\n" +
					"🔁 대기열 반복 모드 : 대기열을 계속 반복합니다." + "\n" +
					"♾️ 자동 재생 모드 : 노래를 안넣어도 추천 노래를 계속 추가합니다.",
				inline: false,
			}
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957627841023983646/2022-03-27_22.11.03.png"
		),
	new MessageEmbed()
		.setTitle("음악 명령어 도움말 - 5. 고급 기능(1)")
		.addFields(
			{
				name:  "/jump [대기열번호]",
				value: 
					"대기열의 원하는 번호로 스킵하는 명령어입니다.",
				inline: false,
			},
			{
				name: '/shuffle',
				value: "대기열에 있는 노래를 섞습니다.",
				inline: false,
			},
			{
				name: "/volume [0-100]",
				value: 
					"봇이 재생할 때의 볼륨을 설정합니다." + "\n" +
					"봇 자체의 볼륨을 조절하는 것이기 때문에, " + "\n" +
					"듣고 있는 모든 유저에게 적용됩니다.",
			}
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957630408198090802/2022-03-27_22.21.16.png"
		),
	new MessageEmbed()
		.setTitle("음악 명령어 도움말 - 6. 고급 기능(2)")
		.addFields(
			{
				name:  "/remove [숫자1] [숫자2]",
				value: 
					"[숫자2] 없이 [숫자1]만 적으면 " + "\n" +
					"[숫자1]에 해당하는 대기열의 노래를 지웁니다." + "\n" +
					"[숫자1]과 [숫자2]를 둘 다 적으면" + "\n" +
					"[숫자1]~[숫자2]에 해당하는 대기열의 모든 노래를 지웁니다.", 
				inline: false,
			},
			{
				name: "/move [숫자1] [숫자2]",
				value: 
					"[숫자1]의 대기열 노래를 [숫자2]로 옮깁니다.",
				inline: false,
			},
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957632020681457715/2022-03-27_22.27.22.png?width=792&height=1054"
		)
];

const helpmusicplayerEmbeds = [
	new MessageEmbed()
		.setTitle("플레이어 도움말 - 1-1. 노래 재생하기")
		.addFields(
			{
				name:  "노래 재생하기",
				value: 
					"서버 관리자가 생성한 플레이어에 노래를 재생할 수 있습니다." + "\n" +
					"플레이어 채팅창에 노래 제목/링크를 입력해서 재생합니다." + "\n" +
					"/play 명령어를 사용할 수도 있습니다.",
				inline: false,
			},
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957564230029172756/2022-03-27_17.58.19.png?width=1232&height=1054"
		),
	new MessageEmbed()
		.setTitle("플레이어 도움말 - 1-2. 노래 재생하기")
		.addFields(
			{
				name:  "노래 한꺼번에 넣기",
				value: 
					"노래 정보를 줄바꿈으로 구분해서 여러 노래를 넣을 수 있습니다." + "\n" +
					"/play 명령어로 플레이리스트를 한번에 추가할 수도 있습니다.",
				inline: false,
			},
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957636180416036954/2022-03-27_22.44.09.png?width=1000&height=1054"
		),
	new MessageEmbed()
		.setTitle("플레이어 도움말 - 2. 버튼 사용하기(1)")
		.addFields(
			{
				name:  "기본 기능 버튼",
				value: 
					"플레이어 정보창 밑에 보면 버튼이 4+4+5=13개 있는데," + "\n" +
					"명령어를 입력할 필요 없이 편하게 해놓은 것입니다." + "\n\n" +
					"⏯ : 노래 일시정지/재개" + "\n\n" +
					"⏹ : \n- (대기열에 노래가 남은 상태에서) 대기열 초기화" + "\n" +
					"- (대기열에 노래가 없지만 재생 중일 때) 노래 정지" + "\n" +
					"- (아무것도 재생 중이지 않을 때) 음성채팅 나가기" + "\n\n" +
					"⏭ : 노래 스킵" + "\n\n" +
					"⏳ : 현재 곡의 타임라인 보기" + "\n\n" +
					"🔀 : 대기열 노래 섞기" + "\n\n" +
					"🔂 : 반복 모드 / 다시 눌러서 끄기" + "\n\n" +
					"🔁 : 대기열 반복 모드 / 다시 눌러서 끄기" + "\n\n" +
					"♾ : 자동 재생 모드 / 다시 눌러서 끄기"
				,
				inline: false,
			},
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957637211531149353/2022-03-27_22.48.19.png"
		),
	new MessageEmbed()
		.setTitle("플레이어 도움말 - 2. 버튼 사용하기(2)")
		.addFields(
			{
				name:  "고급 기능 버튼",
				value: 
					"🔈 : 볼륨 10% 줄이기" + "\n\n" +
					"🔊 : 볼륨 10% 키우기" + "\n\n" +
					"❌ : 가장 최근에 넣은 곡 지우기" + "\n\n" +
					"⤴️ : 다음 곡을 대기열의 맨 뒤로 옮기기" + "\n\n" +
					"⤵️ : 대기열 맨 뒤의 곡을 다음 곡으로 옮기기"
				,
				inline: false,
			},
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957637211531149353/2022-03-27_22.48.19.png"
		),
];

const helpadminsettingEmbeds = [
	new MessageEmbed()
		.setTitle("관리자 도움말")
		.addFields(
			{
				name:  "관리자 명령어",
				value: 
					"관리자는 기본적으로 /setup, /setting 명령어를 쓸 수 있습니다.",
				inline: false,
			},
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957640862274301993/2022-03-27_23.02.49.png"
		),
	new MessageEmbed()
		.setTitle("관리자 도움말 - 1. /setup")
		.addFields(
			{
				name:  "/setup : 플레이어 채널 생성",
				value: 
					"이 명령어는 서버의 플레이어 채널을 생성/편집하는 명령어입니다." + "\n" +
					"플레이어 채널이 없는 상태에서 명령어를 치면 먼저 생성합니다.",
				inline: false,
			},
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957564341933182996/2022-03-27_17.58.44.png?width=786&height=1053"
		),
	new MessageEmbed()
		.setTitle("관리자 도움말 - 1. /setup")
		.addFields(
			{
				name:  "/setup : 플레이어 채널 편집",
				value: 
					"플레이어 채널이 있는 상태에서 명령어를 치면 이 창이 뜹니다.",
				inline: false,
			},
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957641801223794688/2022-03-27_23.06.32.png"
		),
	new MessageEmbed()
		.setTitle("관리자 도움말 - 1. /setup")
		.addFields(
			{
				name:  "/setup : 플레이어 텍스트 설정",
				value: 
					"[플레이어 텍스트 설정] 버튼으로\n플레이어 배너 위에 있는 텍스트를 수정할 수 있습니다.",
				inline: false,
			},
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957642209304400012/2022-03-27_23.08.09.png?width=942&height=1054"
		),
	new MessageEmbed()
		.setTitle("관리자 도움말 - 1. /setup")
		.addFields(
			{
				name:  "/setup : 플레이어 배너 설정",
				value: 
					"[플레이어 배너 설정] 버튼을 누른 후\n이미지를 업로드해 플레이어 배너 사진을 바꿀 수 있습니다.",
				inline: false,
			},
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957644064826736690/2022-03-27_23.15.32.png"
		),
	new MessageEmbed()
		.setTitle("관리자 도움말 - 1. /setup")
		.addFields(
			{
				name:  "/setup : 플레이어 대기 이미지 설정",
				value: 
					"[플레이어 대기 이미지 설정] 버튼을 누른 후\n이미지를 업로드해 플레이어 대기 이미지 사진을 바꿀 수 있습니다.",
				inline: false,
			},
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957644665530744882/2022-03-27_23.17.57.png?width=1128&height=1054"
		),
	new MessageEmbed()
		.setTitle("관리자 도움말 - 2. /setting")
		.addFields(
			{
				name:  "서버 설정 : /setting",
				value: 
					"이 명령어는 노래 검색에 대한 설정을 하는 명령어입니다." + "\n" +
					"명령어를 치면 이 창이 뜹니다."
				,
				inline: false,
			},
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957645222903422987/2022-03-27_23.20.10.png"
		),
	new MessageEmbed()
		.setTitle("관리자 도움말 - 2. /setting")
		.addFields(
			{
				name:  "/setting : 최대 노래 길이 설정",
				value: 
					"[최대 노래 길이 설정] 버튼을 누르면 검색할 때" + "\n" +
					"설정한 영상 길이보다 재생 시간이 긴 영상은 제외합니다." + "\n" +
					"설정한 길이보다 재생 시간이 긴 영상은 링크로 재생할 수 있습니다." + "\n" +
					"0분으로 설정하면 길이 제한을 해제합니다."
				,
				inline: false,
			},
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957645960945762374/2022-03-27_23.23.06.png"
		),
	new MessageEmbed()
		.setTitle("관리자 도움말 - 2. /setting")
		.addFields(
			{
				name:  "/setting : 차단 키워드 설정",
				value: 
					"[검색 차단 키워드] 버튼을 누르면 검색할 때" + "\n" +
					"제목에 설정한 차단 키워드가 포함된 영상은 제외합니다." + "\n" +
					"등록되지 않은 키워드를 **띄어쓰기 없이** 입력해서 추가하거나" + "\n" +
					"이미 등록된 키워드를 입력해서 그 키워드를 지울 수 있습니다." + "\n" +
					"영문자의 경우 대소문자를 구분하지 않습니다." + "\n" +
					"너무 많은 키워드를 추가하거나 차단 키워드를 검색하게 되면" + "\n" +
					"검색 결과가 없는 경우가 많이 생길 수 있으니 주의해주세요."
				,
				inline: false,
			},
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957647142393114684/2022-03-27_23.27.47.png"
		),
	new MessageEmbed()
		.setTitle("관리자 도움말 - 2. /setting")
		.addFields(
			{
				name:  "/setting : 명령어 채널 설정",
				value: 
					"[명령어 채널 설정] 버튼을 누르면 명령어를 칠 때" + "\n" +
					"설정해놓은 채널 이외에는 음악 명령어를 사용할 수 없습니다."
				,
				inline: false,
			},
		)
		.setImage(
			"https://media.discordapp.net/attachments/934297359209340939/957647547814514688/2022-03-27_23.29.23.png"
		),
];

const helpothersEmbeds = [
	new MessageEmbed()
		.setTitle("ㄴㄱㅁ")

];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('❔ 봇 사용법을 보여줘요'),
	async execute(interaction){
		await interaction.deferReply();
		const helpPage = new MessageEmbed()
			.setTitle("봇 기본 정보")
			.setColor(process.env.DEFAULT_COLOR)
			.addFields(
				{
					name: '제작자',
					value: 'Discord: TeddyPicker#0689' + '\n' + 
						'[Github 소스코드](https://github.com/playteddypicker/discordMusicbotTemplate)',
					inline: false,
				},
				{
					name: '기본 정보',
					value: '현재 이 봇을 쓰고 있는 서버 수: ' + `**${interaction.client.guilds.cache.size}**개`,
					inline: false,
				},
				{
					name: '개발자 디스코드 서버',
					value: '봇 개발 현황과 패치노트, 봇 테스트, 초대 링크 등 개발 관련 다양한 것을 볼 수 있습니다.' + '\n' +
						'[서버 링크](https://discord.gg/NrXWKynJRB)',
					inline: false,
				},
				{
					name: '후원',
					value: '자취생 개발자는 항상 돈에 쪼들려 삽니다.. ' + '\n' + 
						   '적은 돈이라도 서버 호스팅 비용에 쓸 수 있으니 많은 후원 부탁드립니다.' + '\n' +
						   '[투네이션 후원 링크](https://toon.at/donate/playteddypicker)',
					inline: false
				},
			);

		const functionsMessage = await interaction.editReply({
			embeds: [helpPage],
			components: [row1, row2],
			fetchReply: true,
		});

		const awaitInteraction = (imsg) => imsg.awaitMessageComponent({
			filter: i => i.user.id === interaction.user.id && i.isButton(), // && imsg.message.id === i.message.id,
			time: 300e3,
		}).then(i => (i.isButton()) ? i : null).catch(() => null);

		const button = await awaitInteraction(functionsMessage);

		switch(button.customId){
			case 'helpmusicplay':
				await buttonreactionpages(button, helpmusicplayEmbeds, true);
				break;

			case 'helpmusicplayer':
				await buttonreactionpages(button, helpmusicplayerEmbeds, true);
				break;

			case 'helpadminsetting':
				await buttonreactionpages(button, helpadminsettingEmbeds, true);
				break;

			case 'helpothers':
				await buttonreactionpages(button, helpothersEmbeds, true);
				break;

			case 'closehelpwindow':
				return await interaction.deleteReply();
				break;
		}
	}
}
