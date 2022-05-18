const express = require('express');
const log = require('../common/logger').create({ zone: 'ExpressServer' });

const app = express();

app.get('/', (req, res) => {
  log.info('-----HEALTH CHECK-----');
  res.send('Health check complete!');
});

module.exports = app;
