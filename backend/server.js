const express = require("express");
const fileUpload = require('express-fileupload');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const courseRoutes = require('./routes/courseRoutes');
// const paymentRoutes = require('./routes/paymentsRoutes');
const profileRoutes = require('./routes/profileRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoute = require('./routes/contactRoute');

const app = express();
require('dotenv').config();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: `http://localhost:5173`,
    credentials: true
}));

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/',
    // limits: { fileSize: 100 * 1024 * 1024 } //Since cloudinary allow upto 100mb for free tier
}));

const cloudinaryConnect = require('./config/cloudinary');
cloudinaryConnect();

const connectDB = require('./config/db');
connectDB();

app.use('/api/auth', userRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/contact',contactRoute);
// app.use('/api/payment', paymentRoutes);

app.get('/',(req,res) => {
    return res.json({
        success: true,
        message: `Your server is running...`
    })
})

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>{
    console.log(`Server start successfully at PORT: ${PORT}`);
})