import Category from "../models/category";
import mongoose from "mongoose";
import Product from "../models/product";
import validation from "../middlewares/data-validation";
import { mapperCategoryId, mapperProductImages } from "../middlewares/mapper";
import { checkImages, deleteImages } from "../middlewares/uploader";

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
    res.json(products);
  } catch (error) {
    res.send(error);
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
    res.json(product);
  } catch (error) {
    res.send(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    if (req.files === undefined || req.files.length === 0)
      return res.send("files are not uploaded");

    if (checkImages(req.files)) {
      deleteImages(req.files);
      return res.send("send valid image files format .png / .jpg ");
    }

    let images = mapperProductImages(req.files);
    let thumbnail = images.find(({ isMain }) => isMain === true).imageURL;

    req.body.categoryId = mapperCategoryId(req.body.categoryId);

    let validateName = validation.checkName(req.body.name);
    if (validateName) return res.send(validateName);

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
      deleteImages(req.files);
      return res.send("invalid Categoryid");
    }

    let product = await newProduct.save();

    res.json(product);
  } catch (error) {
    deleteImages(req.files);
    res.send(error);
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
    res.send("product deleted successfully");
  } catch (error) {
    res.send(error);
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

    let validateName = validation.checkName(name);
    if (validateName) return res.send(validateName);

    if (await checkCategoryId(categoryId)) {
      return res.send("invalid Categoryid");
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

    res.json(updatedProduct);
  } catch (error) {
    res.send(error);
  }
};

export const updateProductImages = async (req, res, next) => {
  try {
    if (req.files === undefined || req.files.length === 0)
      return res.send("files are not uploaded");

    if (checkImages(req.files)) {
      deleteImages(req.files);
      return res.send("send valid image files format .png / .jpg ");
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

    res.json(product);
  } catch (error) {
    deleteImages(req.files);
    res.send(error);
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
