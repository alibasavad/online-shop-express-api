import { NextFunction, Response } from "express";
import ZarinPal from "zarinpal-checkout";
import env from "../configs/env.json";
import { AppError } from "../handlers/error-handler";
import { normalizer } from "../handlers/response";
import {
    CartType,
    InvoiceType,
    OrderProductsType,
    OrderType,
    ProductType,
    RequestType,
} from "../interfaces/index";
import { Cart } from "../models/cart";
import { Invoice } from "../models/invoice";
import { Order } from "../models/order";
import { Product } from "../models/product";
import { createCart, refreshCart } from "../utils/cart";
import {
    checkOrderData,
    checkOrdersData,
    deliveredOrdersData,
    notCheckedOrdersData,
    orderData,
    ordersData,
    pendingOrdersData,
    reserveProducts,
    unreserveProducts,
    walletPayment,
} from "../utils/order";

// payment for order
export const payment = async (
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
            throw new AppError(331);
        }

        if (cart.products.length === 0) throw new AppError(331);

        let shippingPrice = env.SHIPPING_PRICE;

        refreshCart(req.user?._id);

        let products: OrderProductsType = [];

        cart.products.forEach((product) => {
            if (product.isAvailable === false)
                throw new AppError(333, `PRODUCT ID  : ${product._id}`);
            products.push({ _id: product._id.toString(), qty: product.qty });
        });

        const newOrder: OrderType = new Order({
            user: req.user?._id,
            products: products,
            merchantId: env.MERCHANT_ID,
            transfereeInfo: {
                country: req.body.country,
                city: req.body.city,
                address: req.body.address,
                phone: req.user?.phoneNumber,
                postalCode: req.body.postalCode,
                email: req.user?.email,
            },
            paymentType: req.body.paymentType || "paymentGateway",
            shippingPrice: shippingPrice,
            totalPrice: shippingPrice + cart.totalPrice,
            totalQty: cart.totalQty,
        });

        await newOrder.validate();

        // pay by wallet
        if (newOrder.paymentType === "wallet") {
            let result: boolean = await walletPayment(
                req.user?._id,
                newOrder.totalPrice
            );

            if (result === false) throw new AppError(335);

            newOrder.result = result;

            await newOrder.save();

            for (let item of cart.products) {
                let product: ProductType | null = await Product.findById(
                    item._id
                );
                if (product === null) throw new AppError(300);
                product.quantity -= item.qty;
                product.save();
            }

            cart.products = [];
            cart.save();

            return normalizer(req, res, {
                result: await orderData(newOrder._id),
                messageCode: 133,
            });
        }

        await newOrder.save();

        // pay by zarincart gateway
        const zarinpal = ZarinPal.create(env.MERCHANT_ID, true);

        zarinpal
            .PaymentRequest({
                Amount: newOrder.totalPrice,
                CallbackURL: "http://127.0.0.1:8000/api/v1/verify_payment",
                Description: "Sandbox Test",
                Email: req.user?.email,
                Mobile: req.user?.phoneNumber,
            })
            .then(async (response: any) => {
                if (response.status == 100) {
                    await new Invoice({
                        user: req.user?._id,
                        orderId: newOrder._id,
                        authority: response.authority,
                        amount: newOrder.totalPrice,
                    }).save();
                    await reserveProducts(newOrder.products);
                    return res.redirect(response.url);
                }
            });
    } catch (error) {
        return next(error);
    }
};

// verify if user pay the order
export const verifyOrder = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let invoice: InvoiceType | null = await Invoice.findOne({
            authority: req.query.Authority,
        });

        let order: OrderType | null = await Order.findById(invoice?.orderId);

        let cart: CartType | null = await Cart.findOne({ user: order?.user });

        if (invoice === null || order === null || cart === null)
            throw new AppError(300);

        const zarinpal = ZarinPal.create(env.MERCHANT_ID, true);

        unreserveProducts(order.products);

        if (invoice.result !== undefined) throw new AppError(330);

        let refId = await zarinpal
            .PaymentVerification({
                Amount: invoice.amount || 0,
                Authority: req.query.Authority?.toString() || "",
            })
            .then(function (response: any) {
                if (response.status == 100) {
                    if (invoice === null) throw new AppError(300);
                    invoice.result = true;
                } else {
                    if (invoice === null) throw new AppError(300);
                    invoice.result = false;
                }
                return response.RefID;
            });

        invoice.trackerId = refId;

        await invoice.save();

        order.trackerId = refId;
        order.result = invoice.result;

        await order.save();

        if (!invoice.result) throw new AppError(332);

        for (let item of cart.products) {
            let product: ProductType | null = await Product.findById(item._id);
            if (product === null) throw new AppError(300);
            product.quantity -= item.qty;
            product.save();
        }

        cart.products = [];
        cart.save();

        normalizer(req, res, {
            result: await orderData(order._id),
            messageCode: 133,
        });
    } catch (error) {
        return next(error);
    }
};

// return all user's orders
export const readOrders = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (req.isAuthenticated === false) {
            throw new AppError(328);
        }

        normalizer(req, res, {
            result: await ordersData(req.user?._id),
            messageCode: 100,
            type: "multi/pagination",
        });
    } catch (error) {
        return next(error);
    }
};

// return specefic order
export const readOrderById = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (req.isAuthenticated === false) {
            throw new AppError(328);
        }

        const order: OrderType | null = await Order.findById(req.params.Id);

        if (order?.user?.toString() !== req.user?._id.toString())
            throw new AppError(316);

        normalizer(req, res, {
            result: await orderData(req.params.Id),
            messageCode: 100,
        });
    } catch (error) {
        return next(error);
    }
};

// return all orders (admin)
export const checkOrders = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        normalizer(req, res, {
            result: await checkOrdersData(req.body.userId),
            messageCode: 100,
            type: "multi/pagination",
        });
    } catch (error) {
        return next(error);
    }
};

// return specefic order (admin)
export const checkOrder = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const order: OrderType | null = await Order.findById(req.body.Id);

        if (order === null) throw new AppError(300);

        order.isChecked = true;
        await order.save();

        normalizer(req, res, {
            result: await checkOrderData(req.body.Id),
            messageCode: 100,
        });
    } catch (error) {
        return next(error);
    }
};

// return orders that not checked by admin (admin)
export const notCheckedOrders = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        normalizer(req, res, {
            result: await notCheckedOrdersData(),
            messageCode: 100,
            type: "multi/pagination",
        });
    } catch (error) {
        return next(error);
    }
};

// return pending Orders (admin)
export const pendingOrders = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        normalizer(req, res, {
            result: await pendingOrdersData(),
            messageCode: 100,
            type: "multi/pagination",
        });
    } catch (error) {
        return next(error);
    }
};

// return delivered Orders (admin)
export const deliveredOrders = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        normalizer(req, res, {
            result: await deliveredOrdersData(),
            messageCode: 100,
            type: "multi/pagination",
        });
    } catch (error) {
        return next(error);
    }
};

// deliver an order (admin)
export const deliver = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const order: OrderType | null = await Order.findById(req.body.Id);

        if (order === null) throw new AppError(300);

        if (order.result === false) throw new AppError(334);

        order.status = "delivered";
        await order.save();

        normalizer(req, res, {
            result: await checkOrderData(req.body.Id),
            messageCode: 100,
        });
    } catch (error) {
        return next(error);
    }
};
