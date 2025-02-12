const jwt = require("jsonwebtoken");
const User = require("../models/User");

const profileMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("🚨 No token found in request headers!");
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ensure correct field name
        req.user = await User.findById(decoded._id || decoded.userId).select("-password");

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

module.exports = profileMiddleware;