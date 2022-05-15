const { format } = require('date-fns');

class Logger {
  constructor({ zone = 'static' }) {
    this.zone = zone;
  }

  defaultLog(level, ...args) {
    console.log(`[${format(Date.now(), 'HH:mm:ss:ms')}]<${level}> ${this.zone} : `, ...args);
  }

  debug(...args) {
    this.defaultLog('DEBUG', ...args);
  }

  info(...args) {
    this.defaultLog('INFO', ...args);
  }

  warn(...args) {
    this.defaultLog('WARN', ...args);
  }

  error(...args) {
    this.defaultLog('ERROR', ...args);
  }
}

const log = new Logger({});

const create = (params = {}) => new Logger(params);
module.exports = {
  log,
  create,
};
