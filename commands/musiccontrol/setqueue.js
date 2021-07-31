const server_queue = new Map();

function setqueue(id){

  const initializequeue = {
    server_id: '',
    songs: [],
    searched: [],
    searchedpages: [],
    recentsearchkeyword: '',
    connection: null,
    isplaying: false,
    loopmode: 'off',
    setVolume: 0.3,
    isqueueempty: true,
    isplayercreated: false,
    curq: 0,
    looped: 0,
    goallooped: undefined,
    player: null,
  }

  let queue = server_queue.get(id);

  if(!queue){
    server_queue.set(id, initializequeue);
    server_queue.get(id).server_id = id;
    queue = server_queue.get(id);
  }

  return queue;
}

const queuepack = { server_queue, setqueue };

module.exports = queuepack;
