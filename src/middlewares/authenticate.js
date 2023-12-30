import User from "../models/user";
import env from "../configs/env.json";
import { AppError } from "../handlers/error-handler";
import { checkToken } from "../utils/token";

const jwt = require("jsonwebtoken");

// Check permission for a user
export const authenticate = async (req, res, next) => {
    try {
        req.isAuthenticated = false;
        if (req.headers["authorization"] === undefined) return next();

        req.token = req.headers["authorization"].split(" ")[1];

        let tokenId = jwt.verify(req.token, env.JWT_SECRET).user._id;

        req.user = await User.findById(tokenId);

        if (req.user.isDisable === true) throw new AppError(327);

        await checkToken.accessToken(req.user._id, req.token);

        req.isAuthenticated = true;

        next();
    } catch (error) {
        return next(error);
    }
};
