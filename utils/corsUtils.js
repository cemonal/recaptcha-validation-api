const cors = require('cors');
const config = require('../config/config');
const logger = require('./logger');

const whitelist = config.domains.map(d => d.name);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      logger.warn('Origin header is missing or undefined');
      return;
    }
    if (whitelist.some(domain => origin.endsWith(domain))) {
      callback(null, true);
    } else {
      logger.warn(`CORS policy violation by origin: ${origin}`);
      callback(new Error('CORS policy: Not allowed by origin'), false);
    }
  }
};

module.exports = cors(corsOptions);