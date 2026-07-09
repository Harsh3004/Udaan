/**
 * Validates that all required environment variables are present at startup
 * If any are missing, logs clearly and exits — preventing runtime failures
 */

const REQUIRED_ENV_VARS = [
    // Core server
    'PORT',
    'SECRET_KEY',
    // Database 
    'DB_URL',
    // Cloudinary
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    // Razorpay
    'RAZORPAY_KEY',
    'RAZORPAY_SECRET',
    // Groq AI
    'GROQ_API_KEY',
    // Gmail OAuth2
    'GMAIL_CLIENT_ID',
    'GMAIL_CLIENT_SECRET',
    'GMAIL_REFRESH_TOKEN',
    'MAIL_USER',
    // CORS
    'CLIENT_URL_PROD',
];

const OPTIONAL_ENV_VARS = [
    'CLIENT_URL_DEV', // Optional: only needed locally
];

const validateEnv = () => {
    const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('Missing required environment variables:');
        missing.forEach(key => console.error(`   • ${key}`));
        process.exit(1);
    }

    const missingOptional = OPTIONAL_ENV_VARS.filter(key => !process.env[key]);
    if (missingOptional.length > 0) {
        console.warn('Optional env vars not set (OK in production):');
        missingOptional.forEach(key => console.warn(`   • ${key}`));
    }

    console.log('Environment variables validated');
};

module.exports = validateEnv;
