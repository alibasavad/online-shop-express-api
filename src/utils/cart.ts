import { Cart } from "../models/cart";
import mongoose from "mongoose";
import { Product } from "../models/product";
import { CartType, ProductType } from "../interfaces/index";
import { remove } from "./global";

/**
 * @description creat cart for user
 * @param {String} userId
 * @returns Cart (mongoose model)
 */
export const createCart = async (userId: string): Promise<CartType> => {
    const newCart: CartType = new Cart({
        user: userId,
    });

    const cart: CartType = await newCart.save();
    return cart;
};

/**
 * @description refresh cart and its product informations
 * @param {String} userId
 * @returns Cart (mongoose model)
 */
export const refreshCart = async (userId: string): Promise<any[]> => {
    let cart: CartType | null = await Cart.findOne({ user: userId });

    if (!cart) return [];

    let totalPrice = 0;
    let totalQty = 0;

    for (let productId of cart.products) {
        let product: ProductType | null = await Product.findById(productId._id);
        if (!productId || !product) return [];

        if (
            product === null ||
            product.isDisable === true ||
            productId.qty === 0
        )
            cart.products = remove(cart.products, productId);
        else {
            if (product.quantity - product.reserved >= productId.qty)
                productId.isAvailable = true;
            else productId.isAvailable = false;
            totalPrice += product.price * productId.qty;
            totalQty += productId.qty;
        }
    }

    cart.totalPrice = totalPrice;
    cart.totalQty = totalQty;

    await cart.save();

    let result: any[] = await Cart.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "products",
                localField: "products._id",
                foreignField: "_id",
                as: "products",
            },
        },
        {
            $project: {
                products: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    thumbnail: 1,
                },
                totalPrice: 1,
                totalQty: 1,
                updatedAt: 1,
                createdAt: 1,
            },
        },
    ]);

    for (let product of result[0].products) {
        let cartProduct = cart.products.find(
            ({ _id }) => _id.toString() === product._id.toString()
        );
        product.qty = cartProduct?.qty;
        product.isAvailable = cartProduct?.isAvailable;
    }

    return result;
};

/**
 * @description read carts that have at least 1 product in it (admin)
 * @returns Cart (mongoose model)
 */
export const activeCart = async (): Promise<any[]> => {
    let result: any[] = await Cart.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "products._id",
                foreignField: "_id",
                as: "product",
            },
        },
        {
            $project: {
                product: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    thumbnail: 1,
                },
                totalPrice: 1,
                totalQty: 1,
                updatedAt: 1,
                createdAt: 1,
                products: 1,
            },
        },
    ]);

    for (let cart of result) {
        if (cart.products.length === 0) remove(result, cart);

        for (let product of cart.product) {
            let cartProduct = cart.products.find(
                ({ _id }: any) => _id.toString() === product._id.toString()
            );

            product.qty = cartProduct.qty;
            product.isAvailable = cartProduct.isAvailable;
        }
        cart.products = undefined;
    }

    return result;
};
