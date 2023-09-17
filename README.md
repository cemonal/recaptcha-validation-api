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

### Clone the Repository

To get started with the reCAPTCHA Validator API, you'll need to clone the repository from GitHub. Follow these steps:

1. Open your terminal or command prompt.

2. Navigate to the directory where you want to store the project.

3. Use the following command to clone the repository:

   ```bash
   git clone https://github.com/cemonal/recaptcha-validation-api.git
   ```

### Install Dependencies

Before you can run the reCAPTCHA Validator API, you need to install its dependencies. The project uses Node.js and npm for package management. Follow these steps to install the required packages:

1. Open your terminal or command prompt.

2. Navigate to the root directory of the cloned repository:

   ```bash
   cd reCAPTCHA-validator-api
   ```

3. Run the following command to install the dependencies:

   ```bash
   npm install
   ```

This command will read the `package.json` file and install all the necessary packages listed in it.

Once the installation is complete, you're ready to configure the API and start the server.

### Configure Settings

To configure the settings for the reCAPTCHA Validator API, you need to modify the appropriate configuration file based on your environment. The available configuration files are located in the `config` folder:

- `development.js` (default for development)
- `test.js` (for testing)
- `production.js` (for production)

Follow these steps:

1. Navigate to the project's root directory.
2. Open the configuration file corresponding to your desired environment using a text editor or code editor. For example, to configure settings for development, open `config/development.js`.

3. Modify the configuration options as needed. This includes specifying reCAPTCHA keys, adjusting rate limiting settings, configuring allowed IP addresses, and more.

4. Save the changes to the configuration file.

By choosing the appropriate configuration file and adjusting the settings within it, you can tailor the reCAPTCHA Validator API to your specific requirements.

### Running in Development Mode

To run the reCAPTCHA Validator API in development mode, follow these steps:

1. Navigate to the project's root directory using your terminal or command prompt.

2. Use the following command to start the API with automatic server restarts:

   ```bash
   npm run dev
   ```

This command uses `nodemon` to monitor your code for changes. When you save changes to your code, the server will automatically restart, allowing for a smoother development experience.

### Running in Production Mode

To run the reCAPTCHA Validator API in production mode, make sure to set the `NODE_ENV` environment variable to `production` to indicate the production environment. This ensures that the API uses the production configuration settings defined in the `config/production.js` file.

Follow these steps to run the API in production mode:

1. **Set the Production Environment Variable**:

   ```bash
   export NODE_ENV=production
   ```

For Windows:

   ```bash
   set NODE_ENV=production
   ```

This environment variable tells the API that it should use the production configuration.

2. **Start the API**:

   ```bash
   npm start
   ```

The API will now run in production mode using the configuration settings specified in `config/production.js`.

Make sure you have configured the `config/production.js` file with the appropriate reCAPTCHA keys and any other settings required for your production environment.

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
