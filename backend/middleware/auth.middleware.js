const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ensure correct field name
        //req.user = await User.findById(decoded.userId).select("-password");
        //req.user = decoded;
        // Check if the request is related to profile (use originalUrl instead of path)

        if (req.originalUrl.includes("/profile")) {
            req.user = await User.findById(decoded.userId).select("-password");
        } else {
            req.user = decoded;
        }

        if (!req.user) {
            console.log("🚨 No user found in DB with ID:", decoded.userId);
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        next();
    } catch (error) {
        console.error("🔥 Auth Error:", error);
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;

/* used for profile update only 

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("🚨 No token found in request headers!");
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ensure correct field name
        req.user = await User.findById(decoded.userId).select("-password");
        if (!req.user) {
            console.log("🚨 No user found in DB with ID:", decoded.userId);
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        next();
    } catch (error) {
        console.error("🔥 Auth Error:", error);
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;

*/

/* used for general wala

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;

*/
