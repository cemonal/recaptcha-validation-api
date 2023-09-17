# ReCAPTCHA Validation API

This API serves as a reCAPTCHA token validation service for web applications. It allows you to securely validate reCAPTCHA tokens without directly communicating with Google's reCAPTCHA services. This API is compatible with both reCAPTCHA v2 and v3.

## Features

- **Dynamic Configuration:** Easily configure the reCAPTCHA endpoint and domain settings.
- **IP Whitelisting:** Allow specific IP addresses to bypass reCAPTCHA validation.
- **CORS Support:** Define a whitelist of domains that can access the API.
- **Rate Limiting:** Implement rate limiting to prevent abuse of the API.
- **Logging:** Comprehensive logging for monitoring and debugging.

## Configuration

The API's settings are managed via a `config.js` file. Here's an overview of the available configuration options:

- `recaptchaEndpoint`: The reCAPTCHA verification endpoint URL. You can use Google's `https://www.google.com/recaptcha/api/siteverify` or alternative endpoints like `https://recaptcha.net/recaptcha/api/siteverify` in regions where Google services are restricted.
- `domains`: An array of domain configurations with `name`, `secretKeyV2`, `secretKeyV3`, and `scoreThreshold`.
- `allowedIPs`: An array of IP addresses that can bypass reCAPTCHA validation.
- `rateLimit`: Rate limiting configuration with `windowMs`, `maxRequests`, and `active`.
- `port`: The port on which the API server will run.
- `autoValidateLocalIp`: Enable automatic validation for local IP addresses.

**Example Configuration (`config.js`):**

```javascript
module.exports = {
  recaptchaEndpoint: "https://www.google.com/recaptcha/api/siteverify",
  domains: [
    {
      name: "example.com",
      secretKeyV2: "YOUR_SECRET_KEY_V2",
      secretKeyV3: "YOUR_SECRET_KEY_V3",
      scoreThreshold: 0.5,
    },
  ],
  allowedIPs: ["127.0.0.1"],
  rateLimit: {
    windowMs: 900000,
    maxRequests: 100,
    active: true,
  },
  port: 3000,
  autoValidateLocalIp: true,
};

```

## Getting Started

1. **Clone the Repository**: Clone this repository to your local machine.
2. **Install Dependencies**: Run `npm install` to install the required dependencies.
3. **Configure Settings**: Modify the `config.js` file to match your reCAPTCHA keys and other settings.
4. **Start the API**: Run `node recaptchaServer.js` to start the API server.

## API Endpoints

The API provides the following endpoints for reCAPTCHA token validation:

### Validate reCAPTCHA V2 Tokens (POST /v2/validate)

- **Request Body**:
  - `token` (string, required): The reCAPTCHA V2 token to validate.

- **Headers**:
  - `Origin` (string, required): Set this header to the domain making the request. It's essential for determining the domain configuration for validation.

- **Response**:
  - HTTP Status: 200 OK if the validation is successful.
  - HTTP Status: 400 Bad Request if the `token` is missing or invalid.
  - HTTP Status: 400 Bad Request if the `Origin` header is missing.
  - HTTP Status: 500 Internal Server Error if there's a validation error.

### Validate reCAPTCHA V3 Tokens (POST /v3/validate)

- **Request Body**:
  - `token` (string, required): The reCAPTCHA V3 token to validate.
  - `action` (string, optional): The action identifier for the reCAPTCHA.

- **Headers**:
  - `Origin` (string, required): Set this header to the domain making the request. It's essential for determining the domain configuration for validation.

- **Response**:
  - HTTP Status: 200 OK if the validation is successful.
  - HTTP Status: 400 Bad Request if the `token` is missing or invalid.
  - HTTP Status: 400 Bad Request if the `Origin` header is missing.
  - HTTP Status: 500 Internal Server Error if there's a validation error.

## Logging

This API uses the `winston` library for logging. Log files are categorized as `info` and `error`, and they provide detailed information about API requests, errors, and server start logs. Log files are stored in the `logs` directory.

## Security

- **Helmet Middleware**: This application uses the `helmet` middleware to enhance security by setting various HTTP headers.
- **Rate Limiting**: Rate limiting is applied to prevent abuse of the API.
- **CORS Policies**: Only whitelisted domains can access the API.
- **IP Whitelisting**: You can whitelist specific IP addresses to bypass reCAPTCHA validation.

## Contributions

Contributions to this project are welcome. To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and follow coding standards.
4. Submit a pull request with a detailed description of your changes.

Your contributions, whether small or large, are highly appreciated.

## References

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha)
- [Helmet Documentation](https://helmetjs.github.io/)
- [Express Rate Limit Documentation](https://www.npmjs.com/package/express-rate-limit)
- [Winston Logger Documentation](https://github.com/winstonjs/winston)
