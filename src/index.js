const fetch = require('node-fetch');
const config = require('config');

const Bot = require('./core/bot');
const server = require('./server');
const singleton = require('./singleton');
const storage = require('./stores');
const { log } = require('./common/logger');

singleton.storage = storage;
const bot = new Bot(config.get('bot.token'));

singleton.storage.init()
  .then(() => bot.launch())
  .then(() => {
    server.listen(config.get('server.port'));
    setInterval(() => {
      fetch(config.get('server.selfUrl'), { method: 'GET' }).catch((err) => log.error({ err }, 'FETCH_ERROR'));
    }, parseInt(config.get('server.pingTimeout'), 10));
  })
  .then(() => {
    log.info('Application started');
  })
  .catch((err) => {
    log.error('App initialization failed', err);
    process.exit(-1);
  });

module.exports = bot;
