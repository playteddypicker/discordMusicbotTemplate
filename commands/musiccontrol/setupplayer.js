const Discord = require('discord.js');
const server_player = new Map();
const server_playermsg = new Map();
const queuepack = require('./setqueue.js');
const server_queue = queuepack.server_queue;
const ytdl = require('ytdl-core');
const { getInfo } = require('ytdl-getinfo');

async function setupchannel(message, queue, voiceChannel){
  let findchannel = message.channel.guild.channels.cache.find((channel) => channel.name.toLowerCase() === `슨상플레이어`);
  if(!findchannel) {
    findchannel = await message.guild.channels.create('슨상플레이어', "text");
    server_player.set(message.guild.id, findchannel);
  }else{
    findchannel.delete();
    server_player.delete(message.guild.id);
    message.channel.send('플레이어를 삭제했어요!');
    queue.isplayercreated = false;
    return;
  }
  await syncchannel(findchannel);
}

async function syncchannel(channel){
  let channelinfo = server_player.get(channel.guild.id);
  const queue = await server_queue.get(channel.guild.id);
  await channel.bulkDelete(10);
  let initembed = new Discord.MessageEmbed()
    .setColor('#FF6F61')
    .setTitle('아무 노래도 틀고 있지 않아요..')
    .setDescription('다른 채널에서 ./play 명령어로 노래를 틀거나\n이곳에 노래 제목/링크를 써주세요.')
    .setImage('https://story-img.kakaocdn.net/dn/kWE0N/hyKZWY3Jh6/FAK0m5sKEgvpXVNZk8zXgK/img_xl.jpg?width=662&height=454&avg=%2523ceaf6f&v=2');
  let setqueuelist = '큐에 아무 노래도 없어요.';

  let background = await channel.send('', {files: ["https://story-img.kakaocdn.net/dn/bNQRyW/hyK4GnpfHm/LnvZ5CXTFKfKGSLl3Rykd0/img_xl.jpg?width=1259&height=624&avg=%2523b87462&v=2"]});
  queue.player = await channel.send(setqueuelist, initembed);
  await server_playermsg.set(channel.guild.id, queue.player);
  setupplayer(channel);
  const filter = m => m != queue.player;
  const collector = channel.createMessageCollector(filter, {});

  collector.on("collect", message => {
    if(message != queue.player || message != background) {
      message.delete({timeout: 3000});
    }
  });
}

async function setupplayer(channel){
  const playermsg = await server_playermsg.get(channel.guild.id);
  const player = await server_player.get(channel.guild.id);

  const emoji = ["⏯️", "⏹️", "⏭️", "🔀", "🔂", "🔁", "♾️"];
  
  for(let i = 0; i < emoji.length; i++){
    await playermsg.react(emoji[i]);
  }

  const filter = (reaction, user) =>
    emoji.includes(reaction.emoji.name);

  const collector = playermsg.createReactionCollector(filter, {});
  let i = 0;

  collector.on("collect", async(reaction, user) => {
    const queue = await server_queue.get(channel.guild.id);
    reaction.users.remove(user);
    if(!queue.isplaying){
        let warningmsg = await channel.send('노래를 먼저 틀어주세요!');
      }else{
        switch (reaction.emoji.name){
          case emoji[0]:
            await pauseforbutton(channel, queue);
            editnpplayer(channel);
            break;

          case emoji[1]:
            await stopforbutton(channel, queue);
            initplayer(channel);
            break;

          case emoji[2]:
            await skipforbutton(channel, queue);
            break;

          case emoji[3]:
            await shuffleforbutton(channel, queue);
            editnpplayer(channel);
            break;

            case emoji[4]:
            if(!(queue.loopmode == 'single')){
              queue.loopmode = 'single';
            }else queue.loopmode = 'off';
            await editnpplayer(channel);
            break;

          case emoji[5]:
            if(!(queue.loopmode == 'queue')) {
              queue.loopmode = 'queue';
            }else {
              queue.loopmode = 'off';
              if(queue.curq != 0){
                queue.songs = queue.songs.splice(queue.curq, queue.songs.length);
                queue.curq = 0;
              }
            }
            await editnpplayer(channel);
            break;

          case emoji[6]:
            if(!(queue.loopmode == 'auto')) {
              queue.loopmode = 'auto';
              if(queue.songs.length == 1) await autoqueueforbutton(channel, queue);
            }else queue.loopmode = 'off';
            await editnpplayer(channel);
            break;
        }
      }
  });
}

async function editnpplayer(channel){
  const queue = await server_queue.get(channel.guild.id);
  const playermsg = await server_playermsg.get(channel.guild.id);
  const player = await server_player.get(channel.guild.id);

  if(queue.songs.length == 0 || !queue.isplaying) return initplayer(channel);
  let loopstatus = '꺼짐';
  if(queue.loopmode == 'single') loopstatus = `🔂 ${queue.looped}번 반복 됨`;
  if(queue.loopmode == 'queue') loopstatus = `🔁 큐 반복 중`; 
  if(queue.loopmode == 'auto') loopstatus = `♾️ 자동 재생 모드`;

  let playstatus = '';
  if(!queue.connection){
    playstatus = '⏹️  재생 중이 아님';
  }else{
    if(queue.connection.dispatcher.paused) playstatus = '⏸️  일시정지됨';
    if(queue.connection.dispatcher.resume) playstatus = '▶️  지금 재생 중!';
  }

  let embed = new Discord.MessageEmbed()
    .setColor('#FF6F61')
    .setDescription(`상태 : ${playstatus} | 루프: ${loopstatus} | 볼륨: ${queue.setVolume * 100}%`)
    .setTitle(`${queue.songs[queue.curq].title}`)
    .setURL(queue.songs[queue.curq].url)
    .setImage(queue.songs[queue.curq].thumbnail)

  let setqueuelist = ``;
  if(!(queue.loopmode == 'queue')){
    for(let i = queue.songs.length - 1; i > 0; i--){
      const songlength = getTimestamp(queue.songs[i].duration);
      setqueuelist += `#${i}. [${songlength}] ${queue.songs[i].title}\n`
    }
  }else{
    for(let i = queue.songs.length - 1; i >= 0; i--){
      const songlength = getTimestamp(queue.songs[i].duration);
      if(i == queue.curq) setqueuelist += '>>>';
      setqueuelist += `#${i}. [${songlength}] ${queue.songs[i].title}\n`
    }
  }

  await playermsg.edit(setqueuelist, embed);
  return embed;
}

async function initplayer(channel){
  const queue = await server_queue.get(channel.guild.id);
  const playermsg = await server_playermsg.get(channel.guild.id);
  const player = await server_player.get(channel.guild.id);

  let initembed = new Discord.MessageEmbed()
    .setColor('#FF6F61')
    .setTitle('아무 노래도 틀고 있지 않아요..')
    .setDescription('다른 채널에서 ./play 명령어로 노래를 틀거나\n이곳에 노래 제목/링크를 써주세요.')
    .setImage('https://story-img.kakaocdn.net/dn/kWE0N/hyKZWY3Jh6/FAK0m5sKEgvpXVNZk8zXgK/img_xl.jpg?width=662&height=454&avg=%2523ceaf6f&v=2');
  let setqueuelist = '큐에 아무 노래도 없어요.';

  await playermsg.edit(setqueuelist, initembed);
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

function skipforbutton(channel, queue){
  if(!queue.connection) return channel.send('일단 노래를 틀어주세요!');
  if(queue.connection.dispatcher){
    if(queue.songs.length < 2) return channel.send('스킵 할 노래가 없어요!');
    if(queue.loopmode == 'single'){
      queue.songs.shift();
      queue.connection.dispatcher.end();
      queue.looped = 0;
      return;
    }
    queue.connection.dispatcher.end();
    return;
  }else{
    channel.send('스트리밍중이 아니에요. 만약 버그라면 정지 버튼을 눌러서 음악 플레이어를 초기화해주세요.');
  }
}

async function stopforbutton(channel, queue){
  await queuepack.initqueue(channel.guild.id);
  queue.isqueueempty = true;
  if(queue.songs.length > 0){
    try{
      await queue.connection.dispatcher.end();
    }catch(error){
      channel.guild.me.voice.channel.leave();
      channel.send('스트리밍하는데 에러가 나서 음악 플레이어를 초기화 하고 음성 채널을 나갔어요.');
      throw error;
    }
  }
}

function pauseforbutton(channel, queue){
  if(!queue.isplaying) return channel.send('노래를 틀고 있지 않아요..');
  if(queue.connection.dispathcer.paused){
    queue.connection.dispatcher.resume();
  }else{
    queue.connection.dispatcher.pause();
  }
}

function shuffleforbutton(channel, queue){
  if(queue.songs.length < 2) return channel.send('큐에 노래를 두 개 이상 넣어주세요!');
  
  for(let i = queue.songs.length - 1; i >= 0; i--){
    if(i == queue.curq) continue;
    let j = Math.floor((Math.random() * i)) + 1;
    if(j == queue.curq) continue;
    [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
  }
}

async function autoqueueforbutton(channel, queue){
  channel.send('유튜브에서 추천 노래 찾는중..')
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
      thumbnail: Youtube.thumb(`${info.items[0].webpage_url}`, 'big'),
      }
      queue.songs.push(song);
      channel.send('유튜브에서 추천 노래를 찾았어요!');
  });
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

const player = {server_player, server_playermsg, setupchannel, syncchannel, editnpplayer, initplayer};
module.exports = player;
