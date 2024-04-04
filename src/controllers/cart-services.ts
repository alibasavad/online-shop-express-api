import { NextFunction, Response } from "express";
import { AppError } from "../handlers/error-handler";
import { normalizer } from "../handlers/response";
import { CartType, ProductType, RequestType } from "../interfaces/index";
import { Cart } from "../models/cart";
import { Product } from "../models/product";
import { activeCart, createCart, refreshCart } from "../utils/cart";

// show cart items
export const readCart = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (req.isAuthenticated === false) {
            throw new AppError(328);
        }

        let cart: CartType | null = await Cart.findOne({ user: req.user?._id });

        if (cart === null) {
            cart = await createCart(req.user?._id);
        }
        normalizer(req, res, {
            result: await refreshCart(req.user?._id),
            messageCode: 100,
        });
    } catch (error) {
        return next(error);
    }
};

// add a product to cart
export const addProduct = async (
    req: RequestType,
    res: Response,
    next: NextFunction
) => {
    try {
        if (req.isAuthenticated === false) {
            throw new AppError(328);
        }

        let cart: CartType | null = await Cart.findOne({ user: req.user?._id });

        if (cart === null) {
            cart = await createCart(req.user?._id);
        }

        var product: ProductType | null = await Product.findOne({
            _id: req.body.product,
        });

        if (product === null) throw new AppError(300);

        var isExist = false;

        for (let cartProduct of cart.products) {
            if (cartProduct._id.toString() === product._id.toString()) {
                cartProduct.qty += 1;
                cart.totalQty += 1;
                cart.totalPrice += product.price;
                isExist = true;
            }
        }

        if (!isExist) {
            cart.products.push({
                _id: req.body.product,
                qty: 1,
                isAvailable: true,
            });
            cart.totalQty += 1;
            cart.totalPrice += product.price;
        }

        await cart.save();

        normalizer(req, res, {
            result: await refreshCart(req.user?._id),
            messageCode: 100,
        });
    } catch (error) {
        return next(error);
    }
};

// dubstract a product from cart
export const subtractProduct = async (
    req: RequestType,
    res: Response,
    next: NextFunction
) => {
    try {
        if (req.isAuthenticated === false) {
            throw new AppError(328);
        }

        let cart: CartType | null = await Cart.findOne({ user: req.user?._id });

        if (cart === null) {
            cart = await createCart(req.user?._id);
        }

        var product: ProductType | null = await Product.findOne({
            _id: req.body.product,
        });

        if (product === null) throw new AppError(300);

        var isExist = false;

        for (let cartProduct of cart.products) {
            if (cartProduct._id.toString() === product._id.toString()) {
                cartProduct.qty -= 1;
                cart.totalQty -= 1;
                cart.totalPrice -= product.price;
                isExist = true;
            }
        }

        if (!isExist) {
            throw new AppError(329);
        }

        await cart.save();

        normalizer(req, res, {
            result: await refreshCart(req.user?._id),
            messageCode: 100,
        });
    } catch (error) {
        return next(error);
    }
};

// returns list of carts that have at least 1 product in them
export const activeCarts = async (
    req: RequestType,
    res: Response,
    next: NextFunction
) => {
    try {
        normalizer(req, res, {
            result: await activeCart(),
            messageCode: 100,
        });
    } catch (error) {
        return next(error);
    }
};
