const express = require('express');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const requestIp = require('request-ip');
const app = express();
const logger = require('./logger');
const environment = process.env.NODE_ENV || 'development';

// Load configuration based on environment
let config;
switch (environment) {
  case 'production':
    config = require('../config/config.production');
    break;
  case 'test':
    config = require('../config/config.test');
    break;
  default:
    config = require('../config/config');
}

// Disable TLS certificate validation in development mode
if (environment === "development")
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const port = process.env.PORT || (config.port || 3000);

// Middlewares for request parsing and security
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // Adds several production-level security measures

// Request IP middleware
app.use(requestIp.mw());

// Rate limiting middleware
const rateLimitConfig = config.rateLimit;
if (rateLimitConfig) {
  const limiter = rateLimit({
    windowMs: rateLimitConfig.windowMs || 15 * 60 * 1000,
    max: rateLimitConfig.max || 100
  });
  app.use(limiter);
}

// CORS setup
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
app.use(cors(corsOptions));

/**
 * Utility function to check if an IP address is allowed
 * @param {string} ip - The IP address
 * @returns {boolean}
 */
function isIPAllowed(ip) {
  return config.allowedIPs.includes(ip);
}

/**
 * Core function to validate reCAPTCHA token against Google's API
 * @param {string} domain - The domain making the request
 * @param {string} token - The reCAPTCHA token
 * @returns {Promise<boolean>}
 */
async function validateRecaptcha(domain, token) {
  const domainConfig = config.domains.find(d => domain.endsWith(d.name));

  if (!domainConfig) {
    throw new Error('Domain not found in config.');
  }

  const recaptchaEndpoint = config.recaptchaEndpoint || 'https://www.google.com/recaptcha/api/siteverify';
  const response = await axios.post(recaptchaEndpoint, {
    params: {
      secret: domainConfig.secretKey,
      response: token
    }
  });

  return response.data.success;
}

// Route to validate reCAPTCHA tokens
app.post('/validate', async (req, res) => {
  const token = req.body.token;
  const domain = req.headers.origin;

  // Early exit if token is missing
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required.' });
  }

  const clientIp = requestIp.getClientIp(req);

  // Bypass validation if IP is whitelisted or local
  if (isIPAllowed(clientIp) || isLocalIp(clientIp)) {
    logger.info(`Request from allowed IP: ${clientIp}`);
    return res.json({ success: true });
  }

  // Otherwise, proceed with reCAPTCHA validation
  try {
    const isValid = await validateRecaptcha(domain, token);
    return res.json({ success: isValid });
  } catch (error) {
    logger.error(`Validation error for domain ${domain}: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Function to determine if an IP address is local (localhost or a connected local network).
 * @param {string} ipAddress - The IP address to check.
 * @returns {boolean} - Returns true if the IP is local, otherwise false.
 */
function isLocalIp(ipAddress) {
  const localIPs = ['127.0.0.1', '0.0.0.0', '::1', '::ffff:127.0.0.1'];
  const localIPRanges = ['192.168.', '10.', '172.'];

  if (localIPs.includes(ipAddress) || localIPRanges.some(range => ipAddress.startsWith(range))) {
    return true;
  }
  if (ipAddress.startsWith('172.') && (parseInt(ipAddress.split('.')[1]) >= 16 && parseInt(ipAddress.split('.')[1]) <= 31)) {
    return true;
  }
  return false;
}

// Global error handler for logging and feedback
app.use((err, req, res, next) => {
  var ip = requestIp.getClientIp(req);
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${ip}`);
  res.status(500).send('Something failed!');
});

// Start the server
app.listen(port, () => {
  logger.info(`Server is running in ${environment} mode and listening on port ${port}`);
  console.log(`Server is running in ${environment} mode and listening on port ${port}`);
});
