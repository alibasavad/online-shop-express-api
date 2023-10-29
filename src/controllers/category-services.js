import Category from "../models/category";
import mongoose from "mongoose";
import Product from "../models/product";
import validation from "../middlewares/data-validation";
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

// reading all categories in database
export const readAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.aggregate([
      {
        $match: {
          // find only datas with below condition
          isDisable: false,
        },
      },
      {
        $project: {
          // showing only below valuse
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

// read one category in database by its id
export const readCategoryById = async (req, res, next) => {
  try {
    const category = await Category.aggregate([
      {
        $match: {
          // find only datas with below condition
          _id: new mongoose.Types.ObjectId(req.params.Id),
          isDisable: false,
        },
      },
      {
        $project: {
          // showing only below valuse
          _id: 1,
          name: 1,
          thumbnail: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (category.length === 0) throw new AppError(300); // no category find with given id

    const products = await Category.aggregate([
      // find products that contain this category
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
      // add category and products to a list
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

// Create a new category
export const createCategory = async (req, res, next) => {
  try {
    // Validate the category name
    validation.alphaNumeric(req.body.name);

    // Create a new category
    const newCategory = new Category({
      name: req.body.name,
      thumbnail: req.body.thumbnail,
      description: req.body.description,
    });

    // Save the category to the database
    let category = await newCategory.save();

    Response.normalizer(req, res, {
      result: category,
      messageCode: 101,
    });
  } catch (error) {
    return next(error);
  }
};

// disable category (instead of deleting)
export const disableCategory = async (req, res, next) => {
  try {
    // find category by id
    const category = await Category.findById(req.params.Id);

    // check if category is already disable
    if (category.isDisable === true) throw new AppError(325);

    // find products that contain this category
    const products = await Product.find({ categoryId: { _id: category._id } });

    // remove this category from products that contains it
    for (let product of products) {
      product.categoryId.remove(category._id);
      await product.save();
    }

    // change category to disabled
    category.isDisable = true;

    // save changes on category
    category.save();

    Response.normalizer(req, res, {
      messageCode: 102,
    });
  } catch (error) {
    return next(error);
  }
};

// Update a category
export const updateCategory = async (req, res, next) => {
  try {
    // Find the category by its ID
    const category = await Category.findById(req.params.Id);

    // check request body for name and change name to new name
    let name = req.body.name ? req.body.name : category.name;

    // check request body for description and change description to new description
    let description = req.body.description
      ? req.body.description
      : category.description;

    // Validate the category name
    validation.alphaNumeric(name);

    // Update the category with the new values
    await category.updateOne(
      {
        name: name,
        description: description,
      },
      { new: true, useFindAndModify: false }
    );
    // Find the updated category
    const updatedCategory = await Category.findById(req.params.Id);

    Response.normalizer(req, res, {
      result: updatedCategory,
      messageCode: 103,
    });
  } catch (error) {
    return next(error);
  }
};

// Update a category's thumbnail
export const updateCategoryThumbnail = async (req, res, next) => {
  try {
    // change thumbnail to request body thumbnail
    let thumbnail = req.body.thumbnail;

    // Find the category by its ID
    const category = await Category.findById(req.params.Id);

    // Delete the existing thumbnail file
    if (category.thumbnail) {
      unlinkSync(`${__dirname}/../../public/category/${category.thumbnail}`);
    }

    // Set the category's thumbnail to the new value
    category.thumbnail = thumbnail;

    // Save the updated category
    await category.save();

    Response.normalizer(req, res, {
      result: category,
      messageCode: 103,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete a category's thumbnail
export const deleteCategoryThumbnail = async (req, res, next) => {
  try {
    // Find the category by its ID
    const category = await Category.findById(req.params.Id);

    // Delete the existing thumbnail file
    if (category.thumbnail) {
      unlinkSync(`${__dirname}/../../public/category/${category.thumbnail}`);
    }

    // Remove the thumbnail property from the category
    category.thumbnail = undefined;

    // Save the updated category
    category.save();

    Response.normalizer(req, res, {
      messageCode: 104,
    });
  } catch (error) {
    return next(error);
  }
};

// Enable a disabled category
export const enableCategory = async (req, res, next) => {
  try {
    // Find the category by its ID
    const category = await Category.findById(req.params.Id);

    // Check if the category is already enabled
    if (category.isDisable === false) throw new AppError(326);

    // Set the category's isDisable property to false
    category.isDisable = false;

    // Save the updated category
    category.save();

    Response.normalizer(req, res, {
      result: category,
      messageCode: 105,
    });
  } catch (error) {
    return next(error);
  }
};

// Read all disabled categories
export const readDisabledCategories = async (req, res, next) => {
  try {
    // Find all categories that are disabled
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
