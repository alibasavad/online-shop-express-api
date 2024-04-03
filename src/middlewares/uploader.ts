import multer from "multer";
import { NextFunction, Response } from "express";
import { AppError } from "../handlers/error-handler";
import { normalizer } from "../handlers/response";
import { RequestType } from "../interfaces/index";
import { checkImageSize, checkImages, deleteImages } from "../utils/uploader";

// images storage
const imageStorage: multer.StorageEngine = multer.diskStorage({
    destination: `${__dirname}/../../public/images`,
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

// product image uploader function
const imageUploader: multer.Multer = multer({
    storage: imageStorage,
});

// product image uploader service
export const uploadImages = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // product image uploader function
    imageUploader.any()(req, res, async (error) => {
        try {
            // throw error if no file is uploaded
            if (req.files === undefined || req.files.length === 0)
                throw new AppError(301);

            // check uploaded file format
            checkImages(req.files);

            // check uploaded file size
            checkImageSize(req.files);

            const images: string[] = [];

            // add image names to images list
            if (req.files instanceof Array)
                req.files.forEach((file) => {
                    images.push(file.filename);
                });

            normalizer(req, res, {
                result: images,
                messageCode: 130,
                type: "multi",
            });
        } catch (error) {
            if (!(req.files === undefined || req.files.length === 0))
                deleteImages(req.files);
            return next(error);
        }
    });
};
