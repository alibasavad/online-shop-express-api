import mongoose from "mongoose";
import Product from "../models/product";
import validation from "../utils/data-validation";
import { mapperCategoryId, mapperProductImages } from "../utils/mapper";
import { AppError } from "../handlers/error-handler";
import { unlinkSync, existsSync } from "fs";
import { checkCategoryId } from "../utils/global";

const Response = require("../handlers/response");

// Read all products
export const readAllProducts = async (req, res, next) => {
  try {
    // Find all products that are not disabled
    const products = await Product.aggregate([
      {
        $match: {
          isDisable: false,
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
      messageCode: 100,
      type: "multi/pagination",
    });
  } catch (error) {
    return next(error);
  }
};

// Read a product by its ID
export const readProductById = async (req, res, next) => {
  try {
    // Find the product by its ID and ensure it is not disabled
    const product = await Product.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.Id),
          isDisable: false,
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

    // If no product is found, throw an error
    if (product.length === 0) throw new AppError(300);

    Response.normalizer(req, res, {
      result: product,
      messageCode: 100,
    });
  } catch (error) {
    return next(error);
  }
};

// Create a new product
export const createProduct = async (req, res, next) => {
  try {
    // Map the images array in the request body to include imageURL and isMain properties
    let images = mapperProductImages(req.body.images);

    // Find the thumbnail image from the mapped images array
    let thumbnail = images.find(({ isMain }) => isMain === true).imageURL;

    // Map the categoryId to the expected form
    req.body.categoryId = mapperCategoryId(req.body.categoryId);

    // Validate the given name
    validation.alphaNumeric(req.body.name);

    // Create a new product with the request body values
    const newProduct = new Product({
      name: req.body.name,
      categoryId: req.body.categoryId,
      price: req.body.price,
      quantity: req.body.quantity,
      images: images,
      thumbnail: thumbnail,
      description: req.body.description,
    });

    // Check if the categoryIds exists
    await checkCategoryId(newProduct.categoryId);

    // Save the new product
    let product = await newProduct.save();

    Response.normalizer(req, res, {
      result: product,
      messageCode: 106,
    });
  } catch (error) {
    return next(error);
  }
};

// Disable a product by its ID
export const disableProduct = async (req, res, next) => {
  try {
    // Find the product by its ID
    const product = await Product.findById(req.params.Id);

    // If the product is already disabled, throw an error
    if (product.isDisable === true) throw new AppError(325);

    // Set the isDisable property of the product to true
    product.isDisable = true;

    // Save the updated product
    product.save();

    Response.normalizer(req, res, {
      messageCode: 107,
    });
  } catch (error) {
    return next(error);
  }
};

// Update a product by its ID
export const updateProduct = async (req, res, next) => {
  try {
    // Find the product by its ID
    const product = await Product.findById(req.params.Id);

    // Update the properties of the product based on the request body values, or keep the original values if not provided
    let name = req.body.name ? req.body.name : product.name;
    let categoryId = req.body.categoryId
      ? mapperCategoryId(req.body.categoryId)
      : product.categoryId;
    let price = req.body.price ? req.body.price : product.price;
    let quantity = req.body.quantity ? req.body.quantity : product.quantity;
    let description = req.body.description
      ? req.body.description
      : product.description;

    // Validate the name using the alphaNumeric validation function
    validation.alphaNumeric(name);

    // Check if the categoryId exists
    await checkCategoryId(categoryId);

    // Update the product with the new values
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
    // Find the updated product by its ID
    const updatedProduct = await Product.findById(req.params.Id);

    Response.normalizer(req, res, {
      result: updatedProduct,
      messageCode: 108,
    });
  } catch (error) {
    return next(error);
  }
};

// Update a product's images
export const updateProductImages = async (req, res, next) => {
  try {
    // Map the request body images to the expected format
    let images = mapperProductImages(req.body.images);

    // Find the thumbnail image from the mapped images array
    let thumbnail = images.find(({ isMain }) => isMain === true).imageURL;

    // Find the product by its ID
    let product = await Product.findById(req.params.Id);

    // Create an array to store the paths of the old images
    const oldImages = [];
    for (let image of product.images) {
      image.path = `${__dirname}/../../public/images/${image.imageURL}`;
      oldImages.push(image);
    }
    // Delete the old images from the file system
    for (let image of oldImages) {
      if (existsSync(image.path)) unlinkSync(image.path);
    }

    // Set the product's images and thumbnail to the new values
    product.images = images;
    product.thumbnail = thumbnail;

    // Save the updated product
    await product.save();

    Response.normalizer(req, res, {
      result: product,
      messageCode: 108,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete a product's images
export const deleteProductImages = async (req, res, next) => {
  try {
    // Find the product by its ID
    const product = await Product.findById(req.params.Id);

    // Create an array to store the paths of the images to be deleted
    const images = [];
    for (let image of product.images) {
      image.path = `${__dirname}/../../public/images/${image.imageURL}`;
      images.push(image);
    }
    // Delete the images from the file system
    for (let image of images) {
      if (existsSync(image.path)) unlinkSync(image.path);
      else throw new AppError(309);
    }

    // Remove the images and thumbnail property from the product
    product.images = undefined;
    product.thumbnail = undefined;

    // Save the updated product
    product.save();

    Response.normalizer(req, res, {
      messageCode: 109,
    });
  } catch (error) {
    return next(error);
  }
};

// Enable a disabled product
export const enableProduct = async (req, res, next) => {
  try {
    // Find the product by its ID
    const product = await Product.findById(req.params.Id);

    // Check if the product is already enabled
    if (product.isDisable === false) throw new AppError(326);

    // Set the product's isDisable property to false
    product.isDisable = false;

    // Save the updated product
    product.save();

    Response.normalizer(req, res, {
      result: product,
      messageCode: 110,
    });
  } catch (error) {
    return next(error);
  }
};

// Read all disabled products
export const readDisabledProducts = async (req, res, next) => {
  try {
    // Find all products that are disabled
    const products = await Product.aggregate([
      {
        $match: {
          isDisable: true,
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
      messageCode: 100,
      type: "multi/pagination",
    });
  } catch (error) {
    return next(error);
  }
};

export const forceDelete = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.Id);

    for (let image of product.images) {
      if (existsSync(`${__dirname}/../../public/images/${image.imageURL}`)) {
        unlinkSync(`${__dirname}/../../public/images/${image.imageURL}`);
      }
    }

    await product.deleteOne();

    Response.normalizer(req, res, {
      result: product,
      messageCode: 132,
    });
  } catch (error) {
    return next(error);
  }
};
