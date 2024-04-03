import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import env from "../configs/env.json";
import { AppError } from "../handlers/error-handler";
import { JwtType, RequestType } from "../interfaces/index";
import { User } from "../models/user";
import { checkToken } from "../utils/token";

// Check permission for a user
export const authenticate = async (
    req: RequestType,
    res: Response,
    next: NextFunction
) => {
    try {
        req.isAuthenticated = false;
        if (req.headers["authorization"] === undefined) return next();

        req.token = req.headers["authorization"].split(" ")[1];

        let userId: string = (jwt.verify(req.token, env.JWT_SECRET) as JwtType)
            .user._id;

        req.user = await User.findById(userId);

        if (req.user?.isDisable === true) throw new AppError(327);

        await checkToken.accessToken(req.user?._id, req.token);

        req.isAuthenticated = true;

        next();
    } catch (error) {
        return next(error);
    }
};
