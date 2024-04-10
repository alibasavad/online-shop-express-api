import { NextFunction, Response } from "express";
import { existsSync, unlinkSync } from "fs";
import mongoose from "mongoose";
import { AppError } from "../handlers/error-handler";
import { normalizer } from "../handlers/response";
import {
    ProductImagesListType,
    ProductType,
    RequestType,
} from "../interfaces/index";
import { Product } from "../models/product";
import validation from "../utils/data-validation";
import { checkCategoryId } from "../utils/global";
import { mapperCategoryId, mapperProductImages } from "../utils/mapper";

// Read all products
export const readAllProducts = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const products: any = await Product.aggregate([
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

        normalizer(req, res, {
            result: products,
            messageCode: 100,
            type: "multi/pagination",
        });
    } catch (error) {
        return next(error);
    }
};

// Read a product by its ID
export const readProductById = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const product: any = await Product.aggregate([
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

        normalizer(req, res, {
            result: product,
            messageCode: 100,
        });
    } catch (error) {
        return next(error);
    }
};

// Create a new product
export const createProduct = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let images: ProductImagesListType = mapperProductImages(
            req.body.images
        );

        let thumbnail = images.find(({ isMain }) => isMain === true)?.imageURL;

        req.body.categoryId = mapperCategoryId(req.body.categoryId);

        validation.alphaNumeric(req.body.name);

        const newProduct: ProductType = new Product({
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

        normalizer(req, res, {
            result: product,
            messageCode: 106,
        });
    } catch (error) {
        return next(error);
    }
};

// Disable a product by its ID
export const disableProduct = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const product: ProductType | null = await Product.findById(
            req.params.Id
        );

        if (product === null) throw new AppError(300);

        if (product.isDisable === true) throw new AppError(325);

        product.isDisable = true;

        product.save();

        normalizer(req, res, {
            messageCode: 107,
        });
    } catch (error) {
        return next(error);
    }
};

// Update a product by its ID
export const updateProduct = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const product: ProductType | null = await Product.findById(
            req.params.Id
        );

        if (product === null) throw new AppError(300);

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
        const updatedProduct: ProductType | null = await Product.findById(
            req.params.Id
        );

        normalizer(req, res, {
            result: updatedProduct,
            messageCode: 108,
        });
    } catch (error) {
        return next(error);
    }
};

// Update a product's images
export const updateProductImages = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let images: ProductImagesListType = mapperProductImages(
            req.body.images
        );

        let thumbnail = images.find(({ isMain }) => isMain === true)?.imageURL;

        let product: ProductType | null = await Product.findById(req.params.Id);

        if (product === null) throw new AppError(300);

        const oldImages: string[] = [];
        for (let image of product.images) {
            let path: string = `${__dirname}/../../public/images/${image.imageURL}`;
            oldImages.push(path);
        }
        for (let path of oldImages) {
            if (existsSync(path)) unlinkSync(path);
        }

        product.images = images;
        product.thumbnail = thumbnail;

        await product.save();

        normalizer(req, res, {
            result: product,
            messageCode: 108,
        });
    } catch (error) {
        return next(error);
    }
};

// Delete a product's images
export const deleteProductImages = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const product: ProductType | null = await Product.findById(
            req.params.Id
        );

        if (product === null) throw new AppError(300);

        const images: string[] = [];
        for (let image of product.images) {
            let path = `${__dirname}/../../public/images/${image.imageURL}`;
            images.push(path);
        }
        for (let path of images) {
            if (existsSync(path)) unlinkSync(path);
            else throw new AppError(309);
        }

        product.images = [];
        product.thumbnail = undefined;

        product.save();

        normalizer(req, res, {
            messageCode: 109,
        });
    } catch (error) {
        return next(error);
    }
};

// Enable a disabled product
export const enableProduct = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const product: ProductType | null = await Product.findById(
            req.params.Id
        );

        if (product === null) throw new AppError(300);

        if (product.isDisable === false) throw new AppError(326);

        product.isDisable = false;

        product.save();

        normalizer(req, res, {
            result: product,
            messageCode: 110,
        });
    } catch (error) {
        return next(error);
    }
};

// Read all disabled products
export const readDisabledProducts = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const products: any = await Product.aggregate([
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

        normalizer(req, res, {
            result: products,
            messageCode: 100,
            type: "multi/pagination",
        });
    } catch (error) {
        return next(error);
    }
};

// Force delete a product
export const forceDelete = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const product: ProductType | null = await Product.findById(
            req.params.Id
        );

        if (product === null) throw new AppError(300);

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

        normalizer(req, res, {
            result: product,
            messageCode: 132,
        });
    } catch (error) {
        return next(error);
    }
};
