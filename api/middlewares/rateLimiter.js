// ======================================================
// LOGIN ATTEMPTS RATE LIMITER MIDDLEWARE
// ======================================================

// import express-rate-limit to limit repeated requests
const rateLimit = require("express-rate-limit");

/**
 * Middleware to limit login attempts per IP address.
 * 
 * Configuration:
 *   - windowMs (number): time window in milliseconds (10 minutes)
 *   - max (number): maximum allowed attempts per IP in the time window (5)
 *   - message (object): response returned when limit is exceeded
 *   - standardHeaders (boolean): include rate limit info in standard headers (RateLimit-*)
 *   - legacyHeaders (boolean): disable deprecated X-RateLimit-* headers
 * 
 * Returns:
 *   - 429 Too Many Requests when limit is exceeded
 */
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,                    // maximum 5 attempts per IP
  message: {
    message: "Too many failed login attempts. Please try again in 10 minutes.",
  },
  standardHeaders: true,      // include info in standard RateLimit headers
  legacyHeaders: false,       // disable legacy X-RateLimit-* headers
});

// export the limiter to use in login route
module.exports = { loginLimiter };
