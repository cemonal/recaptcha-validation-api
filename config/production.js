module.exports = {
  domains: [
    {
      "name": "example.com",
      "secretKeyV2": "your_secret_key_here",
      "secretKeyV3": "your_secret_key_here",
      "scoreThreshold": 0.5
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
  port: 3000,
  autoValidateLocalIp: false
}