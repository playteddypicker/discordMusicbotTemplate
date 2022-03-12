function totalSongDuration(queue){
	let sum = 0;
	for(let i = 0; i < queue.length; i++){
		let durtoSec = song[i].duration.split(':');
		sum += durtoSec.length == 2 ?
			Number(durtoSec[0])*60 + Number(durtoSec[1]) :
			Number(durtoSec[0])*3600 + Number(durtoSec[1])*60 +Number(durtoSec[2] ?? 0);	
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

module.exports = {
	totalSongDuration,
	getTimestamp
}
