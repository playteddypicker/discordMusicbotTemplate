const queuectrl = require('./queuectrl.js');
const player = require('./setupplayer.js');
const getTimestamp = queuectrl.getTimestamp;
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { getInfo } = require('ytdl-getinfo');
const Discord = require('discord.js');
const ReactionPages = require('../reactionpages.js');
const setuppedchannel = require('./setupplayer.js');

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
            thumbnail: Youtube.thumb(`${info.items[i].webpage_url}`, 'big')
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
      thumbnail: Youtube.thumb(`${song_info.videoDetails.video_url}`, 'big')
    }
      await queue.songs.push(song);
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
        duration: video.duration.seconds,
        thumbnail: Youtube.thumb(`${video.url}`, 'big')
      }
      await queue.songs.push(song);
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
    let curms = queue.connection.dispatcher.streamTime;
    let curs = Math.floor(curms / 1000);
    for(let i = queue.curq; i < queue.songs.length -1; i++){
      totdur += Number(queue.songs[i].duration);
    }
    let newqueue = new Discord.MessageEmbed()
      .setAuthor(`${queue.songs.length - 1}번째 큐에 추가됨`, message.author.avatarURL())
      .setTitle(`${song.title}`)
      .setURL(`${song.url}`)
      .setThumbnail(Youtube.thumb(`${song.url}`, 'big'))
      .setFooter(`노래 길이: ${getTimestamp(parseInt(song.duration))} | 재생까지 남은 시간: ${getTimestamp(Number(totdur) - Number(curs))}`);
    if(message.channel != setuppedchannel.server_player.get(message.guild.id)) message.channel.send(newqueue);
  }
}

async function searchlist(message, queue, args){
  queue.searched = [];
  queue.searchedpages = [];
  queue.recentsearchkeyword = args.join(' ');
  const searchedlist = await ytSearch(args.join(' '));
  const result = searchedlist.videos;

  let resultembed = new Discord.MessageEmbed()
    .setTitle(`검색 결과 : ${result.length}개`)
    .setDescription('./select or ./sl <번호>로 선택')
    .setColor("FF6F61")

  for(let i = 1; i <= result.length; i++){
    resultembed.addFields({
      name: `#${i} ${result[i-1].title}`,
      value: `[${result[i-1].timestamp}] ${result[i-1].url}`,
      inline: false
    });
    queue.searched.push(result[i-1].url);
    let initpagenum = parseInt(i % 5);
    if(initpagenum == 0){
      queue.searchedpages.push(resultembed);
      resultembed = new Discord.MessageEmbed()
        .setTitle(`검색 결과 : ${result.length}개`)
        .setDescription('./select or ./sl <번호>로 선택')
        .setColor("FF6F61")
    }
  }

  ReactionPages(message, queue.searchedpages);

}

let search ={enqueue, searchlist};
module.exports = search;
