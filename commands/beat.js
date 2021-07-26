module.exports = {
  name: '줘팸',
  aliases:['애낌'],
  description: '줘팸',
  execute(client, message, cmd, args, Discord){

    const rand = Math.floor(Math.random() * 8);

    if (cmd === '줘팸'){
      if(rand == 0){
        message.channel.send("이제 그만...", 
          {files: ["https://story-img.kakaocdn.net/dn/bVu8Lx/hyKVlkhINP/iFtbvidY62QORIUkUj0mRK/img_xl.jpg?width=1000&height=1100&avg=%2523d4d4d4&v=2"]});
      }else if(rand == 1){
        message.channel.send("정말 때리실거에요..?",
          {files: ["https://story-img.kakaocdn.net/dn/b8V1iA/hyKWKcyh8O/WhxmuCykBw5EezEmeCO3C0/img_xl.jpg?width=198&height=198&avg=%2523d0d0d0&v=2"]});
      }else if(rand == 2){
        message.channel.send("", 
          {files: ["https://story-img.kakaocdn.net/dn/ce4Vwr/hyKU86jamN/JZYYYcbSPVGzAvHQZ8ZDb0/img_xl.jpg?width=202&height=198&avg=%2523a8a8a8&v=2"]});
      }else if(rand == 3){
        message.channel.send("나는 관계 없어.. 나는 관계 없어..", 
          {files: ["https://story-img.kakaocdn.net/dn/dYh9PB/hyKVkeB1YJ/Vs7sW5LCWfOsROmdwF0zck/img_xl.jpg?width=198&height=194&avg=%2523cecece&v=2"]});
      }else if(rand == 4){
        message.channel.send("좀 애껴주세요...",
          {files: ["https://story-img.kakaocdn.net/dn/bQxP61/hyKU9D9Jjb/PD6nkxgNkb2dDZlQrdAm10/img_xl.jpg?width=198&height=196&avg=%2523c4c1bd&v=2"]});
      }else if(rand == 5){
        message.channel.send("제발 그만...",
          {files: ["https://story-img.kakaocdn.net/dn/bROIkD/hyKVeZKlCl/FDMP6Rh09i60nnyyITOPnk/img_xl.jpg?width=1060&height=694&avg=%2523b5b5b5&v=2"]});
      }else if(rand == 6){
        message.channel.send("", 
          {files: ["https://story-img.kakaocdn.net/dn/bft0eL/hyKVdmhnkp/WxD0bo6mx4i0MlmmIkDyvK/img_xl.jpg?width=202&height=196&avg=%2523a2a2a2&v=2"]});
      }else if (rand == 7){
        message.channel.send("",
          {files: ["https://story-img.kakaocdn.net/dn/V4Q7w/hyKZ35nuns/aqI6PBHYy5SyvzFuMn9iKk/img.gif?width=755&height=502&avg=%252340485c&length=8248142&ani=1&duration=3300&v=2"]});
    }else if(cmd == '애낌'){
      message.author.send("고마워요 박사님..헤헤..");
    }
    
  }
}
