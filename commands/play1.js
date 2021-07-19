const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { getInfo } = require('ytdl-getinfo');
const recon = require("reconlx");
const ReactionPages = recon.ReactionPages;

let changevolumevalue = 0.3;
var queue = new Map();
var mch = 0;
module.exports = {
  name: 'play',
  aliases: ['p', 'skip', 's', 'stop', 'np', 'queue', 'q', 'shuffle', 'shuf', 'pause', 'delq', 'delqueue', 'dq', 
            'v', 'volume', 'l', 'loop', 'lp', 'leave', 'jump', 'j', 'move', 'mv', 'change', 'ch', 'auto'],
  cooldown: 0,
  description: '노래틀어줌',
  async execute(client, message, cmd, args, Discord) {
    const voiceChannel = message.member.voice.channel;
    const voice_channel = message.member.voice.channel;

    if(!voice_channel) return message.channel.send('일단 들어와주세요..')
    if(!message.guild.me.voice.channel){
      queue = new Map();
    }
    const server_queue = queue.get(message.guild.id);

    switch (cmd){

      case 'p':
      case 'play':
        search_song(client, message, cmd, args, Discord, voice_channel, server_queue);
        break;

      case 'skip':
      case 's':
        skip_song(message, server_queue);
        break;

      case 'stop':
        stop_song(message, server_queue);
        break;

      case 'np':
        np_song(message.guild, message, server_queue);
        break;

      case 'q':
      case 'queue':
        viewqueue_song(message.guild, message, server_queue, args, 0);
        break;

      case 'shuffle':
      case 'shuf':
        shufflequeue_song(message.guild, message, server_queue);
        break;

      case 'pause':
        pause_song(message.guild, message, server_queue);
        break;

      case 'delqueue':
      case 'dq':
      case 'delq:':
        deletequeue(message.guild, message, server_queue, args);
        break;

      case 'v':
      case 'volume':
        changevolume(message.guild, message, server_queue, args);
        break;

      case 'loop':
      case 'l':
      case 'lp':
        loop_song(message.guild, message, server_queue, args);
        break;

      case 'leave':
        leaveNow(message, server_queue, voice_channel);
        break;

      case 'jump':
      case 'j':
        jump_song(message, server_queue, args);
        break;

      case 'mv':
      case 'move':
        move_song(message, server_queue, args);
        break;

      case 'change':
      case 'ch':
        change_song(message, server_queue, args);
        break;

      case 'auto':
        toggleauto(message, server_queue);
        break;
    }
  }
  
}
async function search_song(client, message, cmd, args, Discord, voice_channel, server_queue){
  if(!voice_channel) return message.channel.send('먼저 음성 채널에 들어가주세요..');
  const permissions = voice_channel.permissionsFor(message.client.user);
  if(!permissions.has('CONNECT') || !permissions.has('SPEAK')) return message.channel.send('노래 틀 권한이 없으신데요..?');
  if (!args.length) return message.channel.send('무슨 노래를 틀건지는 쓰셔야죠..');

  let song = {};
  let playlist = 0;

  if(args[0].match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)){
    playlist = 1;
          await play_song(client, message, cmd, args, Discord, voice_channel, server_queue, song, playlist);
          return
        }else if (ytdl.validateURL(args[0])) {
          const song_info = await ytdl.getInfo(args[0]);
          song = { 
            title: song_info.videoDetails.title, 
            url: song_info.videoDetails.video_url, 
            request: message.author.username, 
            duration: song_info.videoDetails.lengthSeconds, 
            isurl: 1 }
          await play_song(client, message, cmd, args, Discord, voice_channel, server_queue, song, playlist);
          return
        } else {
          const video_finder = async (query) =>{
            const video_result = await ytSearch(query);
            return (video_result.videos.length > 1) ? video_result.videos[0] : null;
          }
          const video = await video_finder(args.join(' '));
          if (video){
            song = { title: video.title, url: video.url, request: message.author.username, duration: video.duration, isurl: 0 }
            await play_song(client, message, cmd, args, Discord, voice_channel, server_queue, song, playlist);
            return
          } else {
            return message.channel.send('그런 노래는 없는 것 같아요..');
          }
        }
}

async function play_song(client, message, cmd, args, Discord, voice_channel, server_queue, song, playlist) {
   
        const queue_constructor = {
          voice_channel: voice_channel,
          text_channel: message.channel,
          connection: null,
          songs: [],
          playing: true,
          loopone: false,
          loopqueue: false,
          autoqueue: false
        }

  if(playlist == 1){
    let a = 1;
    let isempty = 0;

    if(!server_queue || !server_queue.songs[0]){
      console.log('searching playlist..');
      message.channel.send('플레이리스트 검색 중..');
      await queue.set(message.guild.id, queue_constructor);
      await getInfo(args[0], [], true).then(info => {
        a = info.items.length;
        console.log(`playlist found, ${a} songs added.`);

          isempty = 1;
        for(let x = 0; x < a; x++){
          song = {
            title: info.items[x].title,
            url: info.items[x].webpage_url,
            request: message.author.username,
            duration: info.items[x].duration,
            isurl: 1
          }
          queue_constructor.songs.push(song);
        }
    })
      isempty = 1;
      await fuckingplaylist(server_queue, voice_channel, queue_constructor, message, a, isempty);
      }else{
        console.log('searching playlist..');
        message.channel.send('플레이리스트 검색 중..');
    await getInfo(args[0], [], true).then(info => {
      a = info.items.length;
      console.log(`playlist found, ${a} songs added.`)
        for(let x = 0; x < a; x++){
          song = {
            title: info.items[x].title,
            url: info.items[x].webpage_url,
            request: message.author.username,
            duration: info.items[x].duration,
            isurl: 1
          }
          server_queue.songs.push(song);
        }
      })
    await fuckingplaylist(server_queue, voice_channel, queue_constructor, message, a, isempty);
      }
  }else{
    if (!server_queue || !server_queue.songs[0]){
      queue.set(message.guild.id, queue_constructor);
      queue_constructor.songs.push(song);
      try {
        const connection = await voice_channel.join();
        queue_constructor.connection = connection;
        video_player(message.guild, queue_constructor.songs[0], message, voice_channel);
      } catch (err) {
        queue.delete(message.guild.id);
        message.channel.send('연결하는데 에러가 났어요..으으..');
        throw err;
      }
    } else{
      server_queue.songs.push(song);
      return await message.channel.send(`**${song.title}** ${server_queue.songs.length -1}번째 큐에 추가됐어요!`);
    }
  }
}

async function fuckingplaylist(server_queue, voice_channel, queue_constructor, message, a, isempty){
  if(isempty == 1){
    try{
      const connection = await voice_channel.join();
      queue_constructor.connection = connection;
      await video_player(message.guild, queue_constructor.songs[0], message, voice_channel);
    }catch (err){
      queue.delete(message.guild.id);
      message.channel.send('연결하는데 에러가 났어요..으으..');
      throw err;
    }
    return await message.channel.send(`플레이리스트에서 ${a-1}개의 노래를 찾아 큐에 추가했어요!`);
    }else{
      return await message.channel.send(`플레이리스트에서 ${a}개의 노래를 찾아 큐에 추가했어요!`);
    }
}


const changevolume = (guild, message, server_queue, args) => {
  if(!args[0] || isNaN(args[0])) return message.channel.send('조정하실 볼륨을 숫자로 입력해주세요..')
  
  if(args[0] < 1 || args[0] > 100) return message.channel.send('볼륨 조절 범위를 벗어났어요..');
  changevolumevalue = args[0] / 100;
  server_queue.connection.dispatcher.setVolume(changevolumevalue);
  return message.channel.send(`볼륨을 ${args[0]}%로 맞췄어요!`);
}

let looped = 0;
let curq = 0;

const video_player = async (guild, song, message, voice_channel) => {
  const song_queue = queue.get(guild.id);

    if(!song){
      queue.delete(guild.id);
      song_queue.text_channel.send(`큐에 노래가 다 떨어졌어요..`);
      return;
    }
    
    const stream = ytdl(song.url, { filter: 'audioonly' });
  song_queue.connection.play(stream, { seek: 0, volume: changevolumevalue })
    .on('finish', () => {
        if(!song_queue.loopone && !song_queue.loopqueue) {
          song_queue.songs.shift();
          looped = 0;
        } else {looped++;}
      if(song_queue.loopqueue && !song_queue.loopone){
        curq++;
        if(curq == song_queue.songs.length) curq = 0;
      }else if(!song_queue.loopqueue){curq = 0;}
      if(song_queue.autoqueue && song_queue.songs.length == 1) {
        song_queue.text_channel.send(`유튜브에서 추천 노래 찾는 중..`);
        autoqueue(message, song_queue, 1);
      }
        video_player(guild, song_queue.songs[curq]);
      console.log(`stack : ${curq}`);
    });
    if(!song_queue.loopone) await song_queue.text_channel.send(`🎶 **${song.title}** 현재 재생 중이에요!`)
    if(song_queue.loopone) await song_queue.text_channel.send(`**${song.title}** ${looped}번 재생 중이에요!`)

}

const pause_song = (guild, message, server_queue) => {
  if(!server_queue.connection)
    return message.channel.send("일단 노래를 틀어주세요!");
  if(!message.member.voice.channel)
    return message.channel.send('먼저 음성 채널에 들어가주세요..');
  if(server_queue.connection.dispatcher.paused){
    message.channel.send('노래 다시 틀게요!');
    server_queue.connection.dispatcher.resume();
    return;
  }

  server_queue.connection.dispatcher.pause();
  return message.channel.send('노래를 잠깐 멈췄어요!');
}

const skip_song = (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('먼저 음성 채널에 들어가주세요..');
    if(server_queue.loopone) {
      server_queue.connection.dispatcher.end();
      return message.channel.send('루프 중이라 이 노래 다시 틀게요!');
    }
    if(!server_queue){
      return message.channel.send(`스킵 할 노래가 없어요!`);
    }else if(!server_queue.songs[0] || !server_queue.songs[1]){
      return message.channel.send(`스킵 할 노래가 없어요!`)
    }else{
      message.channel.send(`${message.member}님이 스킵했어요!`);
      server_queue.connection.dispatcher.end();
    }
}

const jump_song = (message, server_queue, args) => {
    if(!server_queue) return message.channel.send(`대기열에 노래가 없어요!`);
    if(!server_queue.songs[0] || !server_queue.songs[1]) return message.channel.send(`대기열에 노래가 없어요!`);
    if(isNaN(args[0])){
      return message.channel.send('점프 다음은 숫자로 입력해 주세요..');
    }else{
      if(!server_queue.loopqueue && args[0] > server_queue.songs.length -1) return message.channel.send('점프 범위를 벗어났어요!');

      let j = args[0];
      if(!server_queue.loopqueue) {server_queue.songs.splice(1, j-1);
      }else{
        if(args[0] > server_queue.songs.length || args[0] < 1) return message.channel.send('점프 범위를 벗어났어요!');
        curq = args[0] - 2;
      }
      server_queue.connection.dispatcher.end();
      return message.channel.send(`대기열 ${j}번으로 점프했어요!`);
    }
  }

const stop_song = (message, server_queue) => {
    if(!server_queue){
      return message.channel.send('음악은 이미 안나와요..');
    }else if (!server_queue.songs[0] || !server_queue.songs[1]) {
      server_queue.loopone = false;
      server_queue.loopqueue = false;
      server_queue.autoqueue = false;
      message.channel.send(`${server_queue.songs.length}개의 음악을 지우고 플레이어를 멈췄어요.`);
      server_queue.connection.dispatcher.end();
      server_queue.songs = [];
      return;
    }else {
      server_queue.loopone = false;
      server_queue.loopqueue = false;
      server_queue.autoqueue = false;
      message.channel.send(`${server_queue.songs.length}개의 음악을 지우고 플레이어를 멈췄어요.`);
      server_queue.songs = [];
      server_queue.connection.dispatcher.end();
      return;
    }
}

const leaveNow = (message, server_queue, voice_channel) => {
  if(server_queue){
    server_queue.songs = [];
    stop_song(message, server_queue);
  }
  try{
    message.guild.me.voice.channel.leave();
  }catch(err){
    throw err;
  }
    return message.channel.send(`이제 그만 가볼게요..헤헤..`);
}

  var Youtube = (function () {
    'use strict';

    var video, results;

    var getThumb = function (url, size) {
        if (url === null) {
            return '';
        }
        size    = (size === null) ? 'big' : size;
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

const np_song = (guild, message, server_queue) => {
   const Discord = require('discord.js')
    if(!server_queue || !server_queue.songs[0]) return message.channel.send("아무 노래도 틀고 있지 않아요..");
    var song = server_queue.songs[0];
  console.log(`npstack : ${curq}`);
  if(server_queue.loopqueue) { //지금 lp_queue하고 점프한다음에 lp_queue np 하면 원래 첫 큐로 np가 띄워짐. 디버깅 필요.
    var lth = getduration(server_queue, curq); 
    song = server_queue.songs[curq];
  }else {
    curq = 0;
    var lth = getduration(server_queue, 0)
  }

  var curms = server_queue.connection.dispatcher.streamTime;
  var cur = getTimestamp(Math.floor(curms / 1000));
  var thumb = Youtube.thumb(`${song.url}`, 'big');
  if(server_queue.connection.dispatcher.paused){
    var nowstatus = '⏸️  일시정지됨!'
  }else{
    var nowstatus = '▶️  지금 재생 중!'
  }
  if(server_queue.loopone && !server_queue.loopqueue){
    var curloopst = `🔂  ${looped}번 반복 됨`;
  }else if (server_queue.loopqueue && !server_queue.loopone){
    var curloopst = `🔁 큐 반복 중 : 현재 ${curq+1}번째 곡`;
  }else if(server_queue.loopqueue && server_queue.loopone){
    var curloopst = `🔁 큐 반복 : 현재 ${curq+1}번째 곡 & 🔂 싱글루프 : ${looped}번 반복 됨`;
  }else if (server_queue.autoqueue){
    var curloopst = `♾️ 자동 재생 모드`;
  }else{
    var curloopst = `꺼짐`;
  }
  const embed = new Discord.MessageEmbed()
      .setAuthor('지금 재생 중')
      .setTitle(`${song.title}`)
      .setURL(song.url)
      .setColor("#FF6F61")
      .addFields( { name: `타임라인 : ${cur} / ${lth}`, value: `루프 : ${curloopst} \n상태 : ${nowstatus} \n볼륨: ${changevolumevalue * 100}%`, inline: true},
                  { name: `신청인`, value:`${song.request}`, inline: false}, )
      .setThumbnail(thumb)

    return server_queue.text_channel.send(embed);
}

const viewqueue_song = async (guild, message, server_queue, vqmd) => {
  
  const song_queue = server_queue
  const Discord = require('discord.js');
  if(song_queue){
    let nextsongdur = getduration(server_queue, 1);
    if(server_queue.autoqueue && server_queue.songs.length == 2){
      const nextsong = new Discord.MessageEmbed()
        .setAuthor(`다음 곡`)
        .setTitle(`${server_queue.songs[1].title}`)
        .setURL(`${server_queue.songs[1].url}`)
        .setColor("#FF6F61")
        .setThumbnail(Youtube.thumb(`${server_queue.songs[1].url}`, 'big'))
        .setFooter(`${nextsongdur}`)

      await np_song(guild, message, server_queue);
      await server_queue.text_channel.send(nextsong);
      return
    }
      let queuecounter = server_queue.songs.length;
      if(queuecounter > 1){
        var lth = getduration(server_queue, curq);

        let qMsgtitle = '```\n대기열⬇ '
        let qMsg = '\n'
    
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
        if(server_queue.loopqueue){
          let lqMsg = '';
          let pages = [];
          let lqMsgtitle = '```\n' + '노래 리스트 : ' + `총 ${queuecounter}개\n\n`;
          for(var i = 0; i < queuecounter; i++){
            var lthl = getduration(server_queue, i);
            let titlevalue = textLengthCheck(server_queue.songs[i].title, 35);
            if(titlevalue.length < 38){
              for(var k = titlevalue.length; k < 38; k++) titlevalue = titlevalue + ' ';
            }
            if(i == curq) lqMsg += '>>>'
            lqMsg += `#${i+1} ${titlevalue} ${lthl} by ${server_queue.songs[i].request} \n`
            const initpagenum = parseInt((i+1) % 20);
            if(initpagenum == 0){
              lqMsg = lqMsgtitle + lqMsg + '\n```';
              pages.push(lqMsg);
              lqMsg = '';
            }
            
          }
          if(qMsg){
            lqMsg = lqMsgtitle + lqMsg + '\n```';
            pages.push(lqMsg);
          }
          return ReactionPages(message, pages, true);
        }else{
          let pages = [];
        for(var i = 1; i < queuecounter; i++){
        
          var lthl = getduration(server_queue, i);
          let titlevalue = textLengthCheck(server_queue.songs[i].title, 35);
          if (titlevalue.length < 38){
            for(var k = titlevalue.length; k < 38; k++){
            titlevalue = titlevalue + ' ';
            }
          }
          const initpagenum = parseInt(i % 20);
          
          qMsg += `#${i} ${titlevalue} ${lthl} by ${server_queue.songs[i].request} \n`
          if(initpagenum == 0){
            qMsgtitle = `노래 ${queuecounter -1 }개 대기 중`
            qMsg = qMsgtitle + qMsg + '\n```';
            pages.push(qMsg);
            qMsg = '';
          }
        }
          if(qMsg) {
            qMsg = '```' + qMsgtitle + '\n' + qMsg + '\n```';
            pages.push(qMsg);
          }
          if(vqmd == 0) np_song(message.guild, message, server_queue);
          return ReactionPages(message, pages, true);
        }
      }else{
        if(vqmd == 0) np_song(guild, message, server_queue);
        return message.channel.send('큐에 대기 중인 곡이 하나도 없네요..');
      }
    }
  return message.channel.send('노래를 먼저 틀어주세요!')
  }

function shuffle(array) {
  for(let i = array.length - 1; i > 0; i--){
    let j = Math.floor((Math.random() * i))+1;
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const shufflequeue_song = (guild, message, server_queue) => {
  if(server_queue.songs.length > 1){
    let beforeshuffle = server_queue.songs;
    shuffle(server_queue.songs);
    message.channel.send('🔀 큐에 있는 노래가 이렇게 섞였어요!');
    viewqueue_song(guild, message, server_queue);
    return;
  }else {
    return message.channel.send('큐에 노래를 두 개 이상 넣어주세요!');
  }
}

const deletequeue = (guild, message, server_queue, args) => {
  if(!args[0] || isNaN(args[0]) || args[0] <= 0 ) return message.channel.send('지울 대기열의 번호를 자연수로 입력해주세요..');
  if(args[0] > server_queue.songs.length) return message.channel.send('지울 범위를 벗어났어요!');

  let i = args[0];
  if(!args[1]){
    server_queue.songs.splice(i, 1);
    return message.channel.send(`대기열 ${i}번을 지웠어요!`);
  }else if(isNaN(args[1]) || args[1] <= 0){
    return message.channel.send('지울 범위를 자연수로 입력해 주세요..');
  }else{
    let j = args[1];
    
    if(i > j || j > server_queue.songs.length - 1) return message.channel.send('지울 범위가 이상해요..헤윽..');
    server_queue.songs.splice(i, j - i + 1);
    return message.channel.send(`대기열 ${i}번부터 ${j}번까지 지웠어요!`);
    viewqueue_song(guild, message, server_queue, 1);
  }
}

const loop_song = (guild, message, server_queue, args) => {  
  if(!args[0]) return message.channel.send(`루프를 어떻게 하실건지 써주세요! \n**=lp one/single/s** : 현재 곡만 루프\n**=lp queue/q** : 큐 단위로 루프`);
  if((args[0] === 'one' || args[0] === 'single' || args[0] === 's') && !server_queue.loopone){ 
    server_queue.loopone = !server_queue.loopone;
    return message.channel.send('🔂 현재 곡을 루프할게요!');
  }else if ((args[0] === 'one' || args[0] === 'single' || args[0] === 's') && server_queue.loopone){
    server_queue.loopone = !server_queue.loopone;
    return message.channel.send('싱글 루프를 해제했어요!');
  }else if((args[0] === 'queue' || args[0] === 'q') && !server_queue.loopqueue){
    server_queue.loopqueue = !server_queue.loopqueue;
    return message.channel.send('🔁 현재 큐를 반복할게요!');
  }else if((args[0] === 'queue' || args[0] === 'q') && server_queue.loopqueue){
    server_queue.loopqueue = !server_queue.loopqueue;
    server_queue.songs.splice(0, curq);
    return message.channel.send('큐 루프를 해제했어요!');
  }
}

async function move_song(message, server_queue, args){
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

  if(server_queue.loopqueue){
    server_queue.songs = movearray(server_queue.songs, m - 1, n - m);
  }else{
    server_queue.songs = movearray(server_queue.songs, m, n - m);
  }
  message.channel.send(`대기열 ${m}번을 ${n}번으로 옮겼어요!`);
  viewqueue_song(message.guild, message, server_queue, 1);
}

function change_song(message, server_queue, args) {
  if(!args[0] || !args[1] || isNaN(args[0]) || isNaN(args[1]) || args[0] < 1 || args[1] < 1) return message.channel.send('명령어를 제대로 쳐주세요..');

  let temp;
  let m = Number(args[0]);
  let n = Number(args[1]);

  temp = server_queue.songs[n];
  server_queue.songs[n] = server_queue.songs[m];
  server_queue.songs[m] = temp;

  message.channel.send(`대기열 ${m}번과 ${n}번의 위치를 바꿨어요!`);
  viewqueue_song(message.guild, message, server_queue, 1);
  
}

async function toggleauto(message, server_queue){
  if(!server_queue) return message.channel.send('먼저 노래를 틀어주세요!');
  if(server_queue) {
    if(server_queue.loopqueue || server_queue.loopone) return message.channel.send('먼저 루프를 꺼주세요!');
  }
  if(server_queue.songs.length == 1) autoqueue(message, server_queue, 0);
  server_queue.autoqueue = !server_queue.autoqueue;
  let toggled = server_queue.autoqueue ? '♾️  켜짐' : '꺼짐';
  message.channel.send(`자동 재생 모드를 바꿨어요! 현재 상태 : ${toggled}`);
}

async function autoqueue(message, server_queue, num){
  if(!num){
    await server_queue.text_channel.send('유튜브에서 추천 노래 찾는 중..');
  }
  if(!server_queue.autoqueue) return
    let crsong = server_queue.songs[0];
    let related = await ytdl.getBasicInfo(crsong.url);
    related = related.related_videos[0].id;
    console.log(`${crsong.url}`);
    await console.log(`${related}`);
    let song = {};

    await getInfo(related).then(info => {
      song = {
        title: info.items[0].title,
        url: info.items[0].webpage_url,
        request : '자동 재생 모드',
        duration: info.items[0].duration,
        isurl: 1
      }
      server_queue.songs.push(song);
      server_queue.text_channel.send('유튜브에서 추천 노래를 찾았어요!');
      viewqueue_song(message, message, server_queue);
    });
}
