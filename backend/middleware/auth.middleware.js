import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
    try {
        // Extract the token from cookies or Authorization header
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];

        // If no token is found, return a 401 Unauthorized response
        if (!token) {
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        // Check if the token is blacklisted
        const isBlackListed = await redisClient.get(token);
        if (isBlackListed) {
            // Clear the token cookie and return a 401 Unauthorized response
            res.cookie('token', '');
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the decoded user information to the request object
        req.user = decoded;
        // Pass control to the next middleware or route handler
        next();
    } catch (error) {
        // Log the error and return a 401 Unauthorized response
        console.log(error);
        res.status(401).send({ error: 'Unauthorized User' });
    }
}
