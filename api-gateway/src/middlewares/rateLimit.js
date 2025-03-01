const rateLimit = require("express-rate-limit");

const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Allow max 10 requests per minute
  message: { error: "Too many requests, please try again later." },
  headers: true, // Send rate limit headers in response
});

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Allow max 5 login attempts per 15 minutes
  message: { error: "Too many login attempts. Try again later." },
  headers: true,
});

const taskCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 tasks per hour per user
  message: { error: "Task creation limit reached. Try again later." },
  headers: true,
});

module.exports = { apiRateLimiter, loginRateLimiter, taskCreationLimiter };
