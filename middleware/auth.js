import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = "bhavesh_11";

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Not authorized or token missing",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        //  console.log("Token:", token);

        const payload = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(payload.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        req.user = user;
        next();
    }
    catch (error) {
        console.log("JWT verification failed:", error);

        return res.status(401).json({
            success: false,
            message: "Token invalid or expired",
        });
    }
};