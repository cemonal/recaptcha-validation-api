/**
 * A service for validating reCAPTCHA v2 tokens.
 */
class RecaptchaV2Service {
    /**
     * Creates an instance of RecaptchaV2Service.
     * @param {Request} req - The HTTP request object.
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

        // Check if the domain has a valid config and contains secretKeyV2
        if (!domainConfig || !domainConfig.secretKeyV2) {
            return { success: false, message: 'Invalid domain configuration.', status: 400 };
        }

        // Validate the token
        try {
            const isValid = await this._validateRecaptcha(token, domainConfig.secretKeyV2);
            const message = isValid ? "" : "reCAPTCHA validation failed.";
            const status = isValid ? 200 : 400;
            return { success: isValid, message: message, status: status };
        } catch (error) {
            logger.error(`Validation error for origin ${origin}: ${error.message}`);
            return { success: false, message: error.message, status: 500 };
        }
    }

    /**
     * Validates a reCAPTCHA v2 token using the provided secret key.
     * @param {string} token - The reCAPTCHA token to validate.
     * @param {string} secretKey - The reCAPTCHA secret key for the domain.
     * @returns {boolean} - Returns true if the token is valid, otherwise false.
     * @private
     */
    async _validateRecaptcha(token, secretKey) {
        const recaptchaEndpoint = config.recaptchaEndpoint || 'https://www.google.com/recaptcha/api/siteverify';

        const params = new URLSearchParams({
            secret: secretKey,
            response: token,
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
        return data.success;
    }
}

module.exports = RecaptchaV2Service;