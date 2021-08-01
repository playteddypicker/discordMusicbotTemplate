const Discord = require('discord.js');
const ReactionPages = require('../reactionpages.js');
const ytdl = require('ytdl-core');
const { getInfo } = require('ytdl-getinfo');
const player = require('./setupplayer.js');
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

  let lpcount = undefined;
  if(args[1]){
    if(isNaN(args[1]) || args[1] < 1) return message.channel.send('몇 번 반복할건지 자연수로 써주세요!');
    lpcount = args[1];
    queue.goallooped = lpcount;
  }
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
    if(lpcount) return message.channel.send(`🔂 현재 곡을 ${lpcount}번 재생할게요!`);
    return message.channel.send('🔂 현재 곡을 반복할게요!');
  }else if(mode == 1 && queue.loopmode == 'single'){
    queue.loopmode = 'off';
    return message.channel.send('싱글 루프를 해제했어요!');
  }else if(mode == 2 && !(queue.loopmode == 'queue')){
    queue.loopmode = 'queue';
    //if(lpcount) return message.channel.send(`🔁 현재 큐를 ${lpcount}번 반복할게요!`);
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
        thumbnail: Youtube.thumb(`${info.items[0].webpage_url}`, 'big')
      }
      queue.songs.push(song);
    if(message.channel != player.server_player.get(message.guild.id)){
      message.channel.send('유튜브에서 추천 노래를 찾았어요!');
      viewqueue(message, queue);
    }else{player.editnpplayer(message.channel)}
  });
}

function shufflequeue(message, queue, isbuttonreact){
  if(queue.songs.length < 2) return message.channel.send('큐에 노래를 두 개 이상 넣어주세요!');
  
  for(let i = queue.songs.length - 1; i >= 0; i--){
    if(i == queue.curq) continue;
    let j = Math.floor((Math.random() * i)) + 1;
    if(j == queue.curq) continue;
    [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
  }
  if(!isbuttonreact) {
    message.channel.send('🔀 큐에 있는 노래가 이렇게 섞였어요!');
    viewqueue(message, queue, 0);
  }
}

function deletequeue(message, queue, args){
  if(!(queue.loopmode == 'queue')){
    if(!args[0] || isNaN(args[0]) || args[0] <= 0) return messsage.channel.send('지울 큐의 번호를 자연수로 입력해주세요!');
    if(args[0] > queue.songs.length) return message.channel.send('지울 범위를 벗어났어요!');

    let i = args[0];
    if(!args[1]){
      queue.songs.splice(i, 1);
      if(queue.isplayercreated) editnpplayer(queue);
      if(queue.songs.length == 1 && queue.loopmode == 'auto') autoqueue(message, queue);
      return message.channel.send(`대기열 ${i}번을 지웠어요!`);
    }else if(isNaN(args[1]) || args[1] <= 0){
      return message.channel.send('지우는 범위를 자연수로 입력해 주세요!');
    }else{
      let j = args[1];

      if(i > j || j > queue.songs.length - 1) return message.channel.send('지우는 범위가 이상해요..헤윽..');
      queue.songs.splice(i, j-i+1);
      message.channel.send(`대기열 ${i}번부터 ${j}번까지 지웠어요!`);
      viewqueue(message, queue, 0);
    }
    if(queue.loopmode == 'auto'){
      let qstatus = queue.songs.length;
      if(qstatus == 1) autoqueue(message, queue);
    }
  }else{
    if(!args[0] || isNaN(args[0]) || args[0] <= 0) return message.channel.send('지울 큐의 번호를 자연수로 입력해 주세요!');
    if(!args[0] > queue.songs.length + 1) return message.channel.send('지울 범위를 벗어났어요!');

    let i = args[0];
    if(!args[1]){
      queue.songs.splice(i-1, 1);
      return message.channel.send(`대기열 ${i}번을 지웠어요!`);
    }else if(isNaN(args[1]) || args[1] <= 0) {
      return message.channel.send('지우는 범위를 자연수로 입력해 주세요!');
    }else{
      let j = args[1];
      
      if(i > j || j > queue.songs.length) return message.channel.send('지우는 범위가 이상해요..헤윽..');
      if(i == queue.curq + 1 || j == queue.curq + 1 || (queue.curq + 1 >= i && queue.curq + 1 <= j)) return message.channel.send('지금 틀고 있는 노래까지 지울 수는 없어요!');
      queue.songs.splice(i-1, j-i+1);
      if(i <= queue.curq + 1) queue.curq = j - i;
      message.channel.send(`대기열 ${i}번부터 ${j}번까지 지웠어요!`);
      return viewqueue(message, queue, 0);
    }
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
  if(m == queue.curq || n == queue.curq) return message.channel.send('지금 재생 중인 노래의 위치를 옮길 수는 없어요!');

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
  if(m == queue.curq || n == queue.curq) return message.channel.send('지금 재생 중인 노래의 위치를 옮길 수는 없어요!');

  if(queue.loopmode == 'queue'){
    temp = queue.songs[n - 1]
    queue.songs[n-1] = queue.songs[m-1];
    queue.songs[m-1] = temp;
  }else{
    temp = queue.songs[n];
    queue.songs[n] = queue.songs[m];
    queue.songs[m] = temp;
  }
  message.channel.send(`대기열 ${m}번과 ${n}번의 위치를 바꿨어요!`);
  viewqueue(message, queue, 0);
}

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
  let cursongdur = getTimestamp(queue.songs[0].duration);
  let curms = queue.connection.dispatcher.streamTime;
  let cur = getTimestamp(Math.floor(curms / 1000));

  const cursong = new Discord.MessageEmbed()
    .setAuthor(`지금 재생 중`)
    .setTitle(`${queue.songs[0].title}`)
    .setURL(`${queue.songs[0].url}`)
    .setColor("FF6F61")
    .setThumbnail(queue.songs[0].thumbnail)
    .setFooter(`${cur} / ${cursongdur}`);

    if(queue.loopmode == 'auto' && queue.songs.length == 2){
    let nextsongdur = getTimestamp(queue.songs[1].duration);

    const nextsong = new Discord.MessageEmbed()
      .setAuthor(`다음 곡`)
      .setTitle(`${queue.songs[1].title}`)
      .setURL(`${queue.songs[1].url}`)
      .setColor("#FF6F61")
      .setThumbnail(queue.songs[1].thumbnail)
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
        let lthl = getTimestamp(queue.songs[i].duration);
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
      var lthl = getTimestamp(queue.songs[i].duration);
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

function viewnp(message, queue){
  if(!queue.isplaying) return message.channel.send('아무 노래도 틀고 있지 않아요....');
  if(!queue.connection) return message.channel.send('봇이 연결되어있지 않아요..');
  if(!queue.connection.dispatcher) return message.channel.send('아무 노래도 틀고 있지 않아요..');

  let curq = queue.curq;
  let song = queue.songs[curq];
  let curms = queue.connection.dispatcher.streamTime;
  let curs = Math.floor( curms / 1000 );
  let cur = getTimestamp(Number(curs));
  let lth = getTimestamp(Number(queue.songs[curq].duration));
  let thumb = queue.songs[curq].thumbnail;

  //연산
  let timeline = '';
  let timelinelocate = Math.floor((Number(curs) / Number(queue.songs[curq].duration)) * 20);

  for(let i = 0; i < 20; i++){
    timeline = timeline + '━';
    if(i == timelinelocate) timeline = timeline + '➤';
  }

  if(queue.connection.dispatcher.paused){
    let nowstatus = '⏸️  일시정지됨!'
  }else{
    var nowstatus = '▶️  지금 재생 중!'
  }
  if(queue.loopmode == 'single'){
    if(queue.goallooped) {
      var curloopst = `🔂  총 ${queue.goallooped}번 중 ${queue.looped + 1}번 재생 중`;
    }else{
      var curloopst = `🔂  ${queue.looped + 1}번 재생 중`;
    }
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
    .addFields( { name: `타임라인: ${cur} / ${lth}`, value: `|${timeline}|`, inline: false},
        { name: '루프', value: `${curloopst}`, inline: true},
        { name: '상태', value: `${nowstatus}`, inline: true},
        { name: '볼륨', value: `${queue.setVolume * 100}%`, inline: true},
        { name: `신청인`, value:`${song.request}`, inline: false}, 
      )
    .setThumbnail(thumb)
  
  if(queue.songs.length > 1) embed.addFields({name: '다음 곡', value:`${queue.songs[queue.curq + 1].title}`, inline: false});
  return message.channel.send(embed);
}

let functions = {
  setvolume, setloop, autoqueue, shufflequeue, deletequeue, jumpqueue,
  movequeue, switchqueue, getTimestamp, viewnp, viewqueue
};

module.exports = functions;
