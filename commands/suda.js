module.exports = {
  name: '아무말',
  aliases: ['야'],
  cooldown: 2,
  description: "슨상이와 즐거운 수다",
  execute(client, message, args, Discord){

    const rand = Math.floor(Math.random() * 20);
    
    if (rand == 0){
      message.channel.send('바, 박사님, 죄송합니다, 잠깐 실례 좀 할게요. 발 밑에 동전이...');
    } else if(rand == 1){
      message.channel.send('저는 꼭 매일 3끼 디저트까지 해서 먹을 거예요!');
    } else if(rand == 2){
      message.channel.send('이 이상 연구과제를 늘린다면 1일 2식에서 2일 1식이 되어버리겠네… 으으..');
    } else if(rand == 3){
      message.channel.send('박사님도 제 작품을 보고 싶으신가요?');
    } else if(rand == 4){
      message.channel.send('어질어질하네요...');
    } else if(rand == 5){
      message.channel.send('아으으..');
    } else if(rand == 6){
      message.channel.send('으… 어제 집무실을 나설 때 불 끄는 걸 잊었어요.');
    } else if(rand == 7){
      message.channel.send('오늘 받은 의뢰는 돈이 제때 들어올까요..');
    } else if(rand == 8){
      message.channel.send('씨..씨발련아..!! 헉.. 아니.. 박사님께 한 말은 아니에요..! 으으..');
    } else if(rand == 9){
      message.channel.send('헤헤...박사님..');
    } else if(rand == 10){
      message.channel.send('나는 관계 없어... 나는 관계 없어...');
    } else if(rand == 11){
      message.channel.send('제시카씨에게 빌린 돈은 언제 갚지..');
    } else if(rand == 12){
      message.channel.send('오늘 밥 사주신다는 약속.. 잊지 않으..셨..죠..?');
    } else if(rand == 13){
      message.channel.send('하아... 오늘 저녁은 어떻게 떼울까..');
    } else if(rand == 14){
      message.channel.send('으아아.. 또 지갑에 구멍이..');
    } else if(rand == 15){
      message.channel.send('박사님은 밥을 허버허버 드시네요..');
    } else if(rand == 16){
      message.channel.send('쉬고싶다..');
    } else if(rand == 17){
      message.channel.send('어지간히 할 일이 없으신가봐요..');
    } else{
      message.channel.send('오늘은 안 때리실 거죠..?');
    }
  }
}
