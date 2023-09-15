module.exports = {
  domains: [
    {
      "name": "example.com",
      "secretKey": "your_secret_key_here"
    }
  ],
  allowedIPs: [
  ],
  rateLimit: {
    windowMs: 900000,
    max: 100,
    active: true
  },
  recaptchaEndpoint: "https://recaptcha.net/recaptcha/api/siteverify",
  port: 3000
}