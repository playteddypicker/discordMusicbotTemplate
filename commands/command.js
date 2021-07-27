const ReactionPages = require('./reactionpages.js');
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: 'help',
  description: "명령어",
  execute(client, message, cmd, args, Discord){

    const textPageChange = true;
    const emojis = ["⬅", "➡"];
    const time = 60000;

    const embed1 = new Discord.MessageEmbed()
    .setColor('#FF6F61')
    .setTitle('슨상이 0.1.3')
    .setURL('https://www.youtube.com/watch?v=VcWKjl61lpk')
    .setDescription('기본 명령어')
    .addFields(
      {name: './아무말', value: '아무말이나 해드려요..', inline: true},
      {name: './줘팸', value: '그러지 마세요 박사님 ㅠㅠ', inline: true},
      {name: './help', value: '제가 할 수 있는 것을 보여드려요..', inline: true},
      {name: './image <이름>', value: '입력하신걸 이미지검색해서 첫빠따로 나온걸 보여드려요. <<< 지금 모듈이 막혀서 사용 불가!', inline : false},
      {name: './botinfo', value: '슨상이 봇에 대한 기본 정보와 지금까지의 패치 노트를 보여드립니다.', inline: false},
    )
    .setThumbnail('https://pbs.twimg.com/profile_images/1300805768778854401/bYRL-rMO_400x400.jpg')
    .setFooter('그만 때리세요..')

    const embed2 = new Discord.MessageEmbed()
    .setColor('#FF6F61')
    .setTitle('슨상이 0.1.3 - pre v1')
    .setURL('https://www.youtube.com/watch?v=VcWKjl61lpk')
    .setDescription('음악 명령어: 기본 기능')
    .addFields(
      {name: './play | p', value: '노래를 재생해요. \n제목, 링크, 플레이리스트로 추가할 수 있어요.', inline: false},
      {name: './pause', value: '노래를 일시정지해요. 다시 쳐서 재개해요.', inline: false},
      {name: './skip | s', value: '노래를 스킵해요.', inline: false},
      {name: './stop', value: '노래를 멈추고 대기중인 모든 노래를 지워요.', inline: false},
      {name: './leave', value: '음성 채널을 나가요.', inline: false},
      {name: './queue | q', value: '대기열 리스트를 보여드려요.', inline: false},
      {name: './np', value: '지금 재생 중인 노래의 정보를 보여드려요.', inline: false},
      {name: './setup', value: '음악 플레이어를 세팅해요. 다시 입력해서 음악 플레이어를 지울 수 있어요.', inline: false},
    )
    .setThumbnail('https://pbs.twimg.com/profile_images/1300805768778854401/bYRL-rMO_400x400.jpg')
      .setFooter('그만 때리세요..')

    const embed3 = new Discord.MessageEmbed()
    .setColor('#FF6F61')
    .setTitle('슨상이 0.1.3 - pre v1')
    .setURL('https://www.youtube.com/watch?v=VcWKjl61lpk')
    .setDescription('음악 명령어 : 고급 기능')
    .addFields(
      {name: './dq | delqueue | delq x (y)', value: '대기열의 x번째부터 y번째까지의 노래를 지워요.\n y를 입력 안하면 x번째 노래만 지워요.', inline: false},
      {name: './jump x', value: '대기열의 x번으로 노래를 점프해요.', inlune: false},
      {name: './shuf | shuffle', value: '대기열의 노래를 섞어요.', inline: false},
      {name: './v | volume <N>', value: '볼륨을 N%로 바꿔요. ', inline: false},
      {name: './loop | lp', value: '현재 재생 중인 노래를 반복해요.', inline: false},
      {name: './loop auto | a', value: '지금 재생 중인 노래를 유튜브 추천 곡으로 계속 자동 재생해요.', inline: false},
      {name: './move | mv x y', value: '대기열 x번 노래를 y번의 위치로 옮겨요.', inline: false},
      {name: './switch | ch x y', value: '대기열의 x번 노래와 y번 노래의 위치를 서로 바꿔요.', inline: false},
    )
    .setThumbnail('https://pbs.twimg.com/profile_images/1300805768778854401/bYRL-rMO_400x400.jpg')
      .setFooter('그만 때리세요..')

    const pages = [embed1, embed2, embed3];

    ReactionPages(message, pages, true);
  }
}
