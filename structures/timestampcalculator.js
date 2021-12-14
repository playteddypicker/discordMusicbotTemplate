function timestamptoSec(songs){
	try{let sum = 0;
	for(let i = 0; i < songs.length; i++){
		let durtoSec = songs[i].duration.split(':');
		if(durtoSec.length == 2){
			sum += Number(durtoSec[0])*60 + Number(durtoSec[1]);
		}else if(durtoSec.length == 3){
			sum += Number(durtoSec[0])*3600 + Number(durtoSec[1])*60 + Number(durtoSec[0]);
		}
	}
	return sum;
		
	}catch (error){
		console.log(error);
		console.log(songs);
		return 0;
	}
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
	timestamptoSec,
	getTimestamp,
}
