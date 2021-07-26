const queue = {
  songs: [], //노래 리스트
  connection: null, //연결되어있는지 유무
  isplaying: false, //노래를 틀고 있는지의 유무
  loopmode: 'off', //루프가 어떤 상태인지
  setVolume: 0.3,
  isqueueempty: true,
  isplayercreated: false,
  curq: 0,
  looped: 0
}

function initqueue(){
  queue.songs = [];
  queue.connection = null;
  queue.isplaying = false;
  queue.loopmode = 'off';
  queue.setVolume = 0.3;
  queue.isqueueempty = true;
  queue.curq = 0;
  queue.looped = 0;
  queue.isplayercreated = false;
}

const controlq = { initqueue, queue }

module.exports = controlq;
