const rateLimit = require('express-rate-limit');

const createLimiter = (windowMinutes, max, label) =>
    rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        max,
        standardHeaders: true,   // Return rate limit info in RateLimit-* headers
        legacyHeaders: false,     // Disable X-RateLimit-* headers
        handler: (req, res) => {
            return res.status(429).json({
                success: false,
                message: `Too many requests for ${label}. Please try again after ${windowMinutes} minutes.`
            });
        }
    });

// 5 OTP requests per IP per 15 minutes — prevents OTP brute-force / SMS spam
exports.otpLimiter = createLimiter(15, 5, 'OTP');

// 10 login attempts per IP per 15 minutes — prevents credential stuffing
exports.loginLimiter = createLimiter(15, 10, 'login');

// 10 Google auth attempts per IP per 15 minutes
exports.googleAuthLimiter = createLimiter(15, 10, 'Google login');

// 20 AI calls per IP per hour — prevents Groq API credit exhaustion
exports.aiLimiter = createLimiter(60, 20, 'AI features');
