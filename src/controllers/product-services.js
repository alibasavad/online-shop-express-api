import Category from "../models/category";
import mongoose from "mongoose";
import Product from "../models/product";
import validation from "../middlewares/data-validation";
import { mapperCategoryId, mapperProductImages } from "../middlewares/mapper";
import { checkImages, deleteImages } from "../middlewares/uploader";
import { AppError } from "../handlers/error-handler";

const Response = require("../handlers/response");

export const readAllProducts = async (req, res, next) => {
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "categoryId._id",
          foreignField: "_id",
          as: "categories",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          categories: {
            _id: 1,
            name: 1,
            thumbnail: 1,
            createdAt: 1,
            updatedAt: 1,
          },
          price: 1,
          quantity: 1,
          thumbnail: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    Response.normalizer(req, res, {
      result: products,
      message: "fetched data successfully",
      type: "multi",
    });
  } catch (error) {
    return next(error);
  }
};

export const readProductById = async (req, res, next) => {
  try {
    const product = await Product.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.Id),
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId._id",
          foreignField: "_id",
          as: "categories",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          images: 1,
          categories: {
            _id: 1,
            name: 1,
            thumbnail: 1,
            createdAt: 1,
            updatedAt: 1,
          },
          price: 1,
          quantity: 1,
          thumbnail: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (product.length === 0) throw new AppError(300);

    Response.normalizer(req, res, {
      result: product,
      message: "fetched data successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    if (req.files === undefined || req.files.length === 0)
      throw new AppError(301);

    if (checkImages(req.files)) {
      throw new AppError(302);
    }

    let images = mapperProductImages(req.files);
    let thumbnail = images.find(({ isMain }) => isMain === true).imageURL;

    req.body.categoryId = mapperCategoryId(req.body.categoryId);

    validation.checkName(req.body.name);

    const newProduct = new Product({
      name: req.body.name,
      categoryId: req.body.categoryId,
      price: req.body.price,
      quantity: req.body.quantity,
      images: images,
      thumbnail: thumbnail,
      description: req.body.description,
    });

    if (await checkCategoryId(newProduct.categoryId)) {
      throw new AppError(304);
    }

    let product = await newProduct.save();

    Response.normalizer(req, res, {
      result: product,
      message: "Product Created Successfully",
    });
  } catch (error) {
    if (!(req.files === undefined || req.files.length === 0))
      deleteImages(req.files);
    return next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.Id);
    const images = [];
    for (let image of product.images) {
      image.path = `${__dirname}/../../public/product/${image.imageURL}`;
      images.push(image);
    }
    deleteImages(images);

    product.deleteOne();

    Response.normalizer(req, res, {
      result: product,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.Id);

    let name = req.body.name ? req.body.name : product.name;
    let categoryId = req.body.categoryId
      ? mapperCategoryId(req.body.categoryId)
      : product.categoryId;
    let price = req.body.price ? req.body.price : product.price;
    let quantity = req.body.quantity ? req.body.quantity : product.quantity;
    let description = req.body.description
      ? req.body.description
      : product.description;

    validation.checkName(name);

    if (await checkCategoryId(categoryId)) {
      throw new AppError(304);
    }

    await product.updateOne(
      {
        name: name,
        categoryId: categoryId,
        price: price,
        quantity: quantity,
        description: description,
      },
      { new: true, useFindAndModify: false }
    );
    const updatedProduct = await Product.findById(req.params.Id);

    Response.normalizer(req, res, {
      result: updatedProduct,
      message: "Product Updated Successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProductImages = async (req, res, next) => {
  try {
    if (req.files === undefined || req.files.length === 0)
      throw new AppError(301);

    if (checkImages(req.files)) {
      throw new AppError(302);
    }

    let images = mapperProductImages(req.files);
    let thumbnail = images.find(({ isMain }) => isMain === true).imageURL;

    let product = await Product.findById(req.params.Id);

    const oldImages = [];
    for (let image of product.images) {
      console.log(image);
      image.path = `${__dirname}/../../public/product/${image.imageURL}`;
      oldImages.push(image);
    }
    deleteImages(oldImages);

    product.images = images;
    product.thumbnail = thumbnail;

    await product.save();

    Response.normalizer(req, res, {
      result: product,
      message: "Product Updated Successfully",
    });
  } catch (error) {
    if (!(req.files === undefined || req.files.length === 0))
      deleteImages(req.files);
    return next(error);
  }
};

const checkCategoryId = async (categoryIds) => {
  for (let category of categoryIds) {
    let check = await Category.findById(category);
    if (check === null) {
      return true;
    }
  }
  return false;
};
