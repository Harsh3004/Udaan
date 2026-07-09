const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.auth = (req, res, next) => {
    try {
        let token;
        try {
            token = req?.cookies?.token || req?.body?.token || req.header('Authorization')?.replace('Bearer ', '');
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Missing Token'
            });
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token Missing'
            });
        }

        try {
            const payload = jwt.verify(token, process.env.SECRET_KEY);
            req.user = payload;
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
}

exports.isStudent = (req, res, next) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Students only'
            });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Authorization error'
        });
    }
};

exports.isAdmin = (req, res, next) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Admins only'
            });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Authorization error'
        });
    }
};

exports.isInstructor = (req, res, next) => {
    try {
        if (req.user.role !== 'Instructor') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Instructors only'
            });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Authorization error'
        });
    }
};