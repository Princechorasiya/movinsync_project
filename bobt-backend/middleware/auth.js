const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const { CURSOR_FLAGS } = require("mongodb");

const authMiddleware = async (req, res, next) => {
	try {
		console.log(req);
		const token = req.header("Authorization")?.replace("Bearer ", "");
		if (!token) return res.status(401).json({ message: "No token provided" });

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		console.log(decoded);
		const user = await User.findById(decoded.userId);
		if (!user) return res.status(401).json({ message: "User not found" });

		req.user = user; // Attach user info to the request
		next();
	} catch (error) {
		res.status(401).json({ message: "Invalid or expired token" });
	}
};

module.exports = authMiddleware;
