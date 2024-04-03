import mongoose from "mongoose";
import {
    InvoiceType,
    OrderProductsType,
    OrderType,
    ProductType,
    WalletType,
} from "../interfaces/index";
import { Invoice } from "../models/invoice";
import { Order } from "../models/order";
import { Product } from "../models/product";
import { Wallet } from "../models/wallet";

/**
 * @description return specefic orders info
 * @param {String} Id
 * @returns Order (mongoose model)
 */
export const orderData = async (Id: string): Promise<any> => {
    const order: OrderType | null = await Order.findById(Id);

    const result: any = await Order.aggregate([
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
        let orderProduct = order?.products.find(
            ({ _id }: any) => _id.toString() === product._id.toString()
        );
        product.qty = orderProduct?.qty;
    }

    return result;
};

/**
 * @description return a specefic order (admin)
 * @param {String} Id
 * @returns Order (mongoose model)
 */
export const checkOrderData = async (Id: string): Promise<any> => {
    const order: OrderType | null = await Order.findById(Id);

    const invoice: InvoiceType | null = await Invoice.findOne({ orderId: Id });

    const result: any = await Order.aggregate([
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
        let orderProduct = order?.products.find(
            ({ _id }: any) => _id.toString() === product._id.toString()
        );
        product.qty = orderProduct?.qty;
    }

    result[0].invoice = invoice;

    return result;
};

/**
 * @description return all orders (admin)
 * @param {String} Id
 * @returns Order (mongoose model)
 */
export const checkOrdersData = async (Id: string): Promise<any> => {
    const result: any = await Order.aggregate([
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
        const order: OrderType | null = await Order.findById(item._id);

        for (let product of item.products) {
            let orderProduct = order?.products.find(
                ({ _id }: any) => _id.toString() === product._id.toString()
            );
            product.qty = orderProduct?.qty;
        }

        const invoice: InvoiceType | null = await Invoice.findOne({
            orderId: order?._id,
        });

        item.invoice = invoice;
    }

    return result;
};

/**
 * @description return all user's orders
 * @param {String} Id
 * @returns Order (mongoose model)
 */
export const ordersData = async (Id: string): Promise<any> => {
    const result: any = await Order.aggregate([
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
        const order: OrderType | null = await Order.findById(item._id);

        for (let product of item.products) {
            let orderProduct = order?.products.find(
                ({ _id }: any) => _id.toString() === product._id.toString()
            );
            product.qty = orderProduct?.qty;
        }
    }

    return result;
};

/**
 * @description retuen not checked orders (admin)
 * @returns Order (mongoose model)
 */
export const notCheckedOrdersData = async (): Promise<any> => {
    const result: any = await Order.aggregate([
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
        const order: OrderType | null = await Order.findById(item._id);

        for (let product of item.products) {
            let orderProduct = order?.products.find(
                ({ _id }: any) => _id.toString() === product._id.toString()
            );
            product.qty = orderProduct?.qty;
        }

        const invoice = await Invoice.findOne({ orderId: order?._id });

        item.invoice = invoice;
    }

    return result;
};

/**
 * @description retuen pending orders (admin)
 * @returns Order (mongoose model)
 */
export const pendingOrdersData = async (): Promise<any> => {
    const result: any = await Order.aggregate([
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
        const order: OrderType | null = await Order.findById(item._id);

        for (let product of item.products) {
            let orderProduct = order?.products.find(
                ({ _id }: any) => _id.toString() === product._id.toString()
            );
            product.qty = orderProduct?.qty;
        }

        const invoice: InvoiceType | null = await Invoice.findOne({
            orderId: order?._id,
        });

        item.invoice = invoice;
    }

    return result;
};

/**
 * @description retuen delivered orders (admin)
 * @returns Order (mongoose model)
 */
export const deliveredOrdersData = async (): Promise<any> => {
    const result: any = await Order.aggregate([
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
        const order: OrderType | null = await Order.findById(item._id);

        for (let product of item.products) {
            let orderProduct = order?.products.find(
                ({ _id }: any) => _id.toString() === product._id.toString()
            );
            product.qty = orderProduct?.qty;
        }

        const invoice: InvoiceType | null = await Invoice.findOne({
            orderId: order?._id,
        });

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
export const walletPayment = async (
    userId: string,
    amount: number
): Promise<Boolean> => {
    let wallet: WalletType | null = await Wallet.findOne({ user: userId });

    if (wallet === null) {
        let wallet: WalletType = new Wallet({ user: userId });
        wallet = await wallet.save();
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
export const reserveProducts = async (
    products: OrderProductsType
): Promise<void> => {
    for (let item of products) {
        let product: ProductType | null = await Product.findById(item._id);
        if (product === null) return;

        product.reserved += item.qty;
        await product.save();
    }
};

/**
 * @description unreserve products
 * @param {Array} products
 */
export const unreserveProducts = async (
    products: OrderProductsType
): Promise<void> => {
    for (let item of products) {
        let product: ProductType | null = await Product.findById(item._id);
        if (product === null) return;

        product.reserved -= item.qty;
        await product.save();
    }
};
