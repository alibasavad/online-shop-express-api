import Category from "../models/category";
import mongoose from "mongoose";
import Product from "../models/product";
import validation from "../middlewares/data-validation";
import { checkImages, deleteImages } from "../middlewares/uploader";
import { unlinkSync } from "fs";
import { AppError } from "../handlers/error-handler";

const Response = require("../handlers/response");

// removing a value from array
Array.prototype.remove = function () {
  var what,
    a = arguments,
    L = a.length,
    ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

export const readAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.aggregate([
      {
        $match: {
          isDisable: false,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          thumbnail: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    Response.normalizer(req, res, {
      result: categories,
      messageCode: 100,
      type: "multi/pagination",
    });
  } catch (error) {
    return next(error);
  }
};

export const readCategoryById = async (req, res, next) => {
  try {
    const category = await Category.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.Id),
          isDisable: false,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          thumbnail: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (category.length === 0) throw new AppError(300);

    const products = await Category.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.Id),
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "categoryId._id",
          as: "products",
        },
      },
      {
        $project: {
          products: {
            _id: 1,
            name: 1,
            price: 1,
            quantity: 1,
            thumbnail: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      },
    ]);

    products[0].products.forEach((product) => {
      category.push(product);
    });

    Response.normalizer(req, res, {
      result: category,
      messageCode: 100,
      type: "multi/pagination",
    });
  } catch (error) {
    return next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    req.files = [req.file];

    if (req.file === undefined) {
      throw new AppError(301);
    }

    if (checkImages(req.files)) {
      throw new AppError(302);
    }

    let thumbnail = req.file.filename;

    validation.alphaNumeric(req.body.name);

    const newCategory = new Category({
      name: req.body.name,
      thumbnail: thumbnail,
      description: req.body.description,
    });

    let category = await newCategory.save();

    Response.normalizer(req, res, {
      result: category,
      messageCode: 101,
    });
  } catch (error) {
    if (req.file !== undefined) deleteImages(req.files);
    return next(error);
  }
};

export const disableCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.Id);

    if (category.isDisable === true) throw new AppError(325);

    const products = await Product.find({ categoryId: { _id: category._id } });

    for (let product of products) {
      product.categoryId.remove(category._id);
      await product.save();
    }

    category.isDisable = true;

    category.save();

    Response.normalizer(req, res, {
      messageCode: 102,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.Id);

    let thumbnail = req.file ? req.file.filename : category.thumbnail;

    let name = req.body.name ? req.body.name : category.name;

    let description = req.body.description
      ? req.body.description
      : category.description;

    validation.alphaNumeric(name);

    await category.updateOne(
      {
        name: name,
        thumbnail: thumbnail,
        description: description,
      },
      { new: true, useFindAndModify: false }
    );
    const updatedCategory = await Category.findById(req.params.Id);

    Response.normalizer(req, res, {
      result: updatedCategory,
      messageCode: 103,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateCategoryThumbnail = async (req, res, next) => {
  try {
    req.files = [req.file];

    if (req.file === undefined) {
      throw new AppError(301);
    }

    if (checkImages(req.files)) {
      throw new AppError(302);
    }

    let thumbnail = req.file.filename;

    const category = await Category.findById(req.params.Id);

    if (category.thumbnail) {
      unlinkSync(`${__dirname}/../../public/category/${category.thumbnail}`);
    }
    category.thumbnail = thumbnail;

    await category.save();

    Response.normalizer(req, res, {
      result: category,
      messageCode: 103,
    });
  } catch (error) {
    if (req.file !== undefined) deleteImages(req.files);
    return next(error);
  }
};

export const deleteCategoryThumbnail = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.Id);

    if (category.thumbnail) {
      unlinkSync(`${__dirname}/../../public/category/${category.thumbnail}`);
    }

    category.thumbnail = undefined;

    category.save();

    Response.normalizer(req, res, {
      messageCode: 104,
    });
  } catch (error) {
    return next(error);
  }
};

export const enableCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.Id);

    if (category.isDisable === false) throw new AppError(326);

    category.isDisable = false;

    category.save();

    Response.normalizer(req, res, {
      result: category,
      messageCode: 105,
    });
  } catch (error) {
    return next(error);
  }
};

export const readDisabledCategories = async (req, res, next) => {
  try {
    const categories = await Category.aggregate([
      {
        $match: {
          isDisable: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          thumbnail: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    Response.normalizer(req, res, {
      result: categories,
      messageCode: 100,
      type: "multi/pagination",
    });
  } catch (error) {
    return next(error);
  }
};
