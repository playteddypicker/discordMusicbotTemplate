const ytdl = require('ytdl-core');
const ReactionPages = require('./reactionpages.js');
const Discord = require('discord.js');
const queuectrl = require('./musiccontrol/queuectrl.js');
const search = require('./musiccontrol/searchsong.js');
const player = require('./musiccontrol/setupplayer.js');
const queuepack = require('./musiccontrol/setqueue.js');
const server_queue = queuepack.server_queue;
const searchsong = search.enqueue;
const searchlist = search.searchlist;
const autoqueue = queuectrl.autoqueue;

module.exports = {
  pausesong,
  startstream,
  skipsong,
  stopsong,
  name: 'play',
  aliases: [ 
    'p', 'cq', 'skip', 's', 'stop', 'pause',
    'v', 'volume', 'loop', 'lp', 'leave', 'shuffle',
    'shuf', 'delq', 'dq', 'jump', 'j', 'move', 'mv',
    'switch', 'sw', 'setup', 'q', 'np', 'queue', 'search', 
    'sch', 'select', 'sl', 'searched', 'eject',
  ],
  description: 'asdf',
  execute(client, message, cmd, args, Discord){
    const voiceChannel = message.member.voice.channel;

    let queue = queuepack.setqueue(message.guild.id, message.channel);

    if(cmd == 'play' || cmd == 'p'){
      if(!voiceChannel) return message.channel.send('먼저 음성 채널에 들어가 주세요!');
      startstream(message, queue, args, voiceChannel);
    }else{
      command(message, cmd, args, Discord, queue)
    }
  }
}

async function command(message, cmd, args, Discord, queue){
    const voiceChannel = message.member.voice.channel;


    switch (cmd){
      case 'np':
        await queuectrl.viewnp(message, queue);
        break;

      case 'q':
      case 'queue':
        await queuectrl.viewqueue(message, queue, 1);
        break;

      case 'cq':
        console.log(server_queue);
        break;

      case 'searched':
        if(queue.searchedpages.length == 0) return message.channel.send('검색한 이력이 없어요!');
        await ReactionPages(message, queue.searchedpages);
        break;

      case 'eject':
        await stopsong(message, queue, 0);
        break;
    }

    if(voiceChannel && cmd != 'np' && cmd != 'q' && cmd != 'queue'){
      switch (cmd){
        case 'pause':
          await pausesong(message, queue, 0);
          break;

        case 'skip':
        case 's':
          await skipsong(message, queue, 0);
          break;

        case 'v':
        case 'volume':
          await queuectrl.setvolume(message, queue, args);
          break;

        case 'loop':
        case 'lp':
          await queuectrl.setloop(message, queue, args);
          break;

        case 'shuf':
        case 'shuffle':
          await queuectrl.shufflequeue(message, queue, 0);
          break;

        case 'delq':
        case 'dq':
          await queuectrl.deletequeue(message, queue, args);
          break;

        case 'jump':
        case 'j':
          await queuectrl.jumpqueue(message, queue, args);
          break;

        case 'move':
        case 'mv':
          await queuectrl.movequeue(message, queue, args);
          break;

        case 'switch':
        case 'sw':
          await queuectrl.switchqueue(message, queue, args);
          break;

        case 'search':
        case 'sch':
          await searchlist(message, queue, args);
          break;

        case 'select':
        case 'sl':
          await selectresult(message, queue, args, voiceChannel);
          break;

        case 'setup':
          await player.setupchannel(message, queue, voiceChannel);
          break;
          
        case 'stop':
          await initializequeue(message, queue);
          break;
      }
    }else{
      if(!voiceChannel) message.channel.send('먼저 음성 채널에 들어가주세요!');
    }
  if(queue.player) player.editnpplayer(message.channel);
}

async function selectresult(message, queue, args, voiceChannel){
  if(queue.searched.length == 0) return;
  if(isNaN(args[0]) || args[0] < 1) return message.channel.send('선택하신 영상을 자연수로 입력해 주세요!');

  let selected = [ queue.searched[args[0] - 1] ];
  await startstream(message, queue, selected, voiceChannel);

}

function startstream(message, queue, args, voiceChannel){
  queue.player = player.server_playermsg.get(message.guild.id);
  if(!queue.connection && !queue.isplaying && queue.songs.length == 0){
    searchsong(message, queue, args)
      .then(()=> {
        if(!message.guild.me.voice.channel || !queue.connection){
          const connection = voiceChannel.join();
          connection.then(function(connection) {
            queue.connection = connection;
            queuepack.setqueue(message.guild.id, message.channel);
          })
            .then(()=>{
              if(!queue.isplaying) playsong(message, queue, queue.songs[0]);
              if(queue.player) player.editnpplayer(message.channel);
            })
        }
      });
  }else if(queue.connection && queue.songs.length == 0 && !queue.isplaying){
    searchsong(message, queue, args)
      .then(() => {
        playsong(message, queue, queue.songs[0]);
        if(queue.player) player.editnpplayer(message.channel);
      });
  }else if(queue.connection && queue.songs.length != 0 && queue.isplaying){
    searchsong(message, queue, args).then(()=>{
      if(queue.player) player.editnpplayer(message.channel);
    })
  }else{
    message.channel.send('봇 상태에 에러가 있어요. ./stop으로 초기화시켜주세요.');
  }
}

function playsong(message, queue, song){
  queue.isplaying = true;
  if(queue.isqueueempty || queue.songs.length == 0){
    message.channel.send('큐에 노래가 다 떨어졌어요..');
    queue.isplaying = false;
    queue.isqueueempty = true;
    player.initplayer(message.channel);
    return;
  }

  const stream = ytdl(song.url, {filter : 'audioonly'});
  try{
    queue.connection.play(stream, {seek: 0, volume: queue.setVolume})
    .on('finish', () => {
    async function nextsong(message){
      if(queue.loopmode == 'single'){
        queue.looped++;
        if(queue.goallooped){
          if(queue.looped == queue.goallooped) {
            queue.loopmode = 'off';
            message.channel.send('싱글 루프 모드를 껐어요.');
            queue.songs.shift();
            queue.goallooped = undefined;
          }
        }
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
    nextsong(message).then( () => {
      playsong(message, queue, queue.songs[queue.curq]);
      if(queue.player) player.editnpplayer(message.channel);
    });
    })

    try{
      if(queue.connection.dispatcher.error){
        message.channel.send('스트리밍하는데 에러가 났어요. 다시 틀어볼게요..');
        return playsong(message, queue, queue.songs[queue.curq]);
      }
    }catch (error){
      throw error;
      try{
        if(!queue.connection.dispatcher){
          message.channel.send('스트리밍하는데 에러가 났어요. 다시 틀어볼게요..');
          return playsong(message, queue, queue.songs[queue.curq]);
        }
      }catch (error){
        throw error;
      }
    }
    if(!(queue.loopmode == 'single')) {
      if(message.channel != player.server_player.get(message.guild.id)) message.channel.send(`🎶 **${song.title}** 현재 재생 중이에요!`);
    }else{
      if(message.channel != player.server_player.get(message.guild.id)) message.channel.send(`**${song.title}** ${queue.looped+1}번 재생 중이에요!`);
    }
  }catch (err){
    throw err;
    message.channel.send('노래를 스트리밍하는데 에러가 났어요.. 다시 틀어볼게요..');
    return playsong(message, queue, queue.songs[queue.curq]);
  }
}

function skipsong(message, queue, isbuttonreact){

  if(!queue.connection) return message.channel.send('일단 노래를 틀어주세요!');
  if(queue.connection.dispatcher){
    if(queue.songs.length < 2) return message.channel.send('스킵 할 노래가 없어요!');

    if(queue.loopmode == 'single'){
      queue.songs.shift();
      queue.connection.dispatcher.end();
      queue.looped = 0;
      if(!isbuttonreact) return message.channel.send(`${message.member}님이 스킵했어요!`);
      return
    }
    queue.connection.dispatcher.end();
    if(!isbuttonreact) return message.channel.send(`${message.member}님이 스킵했어요!`);
    return
    }else{
    message.channel.send('스트리밍중이 아니에요. 만약 버그라면 ./stop으로 음악 플레이어를 초기화해주세요.');
  }
}

async function stopsong(message, queue, isbuttonreact){
  if(queue.connection == null) return message.channel.send('봇이 음성 채널에 연결이 되어있지 않아요!');
  queue.connection.disconnect();
  queuepack.initqueue(message.guild.id);
  message.channel.send('음악 플레이어를 초기화하고 음성 채널을 나갔어요.');
}

function pausesong(message, queue, isbuttonreact){
  if(!queue.isplaying) return message.channel.send(`노래를 틀고 있지 않아요..`);
  if(queue.connection.dispatcher.paused){
    if(!isbuttonreact) message.channel.send('▶️  노래 다시 틀게요!');
    queue.connection.dispatcher.resume();
  }else{
    queue.connection.dispatcher.pause();
    if(!isbuttonreact) message.channel.send('⏸️  노래를 일시정지했어요!');
  }
}

function initializequeue(message, queue){
  queue.songs = [];
  queue.connection.dispatcher.end();
  queue.searchedpages = [];
  queue.searched = [];
  queue.recentsearchkeyword = '';
  queue.isplaying = false;
  queue.loopmode = 'off';
  queue.isqueueempty = true;
  queue.setVolume = 0.3;
  queue.curq = 0;
  queue.looped = 0;
  queue.goallooped = undefined;
  message.channel.send('큐를 초기화했어요.');
}

