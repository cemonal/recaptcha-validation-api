const environment = process.env.NODE_ENV || 'development';

let config;

// Load configuration based on environment
switch (environment) {
  case 'production':
    config = require('./production');
    break;
  case 'test':
    config = require('./test');
    break;
  default:
    config = require('./development');
}

module.exports = config;