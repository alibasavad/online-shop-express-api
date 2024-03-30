import * as constants from "../constants/index";
import { Request, Response, NextFunction } from "express";

// throw not found error for not defined end points
export const notFound = (
    req: Request,
    res: Response,
    next: NextFunction
): Response => {
    return res.status(404).json({
        success: false,
        message: "Api url doesn't exist ",
    });
};

// creat a new error class as Apperror
export class AppError extends Error {
    constructor(
        public errorCode: number,
        message?: unknown,
        public statusCode: number = constants.errors.errorCodes[errorCode].code
    ) {
        let M: string = "";
        if (message) {
            if (message instanceof Object)
                M = "  :  " + JSON.stringify(message);
            else if (typeof message === "number")
                M = "  :  " + constants.messages.messageCodes[message].message;
        }
        super(constants.errors.errorCodes[errorCode].message + M);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

// error hendler try ro send error with specefic format using Apperror class
export const errorHandler = (
    error: any,
    req: Request,
    res: Response,
    next?: NextFunction
): Function | Response => {
    if (error.name === "ValidationError") {
        return errorHandler(new AppError(305, error.message), req, res, next);
    }

    if (error.name === "MongoServerError") {
        return errorHandler(new AppError(303, error.keyValue), req, res, next);
    }

    if (error.name === "TokenExpiredError") {
        return errorHandler(new AppError(308), req, res, next);
    }

    if (error.name === "BSONError") {
        return errorHandler(new AppError(300), req, res, next);
    }

    if (error.name === "TypeError") {
        return errorHandler(new AppError(300), req, res, next);
    }

    if (error.name === "CastError") {
        return errorHandler(new AppError(300), req, res, next);
    }

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            message: error.message,
            errorCode: error.errorCode,
        });
    }

    return res.status(500).json({
        errorName: error.name,
        errorMessage: error.message,
        error: error,
    });
};
