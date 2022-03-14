function totalSongDuration(queue){
	let sum = 0;
	for(let i = 0; i < queue.length; i++){
		sum += timestamptoSecond(queue[i].duration);
	}
	return sum;
}

function getTimestamp(seconds){
	let sec = seconds % 60;
	let min = parseInt((seconds/60)%60);
	let hr = parseInt(seconds/3600);
	if(sec.toString().length == 1) sec = '0' + sec;
	if(min.toString().length == 1) min = '0' + min;
	if(hr == 0) return min + ':' + sec;
	return hr + ':' + min + ':' + sec;
}

function timestamptoSecond(duration){
	const ary = duration.split(':');
	return ary.length == 1 ? Number(ary[0]) 
		: ary.length == 2 ? Number(ary[0])*60 + Number(ary[1]) 
		: Number(ary[0])*3600 + Number(ary[1])*60 + Number(ary[2]);
}

module.exports = {
	totalSongDuration,
	getTimestamp,
	timestamptoSecond
}
