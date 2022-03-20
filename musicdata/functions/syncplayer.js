const mongoose = require('mongoose');
const { serverInfoList } = require('../structures/musicServerInfo.js');
const defaultBannerMessage = `
	**플레이어 사용법**

	이 채널에 채팅으로 노래제목/링크/플레이리스트 링크를 치면 노래가 재생됩니다.

	**기본 기능**
	⏯️ : 노래 일시정지 | 다시재생
	⏏️ : 노래 멈추고 모든 노래 제거, 초기화, 음성 채널 나감 
	⏹️ : 노래 멈추고 대기 중인 모든 노래 제거, 모든 상태(루프 등) 초기화
	⏭️ : 노래 스킵
	✂️\: 대기열만 초기화

	**고급 기능**
	🔀 : 대기열 셔플
	🔂 : 싱글 루프 모드 활성화/비활성화 
	🔁 : 대기열 반복 모드 활성화/비활성화
	♾️ : 자동 재생 모드 활성화/비활성화
	⏳: 현재 타임라인 시간 보기

	**추가 기능**
	🔈 : 볼륨 10% 감소
	🔊 : 볼륨 10% 증가
	❌ : 대기열 맨 마지막 노래 지우기
	⤴️ : 다음 곡을 대기열 맨 뒤로 옮기기
	⤵️ : 대기열 맨 마지막 노래를 맨 앞으로 옮기기
`;

async function syncPlayerChannel(guildId){
	const server = serverInfoList.get(guildId);
	//if(!server.playerInfo.setupped) return;
	const playerChannel = await server.guild.channels.fetch(server.playerInfo.channelId);

	//채널 초기화
	await playerChannel.bulkDelete(10, true);

	const playerBannerMessage = playerChannel.send({
		contents: defaultBannerMessage,
		files: ['./attatchments/playerbanner.jpg'],
	});
	playerEmbedMessage = playerChannel.messages.fetch(server.playerInfo.playermsg.embed.id);
}

module.exports = {
	syncPlayerChannel
}
