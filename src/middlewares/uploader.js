import multer from "multer";
import env from "../configs/env.json";
import { unlinkSync } from "fs";
import { AppError } from "../handlers/error-handler";

const Response = require("../handlers/response");

const productImageStorage = multer.diskStorage({
  destination: `${__dirname}/../../public/product`,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const categoryThumbnailStorage = multer.diskStorage({
  destination: `${__dirname}/../../public/category`,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const checkImages = (list) => {
  const mimetype = ["image/png", "image/jpg", "image/jpeg"];

  for (let image of list) {
    if (!mimetype.includes(image.mimetype)) throw new AppError(302);
  }
};

export const checkImageSize = (list) => {
  const maxSize = 1000000 * env.MAX_IMAGE_SIZE_MEGEBYTE;
  for (let image of list) {
    if (image.size > maxSize) throw new AppError(307);
  }
};

export const checkThumbnailSize = (list) => {
  const maxSize = 1000000 * env.MAX_THUMBNAIL_SIZE_MEGEBYTE;
  for (let image of list) {
    if (image.size > maxSize) throw new AppError(307);
  }
};

export const deleteImages = (images) => {
  for (let image of images) {
    unlinkSync(image.path);
  }
};

const productImagesUploader = multer({
  storage: productImageStorage,
});

export const uploadProductImages = async (req, res, next) => {
  productImagesUploader.any()(req, res, async (error) => {
    try {
      if (req.files === undefined || req.files.length === 0)
        throw new AppError(301);

      checkImages(req.files);
      checkImageSize(req.files);

      const images = [];

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

const categoryThumbnailUploader = multer({
  storage: categoryThumbnailStorage,
});

export const uploadCategoryThumbnail = async (req, res, next) => {
  categoryThumbnailUploader.single("thumbnail")(req, res, async (error) => {
    try {
      req.files = [req.file];
      if (req.file === undefined) throw new AppError(301);

      checkImages(req.files);
      checkImageSize(req.files);

      const images = [];

      req.files.forEach((file) => {
        images.push(file.filename);
      });

      Response.normalizer(req, res, {
        result: images,
        messageCode: 130,
        type: "multi",
      });
    } catch (error) {
      console.log(req.files);
      if (req.file !== undefined) deleteImages(req.files);
      return next(error);
    }
  });
};
