import { Request, Response } from "express";
import * as constants from "../constants/index";
import { MessageType } from "../interfaces/index";

// set a responce normalizer
export const normalizer = (
    req: Request,
    res: Response,
    { result = "", messageCode, type = "single", status = 200 }: MessageType
): Response => {
    // take page for pagination format
    const page: number = req.query?.page ? +req.query?.page : 1;
    
    // take size for pagination format
    let size: number = req.query?.size ? +req.query?.size : 5;
    if (size > 10) size = 10;

    let message: string = constants.messages.messageCodes[messageCode].message;

    // extract message text if message is a message code

    switch (type) {
        // just responce a single object
        case "single":
            return res.status(status).json({
                result: result,
                message: message,
            });

        // responce a two or more object all togather
        case "multi":
            return res.status(status).json({
                result: result,
                message: message,
            });

        // responce multi objects with pagination
        case "multi/pagination":
            let total = Math.floor(result.length / size) + 1;
            if (result.length % size === 0) total = total - 1;
            const startIndex = (page - 1) * size;
            const endIndex = page * size;
            result = result.slice(startIndex, endIndex);
            return res.status(status).json({
                result: result,
                message: message,
                page: +page,
                size: +size,
                total: total,
            });
    }
};
