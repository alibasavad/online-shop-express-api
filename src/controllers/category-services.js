import Category from "../models/category";
import mongoose from "mongoose";
import Product from "../models/product";
import { unlinkSync } from "fs";

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
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.send(error);
  }
};

export const readCategoryById = async (req, res, next) => {
  try {
    const category = await Category.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.categoryId),
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
          _id: 1,
          name: 1,
          description: 1,
          products: {
            _id: 1,
            name: 1,
            price: 1,
            quantity: 1,
            thumbnail: 1,
            createdAt: 1,
            updatedAt: 1,
          },
          thumbnail: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    res.json(category);
  } catch (error) {
    res.send(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const newCategory = new Category({
      name: req.body.name,
      thumbnail: "imageURL created by multer service...",
      description: req.body.description,
    });
    let category = await newCategory.save();
    res.json(category);
  } catch (error) {
    res.send(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    const products = await Product.find({ categoryId: { _id: category._id } });
    for (let product of products) {
      product.categoryId.remove(category._id);
      await product.save();
    }
    // if(category.thumbnail)
    // unlinkSync(`${__dirname}/../../public/image/category/${category.thumbnail}`);
    category.deleteOne();
    res.send("category deleted successfully");
  } catch (error) {
    res.send(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    let thumbnail = req.file ? req.file.filename : category.thumbnail;
    let name = req.body.name ? req.body.name : category.name;
    let description = req.body.description
      ? req.body.description
      : category.description;
    await category.updateOne(
      {
        name: name,
        thumbnail: thumbnail,
        description: description,
      },
      { new: true, useFindAndModify: false }
    );
    const updatedCategory = await Category.findById(req.params.categoryId);

    res.json(updatedCategory);
  } catch (error) {
    res.send(error);
  }
};
