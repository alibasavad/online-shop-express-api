import env from "../configs/env.json";
import { unlinkSync } from "fs";
import { AppError } from "../handlers/error-handler";

const Response = require("../handlers/response");

// check format of uplodaed file
export const checkImages = (list) => {
    // accepted image formats
    const mimetype = ["image/png", "image/jpg", "image/jpeg"];

    // throw error if uploaded file is not using an accepted format
    for (let image of list) {
        if (!mimetype.includes(image.mimetype)) throw new AppError(302);
    }
};

// check size of uplodaed image
export const checkImageSize = (list) => {
    const maxSize = 1000000 * env.MAX_IMAGE_SIZE_MEGEBYTE;
    for (let image of list) {
        if (image.size > maxSize) throw new AppError(307);
    }
};

// delete images given in a list of paths's
export const deleteImages = (images) => {
    for (let image of images) {
        unlinkSync(image.path);
    }
};
