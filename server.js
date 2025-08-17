const express = require("express");
const fileUpload = require('express-fileupload');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const subsectionRoutes = require('./routes/subsectionRoutes');

const app = express();
require('dotenv').config();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: `http://localhost:3000`,
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

app.use('/api/auth', authRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/section', sectionRoutes);
app.use('/api/subsection', subsectionRoutes);

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