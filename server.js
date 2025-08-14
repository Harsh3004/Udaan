const express = require("express");
const fileUpload = require('express-fileupload');

const app = express();
require('dotenv').config();

app.use(express.json());

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

const route = require('./routes/route');
app.use('/',route);

const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log('Server start successfully');
})


const cloudinaryConnect = require('./config/cloudinary');
cloudinaryConnect();

const connectDB = require('./config/db')
connectDB();
