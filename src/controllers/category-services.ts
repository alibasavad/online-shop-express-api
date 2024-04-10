import { NextFunction, Response } from "express";
import { existsSync, unlinkSync } from "fs";
import mongoose from "mongoose";
import { AppError } from "../handlers/error-handler";
import { normalizer } from "../handlers/response";
import { CategoryType, ProductType, RequestType } from "../interfaces/index";
import { Category } from "../models/category";
import { Product } from "../models/product";
import validation from "../utils/data-validation";
import { remove } from "../utils/global";

// reading all categories in database
export const readAllCategories = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const categories: any = await Category.aggregate([
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

        normalizer(req, res, {
            result: categories,
            messageCode: 100,
            type: "multi/pagination",
        });
    } catch (error) {
        return next(error);
    }
};

// read one category in database by its id
export const readCategoryById = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const category: any = await Category.aggregate([
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

        const products: any = await Category.aggregate([
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

        products[0].products.forEach((product: any) => {
            // add category and products to a list
            category.push(product);
        });

        normalizer(req, res, {
            result: category,
            messageCode: 100,
            type: "multi/pagination",
        });
    } catch (error) {
        return next(error);
    }
};

// Create a new category
export const createCategory = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        validation.alphaNumeric(req.body.name);

        const newCategory: CategoryType = new Category({
            name: req.body.name,
            thumbnail: req.body.thumbnail,
            description: req.body.description,
        });

        let category = await newCategory.save();

        normalizer(req, res, {
            result: category,
            messageCode: 101,
        });
    } catch (error) {
        return next(error);
    }
};

// disable category (instead of deleting)
export const disableCategory = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const category: CategoryType | null = await Category.findById(
            req.params.Id
        );

        if (category === null || category.isDisable === true)
            throw new AppError(325);

        const products: ProductType[] | null = await Product.find({
            categoryId: { _id: category._id },
        });

        for (let product of products) {
            product.categoryId = remove(product.categoryId, category._id);
            await product.save();
        }

        category.isDisable = true;

        category.save();

        normalizer(req, res, {
            messageCode: 102,
        });
    } catch (error) {
        return next(error);
    }
};

// Update a category
export const updateCategory = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const category: CategoryType | null = await Category.findById(
            req.params.Id
        );

        let name: string = req.body.name ? req.body.name : category?.name;

        let description: string = req.body.description
            ? req.body.description
            : category?.description;

        validation.alphaNumeric(name);

        await category?.updateOne(
            {
                name: name,
                description: description,
            },
            { new: true, useFindAndModify: false }
        );
        const updatedCategory: CategoryType | null = await Category.findById(
            req.params.Id
        );

        normalizer(req, res, {
            result: updatedCategory,
            messageCode: 103,
        });
    } catch (error) {
        return next(error);
    }
};

// Update a category's thumbnail
export const updateCategoryThumbnail = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let thumbnail: string = req.body.thumbnail;

        const category: CategoryType | null = await Category.findById(
            req.params.Id
        );

        if (category == null) throw new AppError(300);

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

        normalizer(req, res, {
            result: category,
            messageCode: 103,
        });
    } catch (error) {
        return next(error);
    }
};

// Delete a category's thumbnail
export const deleteCategoryThumbnail = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const category: CategoryType | null = await Category.findById(
            req.params.Id
        );
        if (category === null) throw new AppError(300);

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

        normalizer(req, res, {
            messageCode: 104,
        });
    } catch (error) {
        return next(error);
    }
};

// Enable a disabled category
export const enableCategory = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const category: CategoryType | null = await Category.findById(
            req.params.Id
        );

        if (category === null) throw new AppError(300);

        if (category.isDisable === false) throw new AppError(326);

        category.isDisable = false;

        category.save();

        normalizer(req, res, {
            result: category,
            messageCode: 105,
        });
    } catch (error) {
        return next(error);
    }
};

// Read all disabled categories
export const readDisabledCategories = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const categories: any = await Category.aggregate([
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

        normalizer(req, res, {
            result: categories,
            messageCode: 100,
            type: "multi/pagination",
        });
    } catch (error) {
        return next(error);
    }
};

// force delete a category
export const forceDelete = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const category: CategoryType | null = await Category.findById(
            req.params.Id
        );

        if (category === null) throw new AppError(300);

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
            product.categoryId = remove(product.categoryId, category._id);
            await product.save();
        }

        await category.deleteOne();

        normalizer(req, res, {
            result: category,
            messageCode: 132,
        });
    } catch (error) {
        return next(error);
    }
};
