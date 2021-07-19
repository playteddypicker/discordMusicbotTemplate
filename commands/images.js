var Scraper = require('images-scraper');

const google = new Scraper({
  puppeteer: {
    headless: true
  }
})
module.exports = {
  name: 'image',
  description: '짤 보여줌',
  async execute(client, message, cmd, args, Discord){
    const image_query = args.join(' ');
    if(!image_query) return message.channel.send('짤 이름을 적어주세요..');

    const image_results = await google.scrape(image_query, 1);
    message.channel.send(image_results[0].url);
  }
}
