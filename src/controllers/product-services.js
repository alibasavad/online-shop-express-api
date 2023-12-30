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
        let images = mapperProductImages(req.body.images);

        let thumbnail = images.find(({ isMain }) => isMain === true).imageURL;

        req.body.categoryId = mapperCategoryId(req.body.categoryId);

        validation.alphaNumeric(req.body.name);

        const newProduct = new Product({
            name: req.body.name,
            categoryId: req.body.categoryId,
            price: req.body.price,
            quantity: req.body.quantity,
            images: images,
            thumbnail: thumbnail,
            description: req.body.description,
        });

        await checkCategoryId(newProduct.categoryId);

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
        const product = await Product.findById(req.params.Id);

        if (product.isDisable === true) throw new AppError(325);

        product.isDisable = true;

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

        validation.alphaNumeric(name);

        await checkCategoryId(categoryId);

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
            messageCode: 108,
        });
    } catch (error) {
        return next(error);
    }
};

// Update a product's images
export const updateProductImages = async (req, res, next) => {
    try {
        let images = mapperProductImages(req.body.images);

        let thumbnail = images.find(({ isMain }) => isMain === true).imageURL;

        let product = await Product.findById(req.params.Id);

        const oldImages = [];
        for (let image of product.images) {
            image.path = `${__dirname}/../../public/images/${image.imageURL}`;
            oldImages.push(image);
        }
        for (let image of oldImages) {
            if (existsSync(image.path)) unlinkSync(image.path);
        }

        product.images = images;
        product.thumbnail = thumbnail;

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
        const product = await Product.findById(req.params.Id);

        const images = [];
        for (let image of product.images) {
            image.path = `${__dirname}/../../public/images/${image.imageURL}`;
            images.push(image);
        }
        for (let image of images) {
            if (existsSync(image.path)) unlinkSync(image.path);
            else throw new AppError(309);
        }

        product.images = undefined;
        product.thumbnail = undefined;

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
        const product = await Product.findById(req.params.Id);

        if (product.isDisable === false) throw new AppError(326);

        product.isDisable = false;

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

// Force delete a product
export const forceDelete = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.Id);

        for (let image of product.images) {
            if (
                existsSync(`${__dirname}/../../public/images/${image.imageURL}`)
            ) {
                unlinkSync(
                    `${__dirname}/../../public/images/${image.imageURL}`
                );
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
