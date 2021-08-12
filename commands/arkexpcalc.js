const server_usercalc = new Map();
const lmddata = require('./arknightsdata/oplmd.js');
const expdata = require('./arknightsdata/opexp.js');

module.exports = {
  name: 'exp',
  aliases: [],
  description: 'input을 start로, 그다음 정보 추가하는방식 마지막 end로 최종 결과 출력',
  async execute(client, message, cmd, args, Discord){

    const firstinfo = {
      id: message.member.id,
      member: message.member,
      calclist: [],
      storedlmd: 0,
      storedexp: 0,
      expstage: 5,
      lmdstage: 5,
    }

    server_usercalc.set(message.member.id, firstinfo);

    if(args[0] != 'start'){
      const guidemsg = new Discord.MessageEmbed()
        .setTitle('경험치 계산기 사용법')
        .addFields(
          {name:'시작 명령어', value: `**./exp start** 경험치 계산기를 시작해요.\n 시작되면 아래 명령어들을 칠 수 있어요.`},
          {name:'보유자원 기본 세팅', value: 'setting <보유용문폐> <보유고급작전기록> <보유중급작전기록> <보유초급작전기록> <보유기초작전기록> \n으로 보유 자원으로 필요한 자원값을 보정해요. 없는 자원이 있으면 0으로 꼭 입력해주세요.\n\n', inline: false},
          {name:'정보 넣기', value: `**push <레어도>**  해당 레어도의 0정 1렙부터 만렙까지의 정보를 계산 리스트에 넣어요.\n**push <레어도> <목표레벨>** : 해당 레어도의 0정 1렙부터 목표 레벨까지의 정보를 계산 리스트에 넣어요.\n ex) 5성 0정 1렙부터 1정 40렙까지 : push 5 1 40 \n**push <레어도> <현재레벨> <목표레벨>**  현재 레벨부터 목표 레벨까지의 정보를 계산 리스트에 넣어요.\n ex) 6성 1정 40렙부터 2정 90렙까지 : push 6 1 40 2 90 \n\n**pop** 가장 최근에 넣은 정보를 삭제해요. \n\n**delete <숫자>** <숫자>번째 정보를 삭제해요.\n\n`, inline: false},
          {name:'정보 보기', value: `**status** 지금까지의 계산 리스트를 보여줘요. \n\n**result** 계산기를 종료하고 계산 리스트를 토대로 필요 자원을 계산해서 출력해요.`, inline: false},
        );
      message.channel.send(guidemsg);
    }else{
      const calc = server_usercalc.get(message.member.id);
      const filter = inputmessage => (!inputmessage.author.bot && message.channel == inputmessage.channel && message.member.id == inputmessage.member.id);
      const inputcollector = message.channel.createMessageCollector(filter, {});

      message.channel.send(`${calc.member}님이 경험치 계산기 시작!`);
      
      inputcollector.on("collect", async inputmsg => {

        const info = inputmsg.content.split(" ");
        let storelmd = 0;
        let storeexp = 0;

        switch (info[0]){
          case 'push':
            let star = info[1];
            if(Number(star) < 3 || Number(star) > 6){
              await message.channel.send('레어도는 3~6성까지만 가능해요!');
              break;
            }
            let curlev = [Number(info[2]), Number(info[3])]; //1 40이면 1정 40렙
            let goallev = [Number(info[4]), Number(info[5])]; //2 70이면 2정 70렙
            //error handling command
            let curinfo = {star: star, curlev: curlev, goallev: goallev, needexp: '', needlmd: ''};

            if(info.length == 6){
              if(isNaN(info[1]) || isNaN(info[2]) || isNaN(info[3]) || isNaN(info[4]) || isNaN(info[5])){
                message.channel.send('명령어를 제대로 입력해주세요!');
                break;
              }
              if((curlev[0] > goallev[0]) || ((curlev[0] == goallev[0]) && (goallev[1] < curlev[1]))){
                message.channel.send('레벨 범위를 제대로 설정해주세요!');
                break;
              }
              if(curlev[0] < 0 || curlev[0] > 2 || goallev[0] < 0 || goallev[0] > 2 ){
                message.channel.send('레벨 범위를 제대로 설정해주세요!');
                break;
              }
              switch(star){
                case '3':
                  curinfo.needexp = expdata.expdata3[goallev[0]][goallev[1] - 1] - expdata.expdata3[curlev[0]][curlev[1] - 1];
                  curinfo.needlmd = lmddata.lmddata3[goallev[0]][goallev[1] - 1] - lmddata.lmddata3[curlev[0]][curlev[1] - 1];
                  if(!(((goallev[1] > 0 && goallev[1] < expdata.expdata3[goallev[0]].length + 1)) 
                    && (curlev[1] > 0 && curlev[1] < expdata.expdata3[curlev[0]].length + 1))){
                    curinfo.needexp = -1;
                  }
                  break;

                case '4':
                  curinfo.needexp = expdata.expdata4[goallev[0]][goallev[1] - 1] - expdata.expdata4[curlev[0]][curlev[1] - 1];
                  curinfo.needlmd = lmddata.lmddata4[goallev[0]][goallev[1] - 1] - lmddata.lmddata4[curlev[0]][curlev[1] - 1];
                  if(!(((goallev[1] > 0 && goallev[1] < expdata.expdata4[goallev[0]].length + 1)) 
                    && (curlev[1] > 0 && curlev[1] < expdata.expdata4[curlev[0]].length + 1))){
                    curinfo.needexp = -1;
                  }
                  break;

                case '5':
                  curinfo.needexp = expdata.expdata5[goallev[0]][goallev[1] - 1] - expdata.expdata5[curlev[0]][curlev[1] - 1];
                  curinfo.needlmd = lmddata.lmddata5[goallev[0]][goallev[1] - 1] - lmddata.lmddata5[curlev[0]][curlev[1] - 1];
                  if(!(((goallev[1] > 0 && goallev[1] < expdata.expdata5[goallev[0]].length + 1)) 
                    && (curlev[1] > 0 && curlev[1] < expdata.expdata5[curlev[0]].length + 1))){
                    curinfo.needexp = -1;
                  }
                  break;

                case '6':
                  curinfo.needexp = expdata.expdata6[goallev[0]][goallev[1] - 1] - expdata.expdata6[curlev[0]][curlev[1] - 1];
                  curinfo.needlmd = lmddata.lmddata6[goallev[0]][goallev[1] - 1] - lmddata.lmddata6[curlev[0]][curlev[1] - 1];
                  if(!(((goallev[1] > 0 && goallev[1] < expdata.expdata6[goallev[0]].length + 1)) 
                    && (curlev[1] > 0 && curlev[1] < expdata.expdata6[curlev[0]].length + 1))){
                    curinfo.needexp = -1;
                  }
                  break;
              }
              if(curinfo.needexp < 0 || curinfo.needlmd < 0){
                message.channel.send('레벨 범위를 제대로 설정해주세요!');
                break;
              }
              calc.calclist.push(curinfo);
              message.channel.send(`정보가 ${calc.calclist.length}번째에 입력됐어요!`);
            }else if(info.length == 4){ // 0정 1렙부터 원하는 레벨까지일때if(info.length == 6){
              if(isNaN(info[1]) || isNaN(info[2]) || isNaN(info[3])){
                message.channel.send('명령어를 제대로 입력해주세요!');
                break;
              }
              curinfo.curlev = [0, 1];
              curinfo.goallev = [info[2], info[3]];
              goallev = curinfo.goallev;
              curlev = curinfo.curlev;
              switch(star){
                case '3':
                  curinfo.needexp = expdata.expdata3[goallev[0]][goallev[1] - 1];
                  curinfo.needlmd = lmddata.lmddata3[curinfo.goallev[0]][goallev[1] - 1];
                  if(!(goallev[1] > 0 && goallev[1] < expdata.expdata3[goallev[0]].length + 1)){
                    curinfo.needexp = -1;
                  } 
                  break;

                case '4':
                  curinfo.needexp = expdata.expdata4[goallev[0]][goallev[1] - 1];
                  curinfo.needlmd = lmddata.lmddata4[goallev[0]][goallev[1] - 1];
                  if(!(goallev[1] > 0 && goallev[1] < expdata.expdata4[goallev[0]].length + 1)){
                    curinfo.needexp = -1;
                  } 
                  break;

                case '5':
                  curinfo.needexp = expdata.expdata5[goallev[0]][goallev[1] - 1];
                  curinfo.needlmd = lmddata.lmddata5[goallev[0]][goallev[1] - 1];
                  if(!(goallev[1] > 0 && goallev[1] < expdata.expdata5[goallev[0]].length + 1)){
                    curinfo.needexp = -1;
                  } 
                  break;

                case '6':
                  curinfo.needexp = expdata.expdata6[goallev[0]][goallev[1] - 1];
                  curinfo.needlmd = lmddata.lmddata6[goallev[0]][goallev[1] - 1];
                  if(!(goallev[1] > 0 && goallev[1] < expdata.expdata6[goallev[0]].length + 1)){
                    curinfo.needexp = -1;
                  } 
                  break;
              }
              if(curinfo.needexp < 0 || curinfo.needlmd < 0){
                message.channel.send('레벨 범위를 제대로 설정해주세요!');
                break;
              }
              calc.calclist.push(curinfo);
              message.channel.send(`정보가 ${calc.calclist.length}번째에 입력됐어요!`);
            }else if(info.length == 2){ // 그냥 지정한 레어도의 0정 1렙부터 만렙까지일때
              curinfo.curlev = [0, 1];
              if(isNaN(info[1])){
                message.channel.send('명령어를 제대로 입력해주세요!');
                break;
              }
              switch (star){
                case '3':
                  curinfo.goallev = [1, 55];
                  curinfo.needexp = expdata.expdata3[1][54];
                  curinfo.needlmd = lmddata.lmddata3[1][54];
                  break;

                case '4':
                  curinfo.goallev = [2, 70];
                  curinfo.needexp = expdata.expdata4[2][69];
                  curinfo.needlmd = lmddata.lmddata4[2][69];
                  break;

                case '5':
                  curinfo.goallev = [2, 80];
                  curinfo.needexp = expdata.expdata5[2][79];
                  curinfo.needlmd = lmddata.lmddata5[2][79];
                  break;

                case '6':
                  curinfo.goallev = [2, 90];
                  curinfo.needexp = expdata.expdata6[2][89];
                  curinfo.needlmd = lmddata.lmddata6[2][89];
                  break;
              }
              calc.calclist.push(curinfo);
              message.channel.send(`정보가 ${calc.calclist.length}번째에 입력됐어요!`);
            }else { //에러 핸들링
              message.channel.send('명령어를 제대로 입력해주세요!');
            }
              break;

          case 'setting':
            if(isNaN(info[1]) || isNaN(info[2]) || isNaN(info[3]) || isNaN(info[4]) || isNaN(info[5])){
              message.channel.send('명령어를 제대로 입력해주세요!');
              break;
            }
            let defaultexp = [info[2], info[3], info[4], info[5]]
            calc.storedlmd = info[1];
            calc.storedexp = defaultexp[0] * 200 + defaultexp[1] * 400 + defaultexp[2] * 1000 + defaultexp[3] * 2000;
            let settingmsg = '```' + `현재 기본 세팅\n\n보유 용문폐: ${calc.storedlmd}LMD\n보유 경험치: ${calc.storedexp}` + '```';
            message.channel.send(settingmsg);
            break;

          case 'pop':
            //pop from info stack
            if(calc.calclist.length < 1) {
              message.channel.send('최소 하나 이상의 정보를 입력해주세요!');
              break;
            }
            message.channel.send(`${calc.calclist.length}번째 정보를 뺐어요!`);
            calc.calclist.pop();
            break;

          case 'delete':
            if(isNaN(info[1])){
              message.channel.send('명령어를 제대로 입력해주세요!');
              break;
            }
            if(calc.calclist.length < 1 || info.length != 2){
              if(calc.calclist.length < 1) message.channel.send('최소 하나 이상의 정보를 입력해주세요!');
              if(info.length != 2) message.channel.send('명령어를 제대로 쳐주세요!');
              break;
            }
            calc.calclist.splice(Number(info[1]) - 1, 1);
            message.channel.send(`${info[1]}번째 정보를 뺐어요!`);
            break;

          case 'status':
            //show current info list
            if(calc.calclist.length == 0){
              message.channel.send('최소 하나 이상의 정보를 입력해주세요!');
              break;
            }
            let statusmsg = '리스트\n\n'
            for(let i = 0; i < calc.calclist.length; i++){
              let curstar = calc.calclist[i].star;
              let curcurlev = calc.calclist[i].curlev;
              let curgoallev = calc.calclist[i].goallev;
              statusmsg += `#${i+1} ${curstar}성 ${curcurlev[0]}정 ${curcurlev[1]}레벨부터 ${curgoallev[0]}정 ${curgoallev[1]}레벨까지\n`;
            }
            statusmsg = '```' + statusmsg + '```';
            message.channel.send(statusmsg);
            break;

          case 'result':
            inputcollector.stop();
            let totlmd = 0;
            let totexp = 0;
            for(let i = 0; i < calc.calclist.length; i++){
              totlmd += Number(calc.calclist[i].needlmd);
              totexp += Number(calc.calclist[i].needexp);
            }
            let fneedexp = Math.ceil((totexp - calc.storedexp) / 7400);
            let fneedlmd = Math.ceil((totlmd - calc.storedlmd) / 7500);
            let resultembed = new Discord.MessageEmbed()
              .addFields(
                {name: '필요 경험치 합계', value: `보유 제외: ${totexp}exp \n보유 포함: ${totexp - calc.storedexp}exp`, inline: true},
                {name: '필요 용문폐 합계', value: `보유 제외: ${totlmd}LMD \n보유 포함: ${totlmd - calc.storedlmd}LMD`, inline: true},
                {name: '세부결과', value: `LS-5 : ${fneedexp}회 | CE-5 : ${fneedlmd}회 | 이성 : ${(fneedexp + fneedlmd) * 30}`, inline: false },

                )
            message.channel.send(resultembed);
            break;
        }
      });
    }

  }
}
