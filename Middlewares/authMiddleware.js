
const jwt = require('jsonwebtoken')

// authentication middleware
const authMiddleware = async (req, res, next) => {
    try {
        // getting token from request header
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json("Access Denied. No Token Provided")
        }

        // extracting token from Bearer header
        const token = authHeader.split(' ')[1]

        if (!token || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json("Invalid Token Format")
        }

        // verifying token
        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET)

        // storing user details in request
        req.user = verifiedToken

        // moving to next middleware or route
        next()
    }
    catch (err) {
        console.log("JWT Error:", err.message)
        res.status(401).json("Invalid or Expired Token")
    }
}

module.exports = authMiddleware
