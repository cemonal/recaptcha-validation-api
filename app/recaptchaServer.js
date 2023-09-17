const express = require('express');
const helmet = require('helmet');
const app = express();
const logger = require('../utils/logger');
const config = require('../config/config');
const rateLimiter = require('../middlewares/rateLimiter');
const timingMiddleware = require('../middlewares/timingMiddleware');
const { getClientIp, isLocalIp, isIPAllowed, requestIp } = require('../utils/ipUtils');
const RecaptchaV2Service = require('../services/RecaptchaV2Service');
const RecaptchaV3Service = require('../services/RecaptchaV3Service');
const environment = process.env.NODE_ENV || 'development';

// Disable TLS certificate validation in development mode
if (environment === "development")
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const port = process.env.PORT || (config.port || 3000);

// Middlewares for request parsing and security
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // Adds several production-level security measures

app.use(requestIp.mw());
rateLimiter.configure(app);

const corsUtils = require('../utils/corsUtils');
app.use(corsUtils);
app.use(timingMiddleware);

// Route to validate reCAPTCHA tokens using reCAPTCHA v2
app.post('/v2/validate', async (req, res) => {
  const clientIp = getClientIp(req);

  // Bypass validation if IP is whitelisted or local and auto validation is enabled
  if (isIPAllowed(clientIp) || (config.autoValidateLocalIp && isLocalIp(clientIp))) {
    logger.info(`Request from allowed IP: ${clientIp}`);
    return res.status(200).json({ success: true });
  }

  // Otherwise, proceed with reCAPTCHA validation using v2
  try {
    const recaptchaV2Service = new RecaptchaV2Service(req);
    const response = await recaptchaV2Service.validate();
    return res.status(response.status).json({ success: response.success, message: response.message });
  } catch (error) {
    logger.error(`Validation error for IP ${clientIp}: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/// Route to validate reCAPTCHA tokens using reCAPTCHA v3
app.post('/v3/validate', async (req, res) => {
  const clientIp = getClientIp(req);

  // Bypass validation if IP is whitelisted or local and auto validation is enabled
  if (isIPAllowed(clientIp) || (config.autoValidateLocalIp && isLocalIp(clientIp))) {
    logger.info(`Request from allowed IP: ${clientIp}`);
    return res.status(200).json({ success: true });
  }

  // Otherwise, proceed with reCAPTCHA validation using v3
  try {
    const response = await RecaptchaV3Service.validate();
    return res.status(response.status).json({ success: response.success, message: response.message });
  } catch (error) {
    logger.error(`Validation error for IP ${clientIp}: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Global error handler for logging and feedback
app.use((err, req, res, next) => {
  const clientIp = getClientIp(req);
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${clientIp}`);
  res.status(500).send('Something failed!');
});

// Start the server
const server = app.listen(port, () => {
  logger.info(`Server is running in ${environment} mode and listening on port ${port}`);
});

module.exports = { app, server }; 