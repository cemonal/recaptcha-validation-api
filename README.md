# reCAPTCHA Validator API

This application serves as a backend API for validating reCAPTCHA tokens. It provides a secure and flexible solution for web applications looking to integrate reCAPTCHA validation without directly communicating with Google's or other reCAPTCHA services. The application can use different reCAPTCHA endpoints based on the region or other requirements.

## Features

- **Dynamic Endpoint Configuration:** Ability to configure the reCAPTCHA endpoint. Uses `https://www.google.com/recaptcha/api/siteverify` by default.
- **IP Whitelisting:** Bypass validation for specific IP addresses defined in the configuration.
- **CORS Handling:** Define a whitelist of domains that can access the API.
- **Rate Limiting:** To prevent abuse of the API, rate limiting is applied per IP.
- **Logging:** Comprehensive logging of information and errors, facilitating easier debugging and monitoring.

## Configuration

The application's settings are managed via a `config.json` file. Here's a brief overview of the configuration options:

- `recaptchaEndpoint`: The endpoint used for reCAPTCHA validation. If left blank, the default is `https://www.google.com/recaptcha/api/siteverify`.
- `domains`: An array of domain configurations. Each domain has a `name` and its associated `secretKey` for reCAPTCHA.
- `allowedIPs`: An array of IP addresses that can bypass the reCAPTCHA validation.
- `rateLimit`: Configuration for rate limiting. If set to `null`, rate limiting is disabled.

**Example Configuration:**

```json
{
  "recaptchaEndpoint": "https://recaptcha.net/recaptcha/api/siteverify",
  "domains": [
    {
      "name": "example.com",
      "secretKey": "YOUR_SECRET_KEY"
    }
  ],
  "allowedIPs": ["127.0.0.1"],
  "rateLimit": {
    "windowMs": 900000,
    "max": 100
  }
}
```

### 4. Usage

```markdown
## Usage

1. **Setup**: Clone the repository and install dependencies using `npm install`.
2. **Configuration**: Modify the `config.json` file to suit your requirements.
3. **Running the API**: Start the server using `node recaptchaServer.js`. It runs on port 3000 by default.
4. **Making Requests**: Send a `POST` request to `/validate` with a JSON body containing the reCAPTCHA token. The response will be a JSON object indicating the validation result.

```

## Logging

The application uses the `winston` library for logging. Logs are segregated into `info` and `error` categories, each having its own daily log file. The logs provide insights into:

- CORS violations
- IP addresses accessing the API
- Validation errors
- General information and server start logs

Logs are stored in the `logs` directory with filenames indicating their creation date and category, e.g., `info-2023-09-12.log`.

## Security

Security measures have been implemented including:

- **Helmet**: This application uses the `helmet` middleware, which sets many HTTP headers securely to protect from well-known web vulnerabilities.
- **Rate Limiting**: To safeguard against abuse and DDoS attacks, rate limiting is applied per IP. This can be configured based on your needs.
- **CORS Policies**: Only whitelisted domains can access the API, preventing unauthorized access or misuse.
- **IP Whitelisting**: Certain IP addresses can be whitelisted to bypass the reCAPTCHA validation. This ensures trusted entities have unrestricted access.

## Contributions

We welcome contributions to the reCAPTCHA Validator API! Here's how you can contribute:

1. **Fork the Repository**: Start by forking [the repository](#) (Link to your GitHub repo).
2. **Create a New Branch**: Create a new branch for your feature or bugfix.
3. **Make Your Changes**: Implement and test your changes. Ensure you follow coding standards and best practices.
4. **Submit a Pull Request**: Once you're satisfied with your changes, submit a pull request. Make sure to describe your changes in detail.
5. **Review**: Your pull request will be reviewed, and if everything looks good, it will be merged into the main branch.

Your contributions, big or small, are highly appreciated!

## References

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha)
- [Helmet Documentation](https://helmetjs.github.io/)
- [Express Rate Limit Documentation](https://www.npmjs.com/package/express-rate-limit)
- [Winston Logger Documentation](https://github.com/winstonjs/winston)