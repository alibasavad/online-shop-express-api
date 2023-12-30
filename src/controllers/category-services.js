import Category from "../models/category";
import mongoose from "mongoose";
import Product from "../models/product";
import validation from "../utils/data-validation";
import { unlinkSync, existsSync } from "fs";
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

// read one category in database by its id
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
        validation.alphaNumeric(req.body.name);

        const newCategory = new Category({
            name: req.body.name,
            thumbnail: req.body.thumbnail,
            description: req.body.description,
        });

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
        const category = await Category.findById(req.params.Id);

        if (category.isDisable === true) throw new AppError(325);

        const products = await Product.find({
            categoryId: { _id: category._id },
        });

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

// Update a category
export const updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.Id);

        let name = req.body.name ? req.body.name : category.name;

        let description = req.body.description
            ? req.body.description
            : category.description;

        validation.alphaNumeric(name);

        await category.updateOne(
            {
                name: name,
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

// Update a category's thumbnail
export const updateCategoryThumbnail = async (req, res, next) => {
    try {
        let thumbnail = req.body.thumbnail;

        const category = await Category.findById(req.params.Id);

        if (
            category.thumbnail &&
            existsSync(`${__dirname}/../../public/images/${category.thumbnail}`)
        ) {
            unlinkSync(
                `${__dirname}/../../public/images/${category.thumbnail}`
            );
        }

        category.thumbnail = thumbnail;

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
        const category = await Category.findById(req.params.Id);

        if (
            !existsSync(
                `${__dirname}/../../public/images/${category.thumbnail}`
            )
        ) {
            throw new AppError(309);
        }

        if (category.thumbnail) {
            unlinkSync(
                `${__dirname}/../../public/images/${category.thumbnail}`
            );
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

// Enable a disabled category
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

// Read all disabled categories
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

// force delete a category
export const forceDelete = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.Id);

        if (
            existsSync(`${__dirname}/../../public/images/${category.thumbnail}`)
        ) {
            unlinkSync(
                `${__dirname}/../../public/images/${category.thumbnail}`
            );
        }

        const products = await Product.find({
            categoryId: { _id: category._id },
        });

        for (let product of products) {
            product.categoryId.remove(category._id);
            await product.save();
        }

        await category.deleteOne();

        Response.normalizer(req, res, {
            result: category,
            messageCode: 132,
        });
    } catch (error) {
        return next(error);
    }
};
