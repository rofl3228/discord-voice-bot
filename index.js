const bot = require('./src');

const server = require('./src/server');
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
    server.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log.info('SIGINT handled');
  bot.stop().then(() => {
    log.info('Application shutdown');
    server.close();
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  log.error('UNHANDLED_REJECTION', err);
});

process.on('uncaughtException', (err) => {
  log.error('UNCAUGHT_EXCEPTION', err);
});
