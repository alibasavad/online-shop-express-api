import multer from "multer";
import env from "../configs/env.json";
import { unlinkSync } from "fs";

const productImageStorage = multer.diskStorage({
  // upload directory
  destination: `${__dirname}/../../public/product`,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const categoryThumbnailStorage = multer.diskStorage({
  // upload directory
  destination: `${__dirname}/../../public/category`,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const uploadProductImage = multer({
  //upload service
  storage: productImageStorage,
  limits: { fileSize: 1000000 * env.MAX_IMAGE_SIZE_MEGEBYTE },
}).any();

export const uploadCategoryThumbnail = multer({
  //upload service
  storage: categoryThumbnailStorage,
  limits: { fileSize: 1000000 * env.MAX_THUMBNAIL_SIZE_MEGEBYTE },
}).single("image");

export const checkImages = (list) => {
  const mimetype = ["image/png", "image/jpg", "image/jpeg"];

  for (let image of list) {
    if (!mimetype.includes(image.mimetype)) return true;
  }
  return false;
};

export const deleteImages = (images) => {
  for (let image of images) {
    unlinkSync(image.path);
  }
};
