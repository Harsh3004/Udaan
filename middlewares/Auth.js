const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.auth = (req,res,next) => {
    try{
        console.log(`In auth function`);

        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ","");

        console.log(`token fetched`);
        if(!token || token === undefined){
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
        console.log(req.user);
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