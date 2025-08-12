const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.DB_URL)
        console.log(`Database connected Successfully with ${conn.connection.name}`);
    }
    catch(err){
        console.error(err.message);
        process.exit(1);
    }
}

module.exports = connectDB;