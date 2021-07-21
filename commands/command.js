const recon = require("reconlx");
const ReactionPages = recon.ReactionPages;
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: 'help',
  description: "명령어",
  execute(client, message, cmd, args, Discord){

    const textPageChange = true;
    const emojis = ["⬅", "➡"];
    const time = 60000;

    const embed0 = new Discord.MessageEmbed()
    .setColor('#FF6F61')
    .setTitle('슨상이 0.1.1v')
    .setURL('https://www.youtube.com/watch?v=VcWKjl61lpk')
    .setDescription('봇 기본 정보')
    .addFields(
       {name: '제작자', value: 'Discord: TeddyPicker#0689 \nInstagram: takemyword_4it', inline: false},
       {name: '기능', value: '간단한 봇 상호작용과 음악 플레이어 봇 기능이 있는 다기능성 봇입니다.', inline: false},
    )
    .setThumbnail('https://static.wikia.nocookie.net/fantendo/images/d/d5/SMM2_Cape_Toadette.png/revision/latest/scale-to-width-down/250?cb=20190726170458')
    .setFooter('이히히')


    const embed1 = new Discord.MessageEmbed()
    .setColor('#FF6F61')
    .setTitle('슨상이 0.1.1v')
    .setURL('https://www.youtube.com/watch?v=VcWKjl61lpk')
    .setDescription('기본 명령어')
    .addFields(
      {name: './아무말', value: '아무말이나 해드려요..', inline: true},
      {name: './줘팸', value: '그러지 마세요 박사님 ㅠㅠ', inline: true},
      {name: './help', value: '제가 할 수 있는 것을 보여드려요..', inline: true},
      {name: './image <이름>', value: '입력하신걸 이미지검색해서 첫빠따로 나온걸 보여드려요.', inline : true},
    )
    .setThumbnail('https://pbs.twimg.com/profile_images/1300805768778854401/bYRL-rMO_400x400.jpg')
    .setFooter('그만 때리세요..')

    const embed2 = new Discord.MessageEmbed()
    .setColor('#FF6F61')
    .setTitle('슨상이 사용법')
    .setURL('https://www.youtube.com/watch?v=VcWKjl61lpk')
    .setDescription('음악 명령어')
    .addFields(
      {name: './play | p', value: '노래를 재생해요. \n 제목, 링크, 플레이리스트로 추가할 수 있어요.', inline: false},
      {name: './pause', value: '노래를 일시정지해요. 다시 쳐서 재개해요.', inline: false},
      {name: './skip | s', value: '노래를 스킵해요.', inline: false},
      {name: './stop', value: '노래를 멈추고 대기중인 모든 노래를 지워요.', inline: false},
      {name: './leave', value: '음성 채널을 나가요.', inline: false},
      {name: './queue | q', value: '대기열 리스트를 보여드려요.', inline: false},
      {name: './dq | delqueue | delq x (y)', value: '대기열의 x번째부터 y번째까지의 노래를 지워요.\n y를 입력 안하면 x번째 노래만 지워요.', inline: false},
      {name: './jump x', value: '대기열의 x번으로 노래를 점프해요.', inlune: false},
      {name: './np', value: '현재 재생 중인 노래의 정보를 보여드려요.', inline: false},
      {name: './shuf | shuffle', value: '대기열의 노래를 섞어요.', inline: false},
      {name: './v | volume <N>', value: '볼륨을 N%로 바꿔요. ', inline: false},
      {name: './loop | lp', value: '현재 재생 중인 노래를 반복해요.', inline: false},
      {name: './move | mv x y', value: '대기열 x번 노래를 y번의 위치로 옮겨요.', inline: false},
      {name: './switch | ch x y', value: '대기열의 x번 노래와 y번 노래의 위치를 서로 바꿔요.', inline: false},
      {name: './auto', value: '현재 재생 중인 노래를 유튜브 추천 곡으로 반복 재생해요.', inline: false}
    )
    .setThumbnail('https://pbs.twimg.com/profile_images/1300805768778854401/bYRL-rMO_400x400.jpg')
      .setFooter('그만 때리세요..')

    const embed3 = new Discord.MessageEmbed()
      .setColor('#FF6F61')
      .setTitle('0.1.1v : 지금까지 알려진 버그 & 패치노트')
      .setDescription('안고쳐진 버그 리스트')
      .addFields(
        {name: './pause', value: 'pause는 한번 하고 다시 한번 해도 다시 안틀어져요. 이때는 pause를 두번 더 쳐주세요.', inline: false},
        {name: '노래 끊김 버그', value: '노래 틀다가 큐에 노래 새로 추가하면 끊기는 버그입니다. 근본적인 문제는 아마 코드를 한 파일에 다 때려넣어서 그런것 같습니다. 이 문제 해결은 좀 후순위라서 조금 불편하시겠지만 감수해주세요.', inline: false},
        {name: 'loop/skip 버그', value:'루프를 키고 스킵하면 위에 노래 끊김 버그가 가끔 생깁니다. 마찬가지로 초기화 해주시면 됩니다.', inline: false},
        {name: 'auto 버그', value: '유튜브에서 추천 노래 못찾으면 다시 찾게 할 계획입니다. 가끔 안먹혀요..', inline: false},
        {name: '패치노트 1', value: ':: loop모드를 둘 중 하나만 킬 수 있게 해놨어요. 큐 루프인 상태에서 싱글루프를 키면 큐 루프가 꺼지고 싱글루프가 켜집니다. 반대도 마찬가지고요. loop/skip버그도 해결됐습니다.', inline: false},
        {name: '패치노트 2', value: ':: 전체적으로 코드를 최적화해 유튜브 검색같은 외부모듈이 아닌 이상 전보다 빠릿하게 작동하도록 했습니다.', inline: false},
        {name: '패치노트 3', value: ':: 그래도 다른 버그가 생기면 stop으로 아예 봇을 멈췄다 play로 다시 틀 수 있게 해놨습니다. ', inline: false},
        {name: '패치노트 4', value: ':: 기타 오타를 수정했습니다.', inline: false},
        {name: '패치노트 5', value: ':: np/queue 커맨드는 이제 음성 채널에 연결되어있지 않아도 쓸 수 있습니다. 얘네들이 어떤 노래를 듣나 확인할 수 있게요.', inline: false},
        {name: '버그 문의', value: 'TeddyPicker#0689 개인 DM 남겨주세요. 적극 반영하겠습니다. 굳이 버그가 아니더라도 개선점이나 아이디어 있으시면 언제든지 피드백해주세요.', inline: false},
      )

    const pages = [embed0, embed1, embed2, embed3];

    ReactionPages(message, pages, true);
  }
}
