const express = require('express');
const https = require('https');
const axios = require('axios');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { createLogger, format, transports } = require('winston');
const app = express();

// Setup Winston Logger to handle both info and error logs
const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.File({ filename: `./logs/info-${new Date().toISOString().split('T')[0]}.log`, level: 'info' }),
    new transports.File({ filename: `./logs/error-${new Date().toISOString().split('T')[0]}.log`, level: 'error' })
  ]
});

// Middlewares for request parsing and security
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // Adds several production-level security measures

const rateLimitConfig = config.rateLimit;

if (rateLimitConfig && rateLimitConfig.active) {
  const limiter = rateLimit({
    windowMs: rateLimitConfig.windowMs || 15 * 60 * 1000,
    max: rateLimitConfig.max || 100
  });

  app.use(limiter);
}

// Load external configuration from JSON
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const whitelist = config.domains.map(d => d.name);

// Setup CORS policies
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

// Define common HTTP request headers for outgoing requests
const headers = { 'User-Agent': 'recaptcha-validation-api' };

// Define an HTTPS agent to handle TLS/SSL procedures
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Combine headers and HTTPS agent for easy axios usage
const requestOptions = { headers: headers, httpsAgent: httpsAgent };

// Use middleware for IP retrieval
const requestIp = require('request-ip');
app.use(requestIp.mw());

/**
 * Utility function to check against allowed IP addresses
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
  }, requestOptions);

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

  const clientIp = getClientIp(req);

  // Bypass validation if IP is whitelisted
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
 * Utility function to retrieve the client's IP address
 * Considers different headers and setups (e.g., reverse proxies)
 */
function getClientIp(req) {
  if (req.headers['x-forwarded-for']) {
    const useReverseProxy = req.query.reverseProxy === 'true';
    const ips = req.headers['x-forwarded-for'].split(',');
    return ips[useReverseProxy ? ips.length - 1 : 0].trim();
  } else if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  } else {
    return req.clientIp;
  }
}

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

const PORT = 3000;
app.listen(PORT, () => {
  logger.info(`Server has started and is listening on port ${PORT}`);
});

// Global error handler for logging and feedback
app.use((err, req, res, next) => {
  var ip = getClientIp(req);
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${ip}`);
  res.status(500).send('Something failed!');
});
