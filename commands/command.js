const ReactionPages = require('./reactionpages.js');
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: 'help',
  description: "명령어",
  execute(client, message, cmd, args, Discord){

    const embed1 = new Discord.MessageEmbed()
    .setColor('#FF6F61')
    .setURL('https://www.youtube.com/watch?v=VcWKjl61lpk')
    .setDescription('기본 명령어')
    .addFields(
      {name: './아무말', value: '아무말이나 해드려요..', inline: true},
      {name: './줘팸', value: '그러지 마세요 박사님 ㅠㅠ', inline: true},
      {name: './help', value: '제가 할 수 있는 것을 보여드려요..', inline: true},
      {name: './exp', value: '경험치 계산기 사용법을 보여드려요.', inline: false},
      {name: './botinfo', value: '슨상이 봇에 대한 기본 정보와 지금까지의 패치 노트를 보여드립니다.', inline: false},
    )
    .setThumbnail('https://pbs.twimg.com/profile_images/1300805768778854401/bYRL-rMO_400x400.jpg')
    .setFooter('그만 때리세요..')

    const embed2 = new Discord.MessageEmbed()
    .setColor('#FF6F61')
    .setURL('https://www.youtube.com/watch?v=VcWKjl61lpk')
    .setDescription('음악 명령어: 기본 기능')
    .addFields(
      {name: './play | p', value: '노래를 재생해요. \n제목, 링크, 플레이리스트로 추가할 수 있어요.', inline: false},
      {name: './pause', value: '노래를 일시정지해요. 다시 쳐서 재개해요.', inline: false},
      {name: './skip | s', value: '노래를 스킵해요.', inline: false},
      {name: './eject', value: '모든 노래를 지우고 음성 채널을 나가요.', inline: false},
      {name: './stop', value: '노래를 멈추고 큐를 초기화해요.', inline: false},
      {name: './queue | q', value: '대기열 리스트를 보여드려요.', inline: false},
      {name: './np', value: '지금 재생 중인 노래의 정보를 보여드려요.', inline: false},
    )
    .setThumbnail('https://pbs.twimg.com/profile_images/1300805768778854401/bYRL-rMO_400x400.jpg')
      .setFooter('그만 때리세요..')

    const embed3 = new Discord.MessageEmbed()
    .setColor('#FF6F61')
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
      {name: './search | sch <검색어>', value: '검색어를 유튜브에 검색하고 모든 검색 결과를 채팅으로 보여줘요.', inline: false},
      {name: './select | ./sl <번호>', value: '최근 검색한 결과 중 원하는 번호의 영상을 큐에 넣거나 재생해요.\n한 번이라도 search커맨드를 써서 검색을 해야 사용 가능해요!', inline: false},
    )
    .setThumbnail('https://pbs.twimg.com/profile_images/1300805768778854401/bYRL-rMO_400x400.jpg')
      .setFooter('그만 때리세요..')

    const embed4= new Discord.MessageEmbed()
    .setColor('#FF6F61')
    .setURL('https://www.youtube.com/watch?v=VcWKjl61lpk')
    .setDescription('음악 명령어 : 플레이어 기능')
    .addFields(
      {name: './setup', value: '음악 플레이어를 세팅해요. 다시 입력해서 플레이어를 지울 수 있어요.', inline: false},
      {name: '기본 사용법', value: "'슨상플레이어'라는 채널에 채팅으로 명령어 접두사 없이 그냥 쌩으로 노래제목/링크/플레이리스트를 치면 노래가 재생돼요.\n\n 버튼 상호작용은 \n⏯️:: 노래 일시정지 | 다시재생 \n⏹️ : 노래 멈추고 대기 중인 모든 노래 제거, 모든 상태(루프 등) 초기화\n⏏️: : 노래 멈추고 모든 노래 제거, 초기화, 음성 채널 나감\n⏭️ :노래 스킵 \n🔀 : 큐 셔플 \n🔂 : 싱글 루프 \n🔁 : 큐 루프 \n♾️ : 자동 재생 모드", inline: false},
      {name: '추가기능', value: "📶를 눌러서 추가 버튼 기능을 사용해요.\n\n🔈 : 볼륨 10% 감소 \n🔊 : 볼륨 10% 증가 \n❌ : 대기열 맨 마지막 노래 지우기 \n⤴️ : 다음 곡을 대기열 맨 뒤로 옮기기 \n⤵️ : 대기열 맨 마지막 노래를 맨 앞으로 옮기기", inline: false},
      {name: '주의사항', value: '만약 플레이어가 말을 듣지 않는다면 setup커맨드를 두번 쳐서 플레이어 채널을 삭제했다가 다시 만들어주세요.\n\n절대로 슨상플레이어 채널을 임의로 이름을 바꾸거나, 삭제하시거나, 새로 만드시면 안됩니다! 나중에 이름을 바꿀 수 있게 패치할 에정입니다.', inline: false},
    )
    .setThumbnail('https://pbs.twimg.com/profile_images/1300805768778854401/bYRL-rMO_400x400.jpg')
      .setFooter('그만 때리세요..')

    const pages = [embed1, embed2, embed3, embed4];

    ReactionPages(message, pages, true);
  }
}
