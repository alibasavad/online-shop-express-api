import multer from "multer";
import { AppError } from "../handlers/error-handler";
import { checkImageSize, checkImages, deleteImages } from "../utils/uploader";

const Response = require("../handlers/response");

// images storage
const imageStorage = multer.diskStorage({
    destination: `${__dirname}/../../public/images`,
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

// product image uploader function
const imageUploader = multer({
    storage: imageStorage,
});

// product image uploader service
export const uploadImages = async (req, res, next) => {
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

            const images = [];

            // add image names to images list
            req.files.forEach((file) => {
                images.push(file.filename);
            });

            Response.normalizer(req, res, {
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
