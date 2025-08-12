const express = require("express");
const app = express();
require('dotenv').config();

app.use(express.json());

const route = require('./routes/route');
app.use('/',route);

const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log('Server start successfully');
})

const connectDB = require('./config/db')
connectDB();

