import jwt from 'jsonwebtoken';

const isLoggedIn = (req, res, next) => {
    let token;
    const authHeader = req.headers['authorization'];
    
    console.log('Auth middleware - Headers:', req.headers);
    console.log('Auth middleware - Cookies:', req.cookies);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log('Token found in Authorization header');
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
        console.log('Token found in cookies');
    } else {
        console.log('No token found in headers or cookies');
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided. Authorization denied.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

export default isLoggedIn; 