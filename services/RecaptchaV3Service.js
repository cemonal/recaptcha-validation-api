const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * A service for validating reCAPTCHA tokens using reCAPTCHA v3.
 */
class RecaptchaV3Service {
    /**
     * Creates an instance of RecaptchaV3Service.
     * @param {object} req - The request object containing headers.
     */
    constructor(req) {
        this.req = req;
    }

    async validate() {
        const token = this.req.body.token;

        // Early exit if token is missing
        if (!token) {
            return { success: false, message: 'Token is required.', status: 400 };
        }

        const origin = this.req.headers.origin;

        // Early exit if origin is missing
        if (!origin) {
            return { success: false, message: 'Origin is required.', status: 400 };
        }

        // Get the filtered config for the current domain
        const domainConfig = config.domains.find((domain) => origin.includes(domain.name));

        // Check if the domain has a valid config and contains secretKeyV3
        if (!domainConfig || !domainConfig.secretKeyV3) {
            return { success: false, message: 'Invalid domain configuration.', status: 400 };
        }

        // Validate the token with the provided scoreThreshold
        try {
            const isValid = await this._validateRecaptcha(token, this.req.body.action, domainConfig.scoreThreshold, domainConfig.secretKeyV3);
            const message = isValid ? "" : "reCAPTCHA validation failed.";
            const status = isValid ? 200 : 400;
            return { success: isValid, message: message, status: status };
        } catch (error) {
            logger.error(`Validation error for origin ${origin}: ${error.message}`);
            return { success: false, message: error.message, status: 500 };
        }
    }

    /**
     * Validates a reCAPTCHA token against the reCAPTCHA service.
     * @param {string} token - The reCAPTCHA token to validate.
     * @param {string} action - The action identifier for the reCAPTCHA.
     * @param {number} scoreThreshold - The minimum required score for validation.
     * @param {string} secretKey - The reCAPTCHA secret key.
     * @returns {boolean} - True if the token is valid, false otherwise.
     * @private
     */
    async _validateRecaptcha(token, action, scoreThreshold, secretKey) {
        const recaptchaEndpoint = config.recaptchaEndpoint || 'https://www.google.com/recaptcha/api/siteverify';

        const params = new URLSearchParams({
            secret: secretKey,
            response: token,
            action: action || 'default',
        });

        const response = await axios.post(recaptchaEndpoint, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (response.status !== 200) {
            throw new Error('Failed to validate reCAPTCHA.');
        }

        const data = response.data;

        if (!data.success || data.action !== action || data.score < scoreThreshold)
            return false;

        return true;
    }
}
