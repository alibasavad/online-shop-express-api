import multer from "multer";
import env from "../configs/env.json";
import { unlinkSync } from "fs";
import { AppError } from "../handlers/error-handler";

const Response = require("../handlers/response");

// images storage
const imageStorage = multer.diskStorage({
  destination: `${__dirname}/../../public/images`,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

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
