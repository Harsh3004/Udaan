const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.auth = (req,res,next) => {
    try{
        console.log(`In auth function`);
        let token;
        try{
            token = req?.cookies?.token || req?.body?.token || req.header("Authorization")?.replace("Bearer ", "");
            console.log("Extracted Token:", token);
        }catch(error){
            console.log("User: ",req?.user);
            console.log("Cookies: ", req?.cookies);
            console.log("Cookies: ", req?.cookies?.token);
            console.log("Body", req?.body?.token);
            console.log(req.header("Authorization"));

            return res.status(401).json({
                success: false,
                message: "Missing Token"
            })
        }

        console.log(`token fetched`);
        if(!token){
            return res.status(401).json({
                success: false,
                message: `Token Missing`
            })
        }

        try{
            const payload = jwt.verify(token,process.env.SECRET_KEY);
            req.user = payload;
        }catch(err){
            return res.status(401).json({
                success: false,
                message: `Invalid Token`
            })
        }

        next();

    }catch(error){
        return res.status(401).json({
            success: false,
            message: `Unauthorized User`
        })
    }
}

exports.isStudent = (req,res,next) => {
    try{
        if(req.user.role !== "Student"){
            return res.status(401).json({
                success: false,
                message: `Invalid User`
            })
        }

        next();
    }catch(err){
        return res.status(500).json({
            success: false,
            message: `Error: Invalid User`
        })
    }
}

// to be tested
exports.isAdmin = (req,res,next) => {
    try{
        if(req.user.role !== "Admin"){
            return res.status(401).json({
                success: false,
                message: `Invalid User`
            })
        }

        next();
    }catch(err){
        return res.status(500).json({
            success: false,
            message: `Error: Invalid User`
        })
    }
}

exports.isInstructor = (req,res,next) => {
    console.log('Checking for Instructor...');
    try{
        if(req.user.role !== "Instructor"){
            return res.status(401).json({
                success: false,
                message: `Invalid User`
            })
        }

        next();
    }catch(err){
        return res.status(500).json({
            success: false,
            message: `Error: Invalid User`
        })
    }
}