require('dotenv').config();

const express = require("express");
const http = require('http');
const helmet = require('helmet');
const fileUpload = require('express-fileupload');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const courseRoutes = require('./routes/courseRoutes');
const paymentRoutes = require('./routes/paymentsRoutes');
const profileRoutes = require('./routes/profileRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoute = require('./routes/contactRoute');
const categoryRoutes = require('./routes/categoryRoutes');
const aiRoutes = require('./routes/aiRoutes');
const chatRoutes = require('./routes/chatRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const validateEnv = require('./config/validateEnv');

// Validate required env vars before anything else — fail fast with a clear message
validateEnv();

const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

// Security headers — removes X-Powered-By, adds CSP, X-Frame-Options, etc.
app.use(helmet());

app.use(express.json());
app.use(cookieParser());

// FIX: filter out undefined entries — prevents fail-open when env vars are missing
const allowedOrigins = [
  process.env.CLIENT_URL_DEV,
  process.env.CLIENT_URL_PROD
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow same-origin (Postman, server-to-server) if list is non-empty
    // If allowedOrigins is empty, reject ALL cross-origin requests (fail-closed)
    if (!origin && allowedOrigins.length > 0) {
      return callback(null, true);
    }
    if (origin && allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error(`CORS blocked: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/',
}));

const cloudinaryConnect = require('./config/cloudinary');
cloudinaryConnect();

const connectDB = require('./config/db');
connectDB();

app.use('/api/auth', userRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/contact',contactRoute);
app.use('/api/category', categoryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/discussion', discussionRoutes);
app.use('/api/resource', resourceRoutes);

app.get('/', (req, res) => {
    return res.json({
        success: true,
        message: 'Udaan API is running.'
    });
});

// Health check endpoint for Render / uptime monitors
app.get('/health', (req, res) => {
    return res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 4000;

// Create HTTP server and integrate Socket.io
const server = http.createServer(app);
const { initSocket } = require('./config/socket');
initSocket(server);

server.listen(PORT, ()=>{
    console.log(`Server start successfully at PORT: ${PORT}`);
    console.log(`Socket.io is ready for real-time messaging`);
})