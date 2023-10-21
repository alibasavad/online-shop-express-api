import Category from "../models/category";
import mongoose from "mongoose";
import Product from "../models/product";
import validation from "../middlewares/data-validation";
import { checkImages, deleteImages } from "../middlewares/uploader";
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
    req.files = [req.file];

    if (req.files === undefined || req.files.length === 0)
      return res.send("files are not uploaded");

    if (checkImages(req.files)) {
      deleteImages(req.files);
      return res.send("send valid image files format .png / .jpg ");
    }

    let thumbnail = req.file.filename;

    let validateName = validation.checkName(req.body.name);
    if (validateName) return res.send(validateName);

    const newCategory = new Category({
      name: req.body.name,
      thumbnail: thumbnail,
      description: req.body.description,
    });

    let category = await newCategory.save();
    res.json(category);
  } catch (error) {
    deleteImages(req.files);
    res.send(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.Id);
    const products = await Product.find({ categoryId: { _id: category._id } });

    for (let product of products) {
      product.categoryId.remove(category._id);
      await product.save();
    }

    if (category.thumbnail) {
      unlinkSync(`${__dirname}/../../public/category/${category.thumbnail}`);
    }

    category.deleteOne();
    res.send("category deleted successfully");
  } catch (error) {
    res.send(error);
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

    let validateName = validation.checkName(name);
    if (validateName) return res.send(validateName);

    await category.updateOne(
      {
        name: name,
        thumbnail: thumbnail,
        description: description,
      },
      { new: true, useFindAndModify: false }
    );
    const updatedCategory = await Category.findById(req.params.Id);

    res.json(updatedCategory);
  } catch (error) {
    res.send(error);
  }
};

export const updateCategoryThumbnail = async (req, res, next) => {
  try {
    req.files = [req.file];

    if (req.files === undefined || req.files.length === 0)
      return res.send("files are not uploaded");

    if (checkImages(req.files)) {
      deleteImages(req.files);
      return res.send("send valid image files format .png / .jpg ");
    }

    let thumbnail = req.file.filename;

    const category = await Category.findById(req.params.Id);
    if (category.thumbnail) {
      unlinkSync(`${__dirname}/../../public/category/${category.thumbnail}`);
    }
    category.thumbnail = thumbnail;
    await category.save();
    res.json(category);
  } catch (error) {
    deleteImages(req.files);
    res.send(error);
  }
};
