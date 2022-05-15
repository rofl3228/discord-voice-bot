const singleton = require('./src/singleton');
const storage = require('./src/stores');
const bot = require('./src');
const { log } = require('./src/common/logger');

if (process.platform === 'win32') {
  // eslint-disable-next-line global-require
  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on('SIGINT', () => {
    process.emit('SIGINT');
  });
}

process.on('SIGTERM', () => {
  log.info('SIGTERM handled');
  bot.stop().then(() => {
    log.info('Application shutdown');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log.info('SIGINT handled');
  bot.stop().then(() => {
    log.info('Application shutdown');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  log.error('UNHANDLED_REJECTION', err);
});

process.on('uncaughtException', (err) => {
  log.error('UNCAUGHT_EXCEPTION', err);
});
