const { SlashCommandBuilder } = require('@discordjs/builders');

const userfavor = new Map();
const beatscript1 = [
	"이제 그만...",
  "정말 때리실거에요..?",
  "그만 맞고싶어요...",
  "제발 그만...",
  "나는 관계 없어... 나는 관계 없어...",
  "...",
  "오늘도...",
  "ㅁ..머드락씨... 안돼요..!!",
  "좀 적당히좀 해주시면 안될까요?",
  "헤헤..버그..일으킨ㄷㅏ...헤ㅎㅔ..",
];
const beatscript2 = [
      "https://story-img.kakaocdn.net/dn/bVu8Lx/hyKVlkhINP/iFtbvidY62QORIUkUj0mRK/img_xl.jpg?width=1000&height=1100&avg=%2523d4d4d4&v=2", //줘팸짤 1
      "https://story-img.kakaocdn.net/dn/b8V1iA/hyKWKcyh8O/WhxmuCykBw5EezEmeCO3C0/img_xl.jpg?width=198&height=198&avg=%2523d0d0d0&v=2", //슨상이 질질짜는짤
      "https://story-img.kakaocdn.net/dn/bQxP61/hyKU9D9Jjb/PD6nkxgNkb2dDZlQrdAm10/img_xl.jpg?width=198&height=196&avg=%2523c4c1bd&v=2", //슨상좀 애껴 짤
      "https://story-img.kakaocdn.net/dn/bROIkD/hyKVeZKlCl/FDMP6Rh09i60nnyyITOPnk/img_xl.jpg?width=1060&height=694&avg=%2523b5b5b5&v=2", //줘팸짤 2
      "https://story-img.kakaocdn.net/dn/dYh9PB/hyKVkeB1YJ/Vs7sW5LCWfOsROmdwF0zck/img_xl.jpg?width=198&height=194&avg=%2523cecece&v=2", //모른척 슨상
      "https://story-img.kakaocdn.net/dn/ce4Vwr/hyKU86jamN/JZYYYcbSPVGzAvHQZ8ZDb0/img_xl.jpg?width=202&height=198&avg=%2523a8a8a8&v=2", //슨상싸대기
      "https://story-img.kakaocdn.net/dn/bft0eL/hyKVdmhnkp/WxD0bo6mx4i0MlmmIkDyvK/img_xl.jpg?width=202&height=196&avg=%2523a2a2a2&v=2", //슨상한숨
      "https://story-img.kakaocdn.net/dn/V4Q7w/hyKZ35nuns/aqI6PBHYy5SyvzFuMn9iKk/img.gif?width=755&height=502&avg=%252340485c&length=8248142&ani=1&duration=3300&v=2", //슨상함마찍기
      "https://story-img.kakaocdn.net/dn/cmKqEq/hyK2JyJlHn/n6vmsOHpiOWomEQkVl4Ifk/img_xl.jpg?width=1000&height=1000&avg=%2523c1bab3&v=2", //슨상매도
      "https://story-img.kakaocdn.net/dn/djAM0a/hyLlcmBfHh/lULoprkWCXJKBQIVFTVcH0/img_xl.jpg?width=1353&height=1056&avg=%2523e7e7e7&v=2", //슨상버그
];

const aekkimscript = [
      "헤헤...",
      "저.. 저 말인가요..?",
];
const confusescript = [
      "아무리 저라도.. 박사님은 좀..",
      "그만좀 치근덕대세요..",
      "사람 가지고 노시면 재밌나요?",
      "이제 박사님은 믿을수가 없어요..",
      "후...",
      "아까 저 엄청 때리신건 기억 못하시나봐요?",
      "제시카씨가 그러는데.. 박사님같은 사람은 멀리하래요..",
      "제가 뭘 잘못했다고 그러시는건가요...?",
      "박사님은 밥을 허버허버 드시네요..",
      "어지간히 할 일이 없으신가봐요..",
      "그... 없으신가..?",
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('슨상')
		.setDescription('고유 명령어')
		.addSubcommand(subcmd =>
			subcmd
				.setName('줘팸')
				.setDescription('정말 그러실건가요..?'))
		.addSubcommand(subcmd =>
			subcmd
				.setName('존나팸')
				.setDescription('....'))
		.addSubcommand(subcmd =>
			subcmd
				.setName('개씨발존나게팸')
				.setDescription('하아...'))
		.addSubcommand(subcmd =>
			subcmd
				.setName('호감도')
				.setDescription('...'))
		.addSubcommand(subcmd =>
			subcmd
				.setName('애낌')
				.setDescription('헤헤...'))
		.addSubcommand(subcmd =>
			subcmd
				.setName('아무말')
				.setDescription('ㄱ-')),
	async execute(interaction) {
		const userprofile = {
      recentcmd : '',
      countbeat: 0,
      countaekkim: 0,
      favor: 19,
      zipchak: 0,
      shipchang: '',
    }
    if(!userfavor.get(interaction.member.id)) userfavor.set(interaction.member.id, userprofile);
    let rand = Math.floor(Math.random() * Number(beatscript1.length));
    let rand1 = Math.floor(Math.random() * Number(aekkimscript.length));
    let rand2 = Math.floor(Math.random() * Number(confusescript.length));

    switch (interaction.options.getSubcommand()){
      case '줘팸': //줘팬다고 하면
        if(userfavor.get(interaction.member.id).favor > 0) {  //호감도가 0보다 클때
          interaction.reply({content: beatscript1[rand], files: [`${beatscript2[rand]}`]}); //일단 줘팸
          userfavor.get(interaction.member.id).favor -= 5; //호감도 5 하락
        }else{
          interaction.reply({content: beatscript1[8], files: [`${beatscript2[8]}`]}); //호감도가 0 이하면 매도함
          userfavor.get(interaction.member.id).favor -= 10; //호감도 10 하락
        }
        userfavor.get(interaction.member.id).recentcmd = '줘팸'; 
        userfavor.get(interaction.member.id).zipchak = 0;
        break;

      case '존나팸':
        rand = (rand < Number(beatscript1.length) / 2) ? 0 : 3;
        await interaction.reply({content:beatscript1[rand], files: [`${beatscript2[rand]}`]}); //확정적으로 존나쌔게팸
        userfavor.get(interaction.member.id).favor -= 20; //대신 호감도는 20 하락
        userfavor.get(interaction.member.id).recentcmd = '존나팸';
        userfavor.get(interaction.member.id).zipchak = 0;
        break;

      case '애낌': //애끼면
        if(userfavor.get(interaction.member.id).zipchak > 5){
          interaction.reply({content: '저기.. 그... 좀 부담스럽네요...', files: ["https://story-img.kakaocdn.net/dn/bkLGwY/hyLxFoeMhQ/9VyY0TCF3ooVyYRmchuUiK/img_xl.jpg?width=1500&height=1355&avg=%2523eeeeee&v=2"]});
          userfavor.get(interaction.member.id).zipchak = 0;
          userfavor.get(interaction.member.id).favor -= 50;
        }else{
          if(userfavor.get(interaction.member.id).favor < 0) { //호감도가 0 밑이면
            interaction.reply(confusescript[rand2]); //슨상이 혼란해함
          }else{
            interaction.reply(aekkimscript[rand1]); //호감도가 0 이상이면 애낌
            userfavor.get(interaction.member.id).favor += 2; //호감도 2 상승
            userfavor.get(interaction.member.id).zipchak += 1;
          }
        }
        break;

      case '호감도':
        let favor = userfavor.get(interaction.member.id).favor;
        if(favor > 30) interaction.reply('헤헤..');
        else if(favor > 0) interaction.reply('아..안녕하세요...');
        else if(favor < -1000) interaction.reply({content: '인과응보에요!', files: ["https://story-img.kakaocdn.net/dn/cEApyn/hyLyvfhoXV/VydGOtGPvMjTby84xE9Nt0/img_xl.jpg?width=1755&height=1379&avg=%2523725d4b&v=2"]});
        else if(favor < -100) interaction.reply('씨발진짜');
        else if(favor < 0) interaction.reply('...');
        else if(favor == 0) interaction.reply('. . .');
        break;

			case '개씨발존나게팸':
				interaction.reply('가끔은 자신을 돌아보는것도 좋을 것 같아요..');
				break;

			case '아무말':
				const script = [
	'바, 박사님, 죄송합니다, 잠깐 실례 좀 할게요. 발 밑에 동전이...',
  '저는 꼭 매일 3끼 디저트까지 해서 먹을 거예요!',
  '이 이상 연구과제를 늘린다면 1일 2식에서 2일 1식이 되어버리겠네… 으으..',
  '박사님도 제 작품을 보고 싶으신가요?',
  '어질어질하네요...',
  '아으으..',
  '으… 어제 집무실을 나설 때 불 끄는 걸 잊었어요.',
  '오늘 받은 의뢰는 돈이 제때 들어올까요..',
  '씨..씨발련아..!! 헉.. 아니.. 박사님께 한 말은 아니에요..! 으으..',
  '헤헤...박사님..',
  '제시카씨에게 빌린 돈은 언제 갚지..',
  '오늘 밥 사주신다는 약속.. 잊지 않으..셨..죠..?',
  '하아... 오늘 저녁은 어떻게 떼울까..',
  '으아아.. 또 지갑에 구멍이..',
  '박사님은 밥을 허버허버 드시네요..',
  '쉬고싶다..',
  '어지간히 할 일이 없으신가봐요..',
  'ㅈ..줘팸..멈춰...!!',
];
				const rand3 = Math.floor(Math.random() * Number(script.length));	

			await interaction.reply({
				content: script[rand3]
			});


				break;
    }
	}
}
