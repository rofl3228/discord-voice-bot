const config = require('config').get('bot');

const Bot = require('./core/bot');
const singleton = require('./singleton');
const storage = require('./stores');
const { log } = require('./common/logger');

singleton.storage = storage;
const bot = new Bot(config.get('token'));

singleton.storage.init()
  .then(() => bot.launch())
  .then(() => {
    log.info('Application started');
  })
  .catch((err) => {
    log.error('App initialization failed', err);
    process.exit(-1);
  });

module.exports = bot;
