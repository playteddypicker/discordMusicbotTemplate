const ReactionPages = require('./reactionpages.js');
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: 'botinfo',
  description: '봇 기본 정보',
  execute(client, message, cmd, args, Discord){
    
    const embed0 = new Discord.MessageEmbed()
      .setColor('#FF6F61')
      .setTitle('현재 버전 : 슨상이 0.2.4v')
      .setDescription('봇 기본 정보')
      .addFields(
       {name: '제작자', value: 'Discord: TeddyPicker#0689 \nInstagram: <고로시 방지를 위해 잠깐 닫아둠>', inline: false},
        {name: '기능', value: '간단한 봇 상호작용과 음악 플레이어 봇 기능이 있는 다기능성 봇입니다.', inline: false},
        {name: '기타 정보', value: `**현재 슨상이를 쓰고있는 서버 수** : ${client.guilds.cache.size} \n**개발자 디스코드 채널** : https://discord.gg/8KNJCWNgM6`},
        {name: '개발자의 한마디', value: ' 아직 1학년이라 공부해야할 것도 많고, 연말 직전까지 개인 사정때문에 굉장히 바쁘기때문에 슨상이 봇 개발할 여유가 없을 것 같습니다. 앞으로 슨상이 업데이트는 버그 제보만 받아 디버깅만 하고 추가적인 기능은 0.2.4버전을 끝으로 당분간 추가하지 않을 예정입니다. 그래도 나중에 12월쯤 가면 여유가 생기니 그때는 개인 서버도 구축하고 지금까지 보은 버그도 잘 정리하고 같이 개발할 사람도 구해서 배포할 것을 계획하고 있습니다.  그냥 언어 하나 더 배워보자고 독학으로 시작한건데 제 부족한 실력으로 짠 봇인데도 잘 써주셔서 감사합니다.', inline: false},
      )
      .setThumbnail('https://static.wikia.nocookie.net/fantendo/images/d/d5/SMM2_Cape_Toadette.png/revision/latest/scale-to-width-down/250?cb=20190726170458')
      .setFooter('이히히');

    const embed024 = new Discord.MessageEmbed()
      .setColor('#FF6F61')
      .setTitle('슨상이 0.2.4')
      .addFields(
        {name: '패치노트', value: "- 음악 플레이어 코드를 최적화했습니다. \n- 명일방주 경험치 계산기가 추가되었습니다. help로 확인해보세요.", inline: false},
      )
    const embed023 = new Discord.MessageEmbed()
      .setColor('#FF6F61')
      .setTitle('슨상이 0.2.3v')
      .addFields(
        {name: '패치노트', value: "- pause명령어 및 플레이어의 일시정지/재생 버튼이 이제 잘 작동합니다. \n- 플레이어기능 버튼 추가 : help로 확인해보세요. \n- 버그 수정, 코드 최적화했습니다. \n- 아무말 커맨드에 대사 추가했습니다.", inline: false}
      )

    const embed020 = new Discord.MessageEmbed()
      .setColor('#FF6F61')
      .setTitle('슨상이 0.2.2')
      .setDescription('0.2.2')
      .addFields(
        {name: '패치노트 1', value: 'Image커맨드 삭제. 모듈이 에러나서 아예 못써서 그냥 삭제했습니다.', inline: false},
        {name: '패치노트 2', value: '코드를 이전보다 매우매우매우 최적화했습니다.. 아예 구조 자체를 바꾸는 작업이라 매우 힘들었습니다,, 이제 검색으로 큐 넣을때도 덜 끊김 << 개씹중요', inline: false},
        {name: '패치노트 3', value: 'stop으로 완전한 큐 초기화 가능', inline: false},
        {name: '패치노트 4', value: '버그 발생해도 봇 안망가지게 바꿈(1차, 완전하지않음)', inline: false},
        {name: '패치노트 5', value: 'search커맨드 추가. 유튜브에서 노래 검색 후 추가 가능합니다. help로 확인해보세요', inline: false},
        {name: '패치노트 6', value: '플레이어 기능 완성. help로 확인해보세요.', inline: false},
        {name: '패치노트 7', value: 'np커맨드에서 이제 타임라인 진행 바를 볼수 있어요.', inline: false},
        {name: '패치노트 8', value: 'stop으로 초기화하거나 초기화된 봇 상태에서 다시 플레이어를 사용할떄 플레이어가 먹통이 되는 버그를 수정했어요.', inline :false},
        {name: '패치노트 9', value: '이제 음악 스트리밍 하다가 모든 사람이 나가면 슨상이도 눈치봐서 알아서 나갑니다.', inline: false},
        {name: '패치노트 10', value: 'stop으로도 봇이 완전히 초기화되지 않는 버그 수정했습니다. 이제 stop커맨드를 치면 봇이 완전히 나갑니다. 큐 노래만 초기화하려면 inq 명령어를 써주세요.', inline: false},
      )
      .setThumbnail('https://static.wikia.nocookie.net/fantendo/images/d/d5/SMM2_Cape_Toadette.png/revision/latest/scale-to-width-down/250?cb=20190726170458')
      .setFooter('이히히');
    
    const embed013 = new Discord.MessageEmbed()
      .setColor('#FF6F61')
      .setTitle('슨상이 0.1.3')
      .setDescription('0.1.3')
      .addFields(
       {name: '패치노트 1', value: '음악 플레이어 기능이 추가되었습니다. 이제 버튼식 상호작용으로 노래를 컨트롤 할 수 있어요.\n아직은 베타라 버그가 아주 많으니 안쓰셔도 됩니다~', inline: false},
       {name: '패치노트 2', value: '큐에 노래를 추가할때 이 노래가 틀어지려면 얼마나 기다려야하는지 출력해줍니다.\n큐 추가할때 나오는 텍스트가 세련되게 바뀌었어요.', inline: false},
       {name: '패치노트 3', value: '줘팸 커맨드에 이벤트가 하나 더 추가됐습니다.', inline: false}, 
       {name: '패치노트 4', value: '큐 루프 상태에서 shuf, mv, sw를 쓰면 현재 곡도 상호작용되는 버그를 고쳤습니다.', inline: false},
       {name: '패치노트 5', value: '이제 연결 관련 버그가 생기면 ./leave로 완전히 봇을 초기화할 수 있습니다.', inline: false},
       {name: '패치노트 6', value: '서버 별 플레이리스트 큐를 구현해서 이제 다른 서버에서 동시에 노래 틀어도 플레이리스트가 서로 겹치지 않습니다.', inline: false},
      )
      .setThumbnail('https://static.wikia.nocookie.net/fantendo/images/d/d5/SMM2_Cape_Toadette.png/revision/latest/scale-to-width-down/250?cb=20190726170458')
      .setFooter('이히히');

    const embed012 = new Discord.MessageEmbed()
      .setColor('#FF6F61')
      .setTitle('0.1.2v : 지금까지 알려진 버그 & 패치노트')
      .setDescription('개선점은 DM이나 디스코드 맨션해주세요!')
      .addFields(
        {name: '페치노트 1', value: '- 코드 최적화(엄청 최적화함)', inline: false},
        {name: '패치노트 2', value: '- 노래 튼 상태에서 큐에 노래 추가할때 플레이리스트, 링크는 노래 안끊기도록 했습니다.\n그냥 검색해서 추가할때는 노래가 살짝 끊기는데 이전보다는 덜합니다.', inline: false},
        {name: '패치노트 3', value: '- auto모드에서 다음곡으로 넘어갈때 queue가 출력 안되는 버그 수정', inline: false},
        {name: '패치노트 4', value: '- Auto 명령어를 loop 안에 포함시킴', inline: false},
        {name: '패치노트 5', value: '- 플레이리스트 검색에서 실패하면 가이드라인 줌', inline: false},
        {name: '패치노트 6', value: '- 큐 단위 루프 후 중간 대기열의 노래를 재생 중일때 큐 단위 루프를 해제하면 스킵이 멋대로 되거나 큐가 이상해지는 버그 수정', inline: false},
        {name: '패치노트 7', value: '- 자동 재생 모드에서 다음곡 소개할때 현재곡 보여주는 인터페이스를 좀 더 간략하게 수정', inline: false},
        {name: '패치노트 8', value: '- 큐 볼때 현재곡 인터페이스를 간략하게 수정', inline: false},
      )
      .setThumbnail('https://static.wikia.nocookie.net/fantendo/images/d/d5/SMM2_Cape_Toadette.png/revision/latest/scale-to-width-down/250?cb=20190726170458')
      .setFooter('이히히')
    
    const embed011 = new Discord.MessageEmbed()
      .setColor('#FF6F61')
      .setTitle('0.1.1v : 지금까지 알려진 버그 & 패치노트')
      .setDescription('개선점은 DM이나 디스코드 맨션해주세요!')
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
    .setThumbnail('https://static.wikia.nocookie.net/fantendo/images/d/d5/SMM2_Cape_Toadette.png/revision/latest/scale-to-width-down/250?cb=20190726170458')
      .setFooter('이히히');

    const embedss1 = new Discord.MessageEmbed()
      .setColor('#FF6F61')
      .setTitle('스노우상트 : 대원 기본 정보')
      .setURL('https://www.youtube.com/watch?v=VcWKjl61lpk')
      .setDescription('로도스 아일랜드 스페셜리스트 오퍼레이터 스노우상트, 독특한 산업용 후크를 사용해 색다른 전술경험을 보여준다.\n\n"용문 기계 디자인 대회 1등상을 받은 적이 있다."')
      .addFields(
        {name: '포지션', value: '스페셜리스트', inline: true},
        {name: '생일', value: '10월 17일', inline: true},
        {name: '특기', value: '산업 디자인, 수리, 노력, 근검절약', inline: true},
        {name: '프로필', value: '용문 출신인 오퍼레이터 스노우상트는 과거 컬럼비아의 한 신기술개발구역에서 다양한 과학기술연구를 진행한 경력이 있다.\n이후 용문으로 돌아와 근무하던 중, 로도스 아일랜드와 계약을 맺게 되었다.', inline: false},
        {name: '임상진단분석', value: '방사선 검사 결과, 본 오퍼레이터는 내장 기관의 윤곽이 선명하며, 비정상적인 음영이 존재하지 않는 것으로 확인됨.\n순환 계통 내 오리지늄 입자 검사 결과 이상 없음, 광석병 감염 증세 없음, 현단계로서는 광석병 비감염자로 확인됨.\n\n[체세포와 오리지늄 융합률] 0%\n오퍼레이터 스노우상트는 광석병에 감염된 흔적이 없음.\n\n[혈중 오리지늄 결정 밀도] 0.14u/L\n오퍼레이터 스노우상트는 과학기술 연구 등의 목적으로 가끔씩 오리지늄과 접촉하지만 아직 감염의 위험성은 없어 보임. 차후 정기적 검진 필요.\n\n', inline: false},
        {name: '승진 기록', value: "컬럼비아에서 가장 힘들었던 시절, 스노우상트는 차별과 배척으로 인해 더 많은 연구에 참여할 수 있는 기회를 여러 차례 놓치고 말았다. 스노우상트의 몇 안 되는 연구 성과가 연구소에 의해 도용되고, 연구 자금도 연구소에 빼앗겼다는 사실을 알았을 때도, 그녀는 간단한 대응조차 못 한 채 그저 컬럼비아의 시끌벅적한 거리를 헤멜 뿐이었다. 모든 계획이 망가져버린 그때, 그녀는 할머니가 용문을 떠나면서 자신에게 남긴 보자기를 꺼내보았는데, 그 안에는 '하늘은 스스로 돕는 자를 돕는다'라는 문구가 적힌 한 장의 메모만이 들어있었다.\n비록 현재 상황에서 아무런 도움이 되지 않는 말이긴 했지만, 스노우상트는 기운을 차리고 그 메모를 소중히 간직하기로 하였다.\n하늘은 스스로 돕는 자를 돕는다. 사흘 후 스노우상트는 용문 고위 관계자로부터 스카우트 제의를 받게 되었고, 연구소에선 뒤늦게 이 사실을 알고는 높은 연봉을 제시하여 그녀를 붙잡아 두려 했지만 스노우상트에게 퇴짜를 맞고 말았다. 이렇게 해서 스노우상트는, 전에는 느껴보지 못했던 들뜬 마음으로 고향에 돌아오게 되었다.", inline: false},
      )
      .setThumbnail('https://pbs.twimg.com/profile_images/1300805768778854401/bYRL-rMO_400x400.jpg')

    const embedss2 = new Discord.MessageEmbed()
      .setColor('#FF6F61')
      .setTitle('스노우상트 : 대원 상세 기록')
      .setURL('https://www.youtube.com/watch?v=VcWKjl61lpk')
      .setDescription('대원 스노우상트, 용문의 연구학자 출신으로 타고난 노력가지만 아직도 왜 갑자기 자신이 전쟁터에 나가는지 이해를 못한다.\n\n하층민 출신인 그녀는 자신의 노력으로 독학으로 지식을 쌓고, 어렵게 모은 약간의 저축을 털어 컬럼비아로 건너가 꿈을 쫒아갔다. 많은 좌절과 시련에도 불구하고 스노우상트는 자신의 이상을 위해 끊임없이 노력하고 있다.\n\n이상이 뭘까? 당연히 출세다! 천조자조(天道酬勤)는 그녀의 유일한 신념이다! 노력이다! 보상이 있을거다! 맞아! 아마도......!\n\n역설적이게도, 개성이 판이한 다양한 인재들이 있음에도 불구하고 스노우상트는 근검절약에 있어 의심의 여지가 없는 로도스 아일랜드 최고의 인물이다.')
      .addFields(
        {name: '파일 자료 1', value: "하층민 출신이지만 타고난 노력형 인재였던 그녀는 자신의 힘으로 공부하고, 자신의 꿈을 위해 돈을 모아 컬럼비아로 향했다.\n이력서 상의 내용에 따르면, 스노우상트는 과거 컬럼비아의 신기술개발구역에 위치한 평범한 사립 연구소에서 연구원으로 근무한 적이 있다고 한다. 연구소의 규모나 성과가 두드러진 편이 아니었기에, 한때 우리는 스노우상트의 연구 능력을 과소평가한 적이 있었다. 하지만 '엄청나게 편리한 청소기 로봇에 대한 개선안'과 '절대 풀리지 않는 기계식 고리(용도는 아직 미정)'에 대한 연구 문건을 확인한 후에는 모두들 스노우상트를 다시 보게 되었다.\n관심사가 아니거나 사소한 일이더라도 전력을 다하는 스노우상트의 태도를 통해, 우리는 그녀의 일에 대한 열정과 에너지를 확인할 수 있었다. 게다가 오랫동안 배척을 당해 신기술을 접할 기회가 적었을 뿐, 스노우상트는 사실 자신이 생각하는 것보다 훨씬 더 뛰어난 재능을 지니고 있다. 하늘이 내린 천재들과는 달리 한 걸음 한 걸음 착실히 앞으로 나아가는 스타일의 연구원에게, 로도스 아일랜드는 보다 많은 관심을 가져야 할 것이다.", inline: false},
        {name: '파일 자료 2', value: "'스노우상트의 동전' 이야기가 한때 젊은 오퍼레이터들 사이에서 유행한 적이 있다. 물론 별다른 악의는 없지만 말이다.\n사건의 발단은 어느 날 스노우상트가 도베르만 교관을 대면할 때 수십 초 동안의 대화를 나누던 중 줄곧 도베르만 교관의 발 아래 어느 지점만을 바라보며 시작되었는데, 다들 처음에는 이 행위가 단순히 스노우상트에게 있는 어떤 습관 같은 것이라 생각하였다. 하지만 도베르만 교관의 말이 끝나는 그 순간, 스노우상트는 도베르만 교관 쪽으로 접근하여 땅에 떨어져있던 동전을 주웠다. 그렇게까지 적극적인 스노우상트의 모습은 이제까지 어느 누구도 본 적이 없었다. 당시 주위에 있던 모든 이들이 이 광경을 지켜보고 있었고, 심지어는 도베르만 교관조차도 어안이 벙벙해져 제대로 반응을 하지 못했다. 허리를 굽혔다가 다시 일어난 스노우상트는 이윽고 자신의 행동이 실례되는 행위였음을 알아채고는 수초 간 자리에서 멍하니 서있다가, 다른 사람들의 이상한 시선 속에서 바들바들 떨며 원래의 자리로 돌아갔다.\n알고보니 그녀가 절약하며 모았던 동전이 가득 찬 지갑이 너무 낡아버린 나머지 구멍이 났었고, 그래서 떨어뜨린 동전 한닢이 그만 도베르만 교관의 발 밑에 떨어졌던 게 사건의 전말이었다는 점은 나중에서야 알게 된 사실이다. 놀라운 사실은, 스노우상트가 그 동전 하나를 떨어뜨린 것 때문에 회의 내내 좌불안석이었음에도 불구하고, 그녀가 필기한 노트 상의 내용은 도베르만 교관의 강의 내용과 토시 하나 틀리지 않았다는 점이다. 이런 성실한 태도는 회의만 시작하면 잠들어버리는 일부 오퍼레이터들이 잘 보고 배워야 할 것이다.\n사람들로 하여금 자신의 건강을 걱정하게 할만큼 근면한 모습을 보이는 스노우상트지만, 이 가녀린 소녀가 하얀 만두를 입에 물고 일에 몰두하는 모습을 대부분의 사람들은 따뜻한 시선으로 지켜보고있다.", inline: false},
        {name: '파일 자료 3', value: "이유는 잘 모르지만, 제시카와 스노우상트는 사이가 좋다. 제시카와 스노우상트가 처음 대화를 나눈 건 어느 날 있었던 기계 정비 작업 때였는데, 아무래도 착하고 근면성실한 두 소녀의 성격 상 서로 비슷한 부분이 많다보니 서로를 쉽게 이해하고, 동정하기도 하며, 서로의 어려움에 대해 공감할 수 있었던 게 아닐까 싶다.\n물론 다른 사람들은, 둘의 연약한 모습이 놀라울 정도로 닮아있다 평가한다. 주변에 있는 수많은 인재들 때문에 스스로의 능력을 과소평가하기는 하지만, 이런 상황에서도 자신의 의지를 굽히지 않고 전진해가는 모습까지 말이다.\n서로에 대한 이해를 바탕으로 빠르게 제시카와 친구 사이가 된 스노우상트였지만, 제시카가 매월 총기와 오리지늄 탄환에 지출하는 금액 규모를 알게 되었을 때, 스노우상트는 자신이 알고있는 화폐의 가치와 기본적인 산수 지식에 문제가 있는 것이 아닌지 의문을 품었다. 만약 스노우상트가 제시카와 함께 식사를 하는 동안, 그녀 앞의 식판이 텅텅 비어있더라도 놀랄 필요는 없으리라.\n제시카는 물론 스노우상트를 도와줄 여건이 되지만, 자신의 목표를 위해 고생을 마다하지 않는 스노우상트의 인생관을 존중해 주고 있다. 어쩌면 이 두 사람은, 진정으로 서로를 이해해 줄 수 있는 소울메이트가 될 수 있지 않을까 싶다.", inline: false},
        {name: '파일 자료 4', value: "로도스 아일랜드에서 근검절약의 표본과 같은 인물이 누구냐고 묻는다면, 그 대답은 당연히 스노우상트일 것이다.\n본인의 설명에 따르면, 컬럼비아로 유학을 떠나기 전 스노우상트는 용문에서 밥도 배불리 먹지 못할 정도로 형편이 어려웠다고 한다. 장학금과 연구소에서 받은 급여 덕분에 상황은 어느 정도 개선되었으나, 그녀는 자신만의 독립 연구 개발 프로젝트의 경비를 모으기 위해 더욱더 절약을 하게 되었다.\n집을 나설 때 불을 끈다던지, 폐품을 수집하는 일 같은 건 두말할 필요도 없다. 스노우상트는 하루의 지출 계획을 소수점 단위로까지 세세하게 다 계산한다. 연구 자금을 위해 생활비를 최대한으로 줄이고, 그래도 남는 돈이 있다면 전부 고향으로 보낸다.\n스노우상트가 늘 휴대하고 있는 공업용 갈고리는 확실히 짚고 넘어갈만하다. 이 갈고리는 스노우상트가 용문을 떠나기 전에 처음 독립적으로 얻어낸 연구의 성과물인데, 안타깝게도 스노우상트는 특허권을 통해 자신의 권익을 보호하는 법 따위는 전혀 모르고 있었다. 그녀는 이 갈고리를 가지고 어느 지역의 공업 디자인 공모전에 참가하여 획득한 쥐꼬리만큼의 상금으로 컬럼비아로 향하는 기차표를 끊어, 자신의 꿈을 쫓기 위한 여정을 시작하였다.\n그때까지만 해도 스노우상트 본인은 자신의 능력에 대해 확신이 없었지만, 땀의 가치를 인정하는 성공한 선배들은 근면성실한 스노우상트를 이미 주목하고 있었고, 차후 적절한 시기에 그녀를 용문으로 다시 불러들일 계획을 세우고 있었다.", inline: false},
      )
      .setThumbnail('https://pbs.twimg.com/profile_images/1300805768778854401/bYRL-rMO_400x400.jpg')


    const pages = [embed0, embed024, embed023, embed020, embed013, embed012, embed011, embedss1, embedss2];

    ReactionPages(message, pages, true);

  }
}
