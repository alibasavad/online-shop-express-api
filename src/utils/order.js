import mongoose from "mongoose";
import Order from "../models/order";
import Invoice from "../models/invoice";
import Wallet from "../models/wallet";
import { AppError } from "../handlers/error-handler";
import Product from "../models/product";

/**
 * @description return specefic orders info
 * @param {String} Id
 * @returns Order (mongoose model)
 */
export const orderData = async (Id) => {
    const order = await Order.findById(Id);

    const result = await Order.aggregate([
        {
            $match: {
                $or: [{ result: false }, { result: true }],
                _id: new mongoose.Types.ObjectId(Id),
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
                user: 1,
                trackerId: 1,
                transfereeInfo: 1,
                paymentType: 1,
                shippingPrice: 1,
                totalPrice: 1,
                totalQty: 1,
                result: 1,
                status: 1,
                products: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    thumbnail: 1,
                },
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);

    for (let product of result[0].products) {
        let orderProduct = order.products.find(
            ({ _id }) => _id.toString() === product._id.toString()
        );
        product.qty = orderProduct.qty;
    }

    return result;
};

/**
 * @description return a specefic order (admin)
 * @param {String} Id
 * @returns Order (mongoose model)
 */
export const checkOrderData = async (Id) => {
    const order = await Order.findById(Id);

    const invoice = await Invoice.findOne({ orderId: Id });

    const result = await Order.aggregate([
        {
            $match: {
                $or: [{ result: false }, { result: true }],
                _id: new mongoose.Types.ObjectId(Id),
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
                user: 1,
                trackerId: 1,
                transfereeInfo: 1,
                paymentType: 1,
                shippingPrice: 1,
                totalPrice: 1,
                totalQty: 1,
                result: 1,
                status: 1,
                products: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    thumbnail: 1,
                },
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);

    for (let product of result[0].products) {
        let orderProduct = order.products.find(
            ({ _id }) => _id.toString() === product._id.toString()
        );
        product.qty = orderProduct.qty;
    }

    result[0].invoice = invoice;

    return result;
};

/**
 * @description return all orders (admin)
 * @param {String} Id
 * @returns Order (mongoose model)
 */
export const checkOrdersData = async (Id) => {
    const result = await Order.aggregate([
        {
            $match: {
                $or: [{ result: false }, { result: true }],
                user: new mongoose.Types.ObjectId(Id),
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
                user: 1,
                trackerId: 1,
                transfereeInfo: 1,
                paymentType: 1,
                shippingPrice: 1,
                totalPrice: 1,
                totalQty: 1,
                result: 1,
                status: 1,
                products: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    thumbnail: 1,
                },
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);

    for (let item of result) {
        const order = await Order.findById(item._id);

        for (let product of item.products) {
            let orderProduct = order.products.find(
                ({ _id }) => _id.toString() === product._id.toString()
            );
            product.qty = orderProduct.qty;
        }

        const invoice = await Invoice.findOne({ orderId: order._id });

        item.invoice = invoice;
    }

    return result;
};

/**
 * @description return all user's orders
 * @param {String} Id
 * @returns Order (mongoose model)
 */
export const ordersData = async (Id) => {
    const result = await Order.aggregate([
        {
            $match: {
                $or: [{ result: false }, { result: true }],
                user: new mongoose.Types.ObjectId(Id),
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
                user: 1,
                trackerId: 1,
                transfereeInfo: 1,
                paymentType: 1,
                shippingPrice: 1,
                totalPrice: 1,
                totalQty: 1,
                result: 1,
                status: 1,
                products: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    thumbnail: 1,
                },
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);

    for (let item of result) {
        const order = await Order.findById(item._id);

        for (let product of item.products) {
            let orderProduct = order.products.find(
                ({ _id }) => _id.toString() === product._id.toString()
            );
            product.qty = orderProduct.qty;
        }
    }

    return result;
};

/**
 * @description retuen not checked orders (admin)
 * @returns Order (mongoose model)
 */
export const notCheckedOrdersData = async () => {
    const result = await Order.aggregate([
        {
            $match: {
                result: true,
                isChecked: false,
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
                user: 1,
                trackerId: 1,
                transfereeInfo: 1,
                paymentType: 1,
                shippingPrice: 1,
                totalPrice: 1,
                totalQty: 1,
                result: 1,
                status: 1,
                products: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    thumbnail: 1,
                },
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);

    for (let item of result) {
        const order = await Order.findById(item._id);

        for (let product of item.products) {
            let orderProduct = order.products.find(
                ({ _id }) => _id.toString() === product._id.toString()
            );
            product.qty = orderProduct.qty;
        }

        const invoice = await Invoice.findOne({ orderId: order._id });

        item.invoice = invoice;
    }

    return result;
};

/**
 * @description retuen pending orders (admin)
 * @returns Order (mongoose model)
 */
export const pendingOrdersData = async () => {
    const result = await Order.aggregate([
        {
            $match: {
                result: true,
                status: "pending",
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
                user: 1,
                trackerId: 1,
                transfereeInfo: 1,
                paymentType: 1,
                shippingPrice: 1,
                totalPrice: 1,
                totalQty: 1,
                result: 1,
                status: 1,
                products: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    thumbnail: 1,
                },
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);

    for (let item of result) {
        const order = await Order.findById(item._id);

        for (let product of item.products) {
            let orderProduct = order.products.find(
                ({ _id }) => _id.toString() === product._id.toString()
            );
            product.qty = orderProduct.qty;
        }

        const invoice = await Invoice.findOne({ orderId: order._id });

        item.invoice = invoice;
    }

    return result;
};

/**
 * @description retuen delivered orders (admin)
 * @returns Order (mongoose model)
 */
export const deliveredOrdersData = async () => {
    const result = await Order.aggregate([
        {
            $match: {
                status: "delivered",
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
                user: 1,
                trackerId: 1,
                transfereeInfo: 1,
                paymentType: 1,
                shippingPrice: 1,
                totalPrice: 1,
                totalQty: 1,
                result: 1,
                status: 1,
                products: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    thumbnail: 1,
                },
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);

    for (let item of result) {
        const order = await Order.findById(item._id);

        for (let product of item.products) {
            let orderProduct = order.products.find(
                ({ _id }) => _id.toString() === product._id.toString()
            );
            product.qty = orderProduct.qty;
        }

        const invoice = await Invoice.findOne({ orderId: order._id });

        item.invoice = invoice;
    }

    return result;
};

/**
 * @description pay order from wallet
 * @param {String} userId
 * @param {Number} amount
 * @returns Boolean
 */
export const walletPayment = async (userId, amount) => {
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
        wallet = new Wallet({ user: req.user._id });
        wallet = wallet.save();
        return false;
    } else if (wallet.credit < amount) return false;

    wallet.credit -= amount;

    wallet.save();
    return true;
};

/**
 * @description reserve products until order result
 * @param {Array} products
 */
export const reserveProducts = async (products) => {
    for (let item of products) {
        let product = await Product.findById(item._id);
        product.reserved += item.qty;
        await product.save();
    }
};

/**
 * @description unreserve products
 * @param {Array} products
 */
export const unreserveProducts = async (products) => {
    for (let item of products) {
        let product = await Product.findById(item._id);
        product.reserved -= item.qty;
        await product.save();
    }
};
