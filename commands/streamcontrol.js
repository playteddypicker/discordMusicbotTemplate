const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { getInfo } = require('ytdl-getinfo');
const ReactionPages = require('./reactionpages.js');
const queueset = require('./queuelist.js');
const Discord = require('discord.js');
const queue = queueset.queue;

module.exports = {
  name: 'play',
  aliases: [
    'p', 'q', 'queue', 'np', 'skip', 's', 'stop', 'pause', 
    'v', 'volume', 'l', 'loop', 'lp', 'leave',
    'shuffle', 'shuf', 'delq', 'dq', 'jump','j',
    'move', 'mv', 'switch', 'sw'],
  description: 'streaming control',
  execute(client, message, cmd, args, Discord){
    const voiceChannel = message.member.voice.channel;
    if(!message.guild.me.voice.channel) queueset.initqueue();

    switch (cmd){
      case 'np':
        viewnp(message, queue);
        break;

      case 'q':
      case 'queue':
        viewqueue(message, queue, 1);
        break;
    }

    if(!voiceChannel && cmd != 'np' && cmd != 'q' && cmd != 'queue'){
      return message.channel.send('일단 음성 채널에 들어와 주세요!');
    }else{
      switch(cmd){
        case 'p':
        case 'play':
          if(!args[0]) return message.channel.send('무슨 노래를 틀건지는 쓰셔야죠..');
          if(!queue.connection && queue.isqueueempty && !queue.isplaying) {
            //초기에 봇이 연결되지 않았을때.
            enqueue(message, queue, args)
            .then( () => {
            if(!queue.connection){
              const connection = voiceChannel.join();
              connection.then(function(connection) {
                queue.connection =connection;
              })
                .then( () => {
                  if(!queue.isplaying) return playsong(message, queue, queue.songs[0]);
                }).catch(error => {
                  message.guild.me.voice.chaannel.leave();
                  message.channel.send('연결하는데 에러가 났어요.. 노래를 다시 틀어주세요.');
                });
              }
            });
          }else if(queue.connection && queue.isqueueempty && !queue.isplaying){
            //봇이 연결되어있지만 큐에 노래가 없고 재생중이지 않을때.`
            enqueue(message, queue, args)
            .then( () => {
              playsong(message, queue, queue.songs[0]);
            });
          }else{//봇이 노래를 틀고있을때
            enqueue(message, queue, args);
          }
          break;

        case 'skip':
        case 's':
          skipsong(message, queue);
          break;

        case 'stop':
          stopsong(message, queue);
          break;

        case 'pause':
          pausesong(message, queue);
          break;

        case 'v':
        case 'volume':
          setvolume(message, queue, args);
          break;

        case 'loop':
        case 'lp':
          setloop(message, queue, args);
          break;

        case 'leave':
          disconnect(message, queue);
          break;

        case 'shuf':
        case 'shuffle':
          shufflequeue(message, queue);
          break;

        case 'delq':
        case 'dq':
          deletequeue(message, queue, args);
          break;

        case 'jump':
        case 'j':
          jumpqueue(message, queue, args);
          break;

        case 'move':
        case 'mv':
          movequeue(message, queue, args);
          break;

        case 'switch':
        case 'sw':
          switchqueue(message, queue, args);
          break;
      }
    }
  }
}

function playsong(message, queue, song){
  queue.isplaying = true;
  if(queue.isqueueempty || queue.songs.length == 0){
    queueset.initqueue();
    message.channel.send('큐에 노래가 다 떨어졌어요..');
    queue.isplaying = false;
    queue.isqueueempty = true;
    return;
  }

  const stream = ytdl(song.url, {filter : 'audioonly'});
  try{
    if(!queue.connection){
      message.channel.send('봇의 연결 상태를 불러오는데 실패했어요. 다시 연결 중...');
      return playsong(message, queue, song);
      }else{
        queue.connection.play(stream, {seek: 0, volume: queue.setVolume})
          .on('finish', () => {
            async function nextsong(){ 
              if(queue.loopmode == 'single'){
                queue.looped++;
              }else if(queue.loopmode == 'queue'){
                queue.curq++
                if(queue.curq == queue.songs.length) queue.curq = 0;
              }else{
                queue.songs.shift();
                queue.looped = 0;
              }
              if(queue.loopmode == 'auto' && queue.songs.length == 1){
                  autoqueue(message, queue, 1);
              }
            }
            nextsong().then( () => {
            playsong(message, queue, queue.songs[queue.curq]);
            });
          });
      if(!(queue.loopmode == 'single')) {
        message.channel.send(`🎶 **${song.title}** 현재 재생 중이에요!`);
      }else{
        message.channel.send(`**${song.title}** ${queue.looped}번 재생 중이에요!`);
      }
    }
  }catch (err){
    throw err;
    queueset.initqueue();
    message.channel.send('노래를 스트리밍하는데 에러가 났어요.. 다시 틀어주세요..');
  }
}

async function enqueue(message, queue, args){

  let song = {};
  let isplaylist = 0;

  // 틀려는 유형이 플레이리스트일때
  if(args[0].match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)){
    isplaylist = 1;
    message.channel.send('플레이리스트 검색 중..');
    console.log(`searching playlist..`);

    try{
      await getInfo(args[0], [], true).then(info => {
        playlistlength = info.items.length;

        for(let i = 0; i < playlistlength; i++){
          song = {
            title: info.items[i].title,
            url: info.items[i].webpage_url,
            request: message.author.username,
            duration: info.items[i].duration,
            isurl : 1
          }
          queue.songs.push(song);
        }
      })
    console.log(`playlist found, ${playlistlength} songs added.`);
      message.channel.send(`플레이리스트에서 ${playlistlength}개의 노래를 찾았어요!\n현재 큐를 보시려면 ./q`);
    queue.isqueueempty = false;
    }catch (error){
      message.channel.send('플레이리스트를 불러오는데 실패했어요.\n공개 상태인 플레이리스트만 추가 가능해요.');
      throw error;
    }

  }else if(ytdl.validateURL(args[0])){
    try{
    const song_info = await ytdl.getInfo(args[0]);
    song = {
      title: song_info.videoDetails.title,
      url: song_info.videoDetails.video_url,
      request: message.author.username,
      duration: song_info.videoDetails.lengthSeconds,
      isurl: 1
    }
    queue.songs.push(song);
    queue.isqueueempty = false;
    }catch (error){
      message.channel.send('노래를 추가하는데 실패했어요. 다시 한번 해주세요.');
      throw error;
    }
    }else{
    try{
    const videofinder = await ytSearch(args.join(' '));
    const video = (videofinder.videos.length > 1) ? videofinder.videos[0] : null;

    if(video){
      song = {
        title: video.title,
        url: video.url,
        request: message.author.username,
        duration: video.duration,
        isurl: 0
      }
      queue.songs.push(song);
      queue.isqueueempty = false;
    } else {
      return message.channel.send('그런 노래는 없는 것 같아요..');
    }
    }catch (error){
      message.channel.send('음악을 검색하는데 에러가 났어요. 다시 한번 해주세요.');
      throw error;
    }
  }
  if (queue.isplaying && isplaylist == 0){
    let totdur = 0;
    for(let i = queue.curq; i < queue.songs.length -1; i++){
      totdur += Number(getseconds(queue, i));
    }
    let newqueue = new Discord.MessageEmbed()
      .setAuthor(`${queue.songs.length - 1}번째 큐에 추가됨`, message.author.avatarURL())
      .setTitle(`${song.title}`)
      .setURL(`${song.url}`)
      .setThumbnail(Youtube.thumb(`${song.url}`, 'big'))
      .setFooter(`노래 길이: ${getTimestamp(parseInt(song.duration))} | 재생까지 남은 시간: ${getTimestamp(Number(totdur))}`);

    message.channel.send(newqueue);
  }
}

function skipsong(message, queue){
  if(!queue.connection) return message.channel.send('일단 노래를 틀어주세요!');
  if(queue.connection.dispatcher){
    if(queue.songs.length < 2) return message.channel.send('스킵 할 노래가 없어요!');

    if(queue.loopmode == 'single'){
      queue.songs.shift();
      queue.connection.dispatcher.end();
      queue.looped = 0;
      return message.channel.send(`${message.member}님이 스킵했어요!`);
    }
    queue.connection.dispatcher.end();
      message.channel.send(`${message.member}님이 스킵했어요!`);
    }else{
    message.channel.send('스트리밍중이 아니에요. 만약 버그라면 ./stop으로 음악 플레이어를 초기화해주세요.');
  }
}

function stopsong(message, queue){
  if(!queue.isplaying) {
    message.channel.send('음악 플레이어를 초기화했어요.');
  }else{
    message.channel.send(`${queue.songs.length}개의 노래를 지우고 음악 플레이어를 초기화했어요.`);
    try{
      queue.connection.dispatcher.end();
    }catch (error){
      message.guild.me.voice.channel.leave();
      message.channel.send('스트리밍하는데 에러가 나서 음악 플레이어를 초기화하고 음성 채널을 나갔어요.')
      throw error;
    }
  }
  queueset.initqueue();
}

function pausesong(message, queue){
  if(!queue.isplaying) return message.channel.send(`노래를 틀고 있지 않아요..`);
  if(queue.conenction.dispatcher.paused){
    message.channel.send('▶️  노래 다시 틀게요!');
    server_queue.connection.dispatcher.resume();
  }else{
    server_queue.connection.dispatcher.pause();
    message.channel.send('⏸️  노래를 일시정지했어요!');
  }
}

function setvolume(message, queue, args){
  if(!args[0] || isNaN(args[0])) return message.channel.send('조정하실 볼륨을 숫자로 입력 해 주세요!');
  if(args[0] < 1 || args[0] > 100) return message.channel.send('볼륨 조절 범위를 벗어났어요!');
  if(!queue.isplaying || !queue.connection) return message.channel.send('노래를 먼저 틀어주세요!');

  let setvolume = Math.floor(args[0]);
  queue.setVolume = setvolume / 100;
  queue.connection.dispatcher.setVolume(queue.setVolume);
  return message.channel.send(`볼륨을 ${setvolume}%로 맞췄어요!`);
}

function setloop(message, queue, args){
  let loopstatus = '꺼짐';
  if(queue.loopmode == 'queue'){
    loopstatus = '🔁 큐 반복';
  }else if(queue.loopmode == 'single'){
    loopstatus = '🔂 한 곡 반복';
  }else if(queue.loopmode == 'auto'){
    loopstatus = '♾️  자동 재생 모드';
  }

  if(!args[0]) return message.channel.send(`루프를 어떻게 하실건지 써주세요!\n**lp one/single/s** : 현재 곡만 루프\n**lp queue/q** : 큐 전체 루프\n**lp auto/a** : 자동 재생 모드\n현재 루프 상태 : ${loopstatus}`);

  let mode = 0;
  if(args[0] == 'off'){
    mode = 0;
  }else if(args[0] === 'one' || args[0] === 'single' || args[0] === 's'){
    mode = 1;
  }else if(args[0] === 'queue' || args[0] === 'q'){
    mode = 2;
  }else if(args[0] == 'auto' || args[0] == 'a'){
    mode = 3;
  }else{
    return message.channel.send('그런 명령어는 없어요!');
  }

  if(mode == 1 && !(queue.loopmode == 'single')){
    queue.loopmode = 'single';
    return message.channel.send('🔂 현재 곡을 루프할게요!');
  }else if(mode == 1 && queue.loopmode == 'single'){
    queue.loopmode = 'off';
    return message.channel.send('싱글 루프를 해제했어요!');
  }else if(mode == 2 && !(queue.loopmode == 'queue')){
    queue.loopmode = 'queue';
    return message.channel.send('🔁 현재 큐를 반복할게요!');
  }else if(mode == 2 && queue.loopmode == 'queue'){
    queue.loopmode = 'off';
    if(queue.curq != 0){
      let curq = queue.curq;
      queue.songs = queue.songs.splice(curq, queue.songs.length);
      queue.curq = 0;
    }
    return message.channel.send('큐 루프를 해제했어요!');
  }else if(mode == 3 && !(queue.loopmode == 'auto')){
    queue.loopmode = 'auto';
    if(queue.songs.length == 1) autoqueue(message, queue, 0);
    message.channel.send('♾️  자동 재생 모드를 켰어요!');
  }else if(mode == 3 && queue.loopmode == 'auto'){
    queue.loopmode = 'off';
    message.channel.send('자동 재생 모드를 껐어요!');
  }else if(mode == 0 && !(queue.loopmode == 'off')){
    queue.loopmode = 'off';
    message.channel.send('모든 루프 상태를 껐어요.');
  }else if(mode == 0 && queue.loopmode == 'off'){
    message.channel.send('루프 상태는 이미 꺼져있어요..');
  }
  console.log(queue.loopmode);
}

function disconnect(message, queue){
  if(queue.songs.length > 0){
    queueset.initqueue();
  }
  try{
    message.guild.me.voice.channel.leave();
  }catch (err){
    message.channel.send('으..으.. 나가기 싫어요!!');
    throw err;
  }
  return message.channel.send('이제 그만 가볼게요.. 헤헤..');
}

async function autoqueue(message, queue){
  message.channel.send('유튜브에서 추천 노래 찾는중..')
  let cursong = queue.songs[0];
  let related = await ytdl.getBasicInfo(cursong.url);
  related = related.related_videos[0].id;
  let song = {};

  getInfo(related).then(info => {
    song = {
        title: info.items[0].title,
        url: info.items[0].webpage_url,
        request : '자동 재생 모드',
        duration: info.items[0].duration,
        isurl: 1
      }
      queue.songs.push(song);
      message.channel.send('유튜브에서 추천 노래를 찾았어요!');
      viewqueue(message, queue);
  });
}

function shufflequeue(message, queue){
  if(queue.songs.length < 2) return message.channel.send('큐에 노래를 두 개 이상 넣어주세요!');
  
  for(let i = queue.songs.length - 1; i > 0; i--){
    let j = Math.floor((Math.random() * i)) + 1;
    [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
  }
  message.channel.send('🔀 큐에 있는 노래가 이렇게 섞였어요!');
  viewqueue(message, queue, 0);
}

function deletequeue(message, queue, args){
  if(!args[0] || isNaN(args[0]) || args[0] <= 0) return messsage.channel.send('지울 큐의 번호를 자연수로 입력해주세요!');
  if(args[0] > queue.songs.length) return message.channel.send('지울 범위를 벗어났어요!');

  let i = args[0];
  if(!args[1]){
    queue.songs.splice(i, 1);
    return message.channel.send(`대기열 ${i}번을 지웠어요!`);
  }else if(isNaN(args[1]) || args[1] <= 0){
    return message.channel.send('지우는 범위를 자연수로 입력해 주세요!');
  }else{
    let j = args[1];

    if(i > j || j > queue.songs.length - 1) return message.channel.send('지우는 범위가 이상해요..헤윽..');
    queue.songs.splice(i, j-i+1);
    return message.channel.send(`대기열 ${i}번부터 ${j}번까지 지웠어요!`);
    viewqueue(message, queue, 0);
  }
  if(queue.loopmode == 'auto'){
    let qstatus = queue.songs.length;
    if(qstatus == 1) autoqueue(message, queue);
  }
}

function jumpqueue(message, queue, args){
  if(!queue.connection) return message.channel.send('먼저 노래를 틀어주세요!');
  if(!queue.connection.dispatcher) return message.channel.send('스트리밍 중이 아니에요. 만약 버그라면 ./stop으로 플레이어를 초기화 해주세요.');
  if(queue.isqueueempty) return message.channel.send('대기열에 노래가 없어요!');
  if(!queue.isplaying) return message.channel.send('먼저 노래를 틀어주세요!');
  if(queue.songs.length < 2) return message.channel.send('대기열에 노래가 없어요!');
  if(isNaN(args[0])) return message.channel.send('점프 다음은 숫자로 입력해주세요..');
  if(!(queue.loopmode == 'queue') && args[0] > queue.songs.length - 1) return message.channel.send('점프 범위를 벗어났어요!');
  if(args[0] > queue.songs.length || args[0] < 1) return message.channel.send('점프 범위를 벗어났어요!');

  let j = args[0];
  if(!(queue.loopmode == 'queue')) {
    queue.songs.splice(1, j-1);
  }else{
    queue.curq = args[0] - 2;
  }
  queue.connection.dispatcher.end();
  return message.channel.send(`대기열 ${j}번으로 점프했어요!`);
}

function movequeue(message, queue, args){
  if(!queue.isplaying) return message.channel.send('대기열에 노래가 없어요!');
  if(!args[0]) return message.channel.send('어떤 곡을 어디로 옮길 건지 써 주세요!');
  if(!args[1]) return message.channel.send('곡을 어디로 옮길 건지 써 주세요!');
  if(isNaN(args[0]) || isNaN(args[1]) || args[0] < 1 || args[1] < 1) return message.channel.send('자연수로 써주세요..');

  function movearray(list, target, moveValue){
    if (list.length < 0) return;
    const newpos = Number(target) + Number(moveValue);
    if(newpos < 0 || newpos >= list.length) {
      console.log(`${target}, ${moveValue}, ${list.length}, ${newpos}` );
      return message.channel.send('옮길 범위를 벗어났어요!');
    }
    const tempList = JSON.parse(JSON.stringify(list));

    const totarget = tempList.splice(target, 1)[0];

    tempList.splice(newpos, 0, totarget);
    return tempList;
  }

  let m = args[0];
  let n = args[1];

  if(queue.loopmode == 'queue'){
    queue.songs = movearray(queue.songs, m - 1, n - m);
  }else{
    queue.songs = movearray(queue.songs, m, n - m);
  }
  message.channel.send(`대기열 ${m}번을 ${n}번으로 옮겼어요!`);
  viewqueue(message, queue, 0);
}

function switchqueue(message, queue, args){
  if(!args[0] || !args[1] || isNaN(args[0]) || isNaN(args[1]) || args[0] < 1 || args[1] < 1) return message.channel.send('명령어를 제대로 쳐주세요..');

  let temp;
  let m = Number(args[0]);
  let n = Number(args[1]);

  temp = queue.songs[n];
  queue.songs[n] = queue.songs[m];
  queue.songs[m] = temp;

  message.channel.send(`대기열 ${m}번과 ${n}번의 위치를 바꿨어요!`);
  viewqueue(message, queue, 0);
  
}

var Youtube = (function () {
  'use strict';

  var video, results;

  var getThumb = function (url, size) {
    if (url === null) {
      return '';
    }
    size = (size === null) ? 'big' : size;
    results = url.match('[\\?&]v=([^&#]*)');
    video   = (results === null) ? url : results[1];

    if (size === 'small') {
      return 'http://img.youtube.com/vi/' + video + '/2.jpg';
    }
    return 'http://img.youtube.com/vi/' + video + '/0.jpg';
  };

  return {
    thumb: getThumb
  };
}());

function getTimestamp(seconds){
  var hr, min, sec;
  min = parseInt((seconds%3600)/60);
  sec = seconds%60;
  hr = parseInt(seconds / 3600);
  if(sec.toString().length == 1) sec = "0" + sec;
  if(min.toString().length == 1) min = "0" + min;
  if (hr == 0) return min + ":" + sec;
  return hr + ":" + min + ":" + sec;
}

function getduration(server_queue, i){
  if(server_queue.songs[i].isurl == 0){
    let string = server_queue.songs[i].duration.seconds;
    return getTimestamp(string);
  }else if(server_queue.songs[i].isurl == 1){
    let length = Number(server_queue.songs[i].duration);
    return getTimestamp(length);
  }
}

function viewnp(message, queue){
  if(!queue.isplaying) return message.channel.send('아무 노래도 틀고 있지 않아요....');

  let curq = queue.curq;
  let song = queue.songs[curq];
  let lth = getduration(queue, curq);
  let curms = queue.connection.dispatcher.streamTime;
  let cur = getTimestamp(Math.floor(curms / 1000));
  let thumb = Youtube.thumb(`${song.url}`, 'big');

  if(queue.connection.dispatcher.paused){
    let nowstatus = '⏸️  일시정지됨!'
  }else{
    var nowstatus = '▶️  지금 재생 중!'
  }
  if(queue.loopmode == 'single'){
    var curloopst = `🔂  ${queue.looped}번 반복 됨`;
  }else if (queue.loopmode == 'queue'){
    var curloopst = `🔁 큐 반복 중 : 현재 ${curq + 1}번째 곡`;
  }else if (queue.loopmode == 'auto'){
    var curloopst = `♾️ 자동 재생 모드`;
  }else{
    var curloopst = `꺼짐`;
  }

  const embed = new Discord.MessageEmbed()
      .setAuthor('지금 재생 중')
      .setTitle(`${song.title}`)
      .setURL(song.url)
      .setColor("#FF6F61")
      .addFields( { name: `타임라인 : ${cur} / ${lth}`, value: `루프 : ${curloopst} \n상태 : ${nowstatus} \n볼륨: ${queue.setVolume * 100}%`, inline: true},
                  { name: `신청인`, value:`${song.request}`, inline: false}, )
    .setThumbnail(thumb)
  if(queue.songs.length > 1) embed.addFields({name: '다음 곡', value:`${queue.songs[queue.curq + 1].title}`, inline: false});
  return message.channel.send(embed);
}

async function viewqueue(message, queue, npmd){
  console.log(queue.isplaying)
  function textLengthCheck(str, len){
    var returnValue = "";

    if(!len || len == ""){
      return str;
    }
    if (str.length > len){
      returnValue = str.substring(0, len) + "...";
    }else{
      returnValue = str;
    }
      return returnValue;
  }
  let queuecounter = queue.songs.length;
  let cursongdur = getduration(queue, 0);
  let curms = queue.connection.dispatcher.streamTime;
  let cur = getTimestamp(Math.floor(curms / 1000));

  const cursong = new Discord.MessageEmbed()
    .setAuthor(`지금 재생 중`)
    .setTitle(`${queue.songs[0].title}`)
    .setURL(`${queue.songs[0].url}`)
    .setColor("FF6F61")
    .setThumbnail(Youtube.thumb(`${queue.songs[0].url}`, 'big'))
    .setFooter(`${cur} / ${cursongdur}`);


  if(queue.loopmode == 'auto' && queue.songs.length == 2){
    let nextsongdur = getduration(queue, 1);

    const nextsong = new Discord.MessageEmbed()
      .setAuthor(`다음 곡`)
      .setTitle(`${queue.songs[1].title}`)
      .setURL(`${queue.songs[1].url}`)
      .setColor("#FF6F61")
      .setThumbnail(Youtube.thumb(`${queue.songs[1].url}`, 'big'))
      .setFooter(`${nextsongdur}`);

    await message.channel.send(cursong);
    await message.channel.send(nextsong);
    return
  }

  if(!(queue.loopmode == 'queue')){
    if(queuecounter > 1){
      let qMsgtitle = '::: 큐 목록 :::\n'; 
      let qMsg = '';
      let pages = [];

      for(let i = 1; i < queuecounter; i++){
        let lthl = getduration(queue, i);
        let titlevalue = textLengthCheck(queue.songs[i].title, 27);
        if(titlevalue.length < 30){
          for(let k = titlevalue.length; k < 30; k++){
          titlevalue = titlevalue + ' ';
          }
        }
        qMsg += `#${i} ${titlevalue} ${lthl} by ${queue.songs[i].request}\n`;
        let initpagenum = parseInt(i % 20);
        if(initpagenum == 0){
          qMsgtitle = `:::노래 ${queuecounter - 1}개 대기 중:::\n`;
          qMsg = '```' + qMsgtitle + qMsg + '\n```';
          pages.push(qMsg);
          qMsg = '';
        }
      }
      if(qMsg){
        qMsg = '```' + qMsgtitle + '\n' + qMsg + '\n```';
        pages.push(qMsg);
      }
      if(npmd == 1) await message.channel.send(cursong);
      return await ReactionPages(message, pages, true);
    }else{
      if(npmd == 1) message.channel.send(cursong);
      return message.channel.send('큐에 대기 중인 곡이 하나도 없네요..');
      }
  }else{
    let lqueuecounter = queue.songs.length;
    let lqMsg = '';
    let pages = [];
    let lqMsgtitle = '```\n' + '노래 리스트 : ' + `총 ${lqueuecounter}개\n\n`;
    for(var i = 0; i < queuecounter; i++){
      var lthl = getduration(queue, i);
      let titlevalue = textLengthCheck(queue.songs[i].title, 35);
      if(titlevalue.length < 38){
        for(var k = titlevalue.length; k < 38; k++) titlevalue = titlevalue + ' ';
      }
      if(i == queue.curq) lqMsg += '>>>'
      lqMsg += `#${i+1} ${titlevalue} ${lthl} by ${queue.songs[i].request} \n`
      const initpagenum = parseInt((i+1) % 20);
      if(initpagenum == 0){
        lqMsg = lqMsgtitle + lqMsg + '\n```';
        pages.push(lqMsg);
        lqMsg = '';
      }
      
    }
    if(lqMsg){
      lqMsg = lqMsgtitle + lqMsg + '\n```';
      pages.push(lqMsg);
    }
    return await ReactionPages(message, pages, true);
  }

  if(!queue.isplaying) return message.channel.send('아무 노래도 틀고 있지 않아요..');
  if(queue.songs.length < 2) return message.channel.send('대기열에 노래가 없어요!');
}

function getseconds(server_queue, i){
  if(server_queue.songs[i].isurl == 0){
    return Number(server_queue.songs[i].duration.seconds);
  }else if(server_queue.songs[i].isurl == 1){
    return Number(server_queue.songs[i].duration); 
  }
}
