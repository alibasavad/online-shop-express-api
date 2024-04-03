import { AppError } from "../handlers/error-handler";
import {Cart} from "../models/cart";
import {Order} from "../models/order";
import ZarinPal from "zarinpal-checkout";
import env from "../configs/env.json";
import {Invoice} from "../models/invoice";
import { createCart, refreshCart } from "../utils/cart";
import {Product} from "../models/product";
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

const Response = require("../handlers/response");

// payment for order
export const payment = async (req, res, next) => {
    try {
        if (req.isAuthenticated === false) {
            throw new AppError(328);
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (cart === null) {
            cart = createCart(req.user._id);
            throw new AppError(331);
        }

        if (cart.products.length === 0) throw new AppError(331);

        let shippingPrice = env.SHIPPING_PRICE;

        refreshCart(req.user._id);

        let products = [];

        cart.products.forEach((product) => {
            if (product.isAvailable === false)
                throw new AppError(333, `PRODUCT ID  : ${product._id}`);
            products.push({ _id: product._id, qty: product.qty });
        });

        const newOrder = new Order({
            user: req.user._id,
            products: products,
            merchantId: env.MERCHANT_ID,
            transfereeInfo: {
                country: req.body.country,
                city: req.body.city,
                address: req.body.address,
                phone: req.user.phoneNumber,
                postalCode: req.body.postalCode,
                email: req.user.email,
            },
            paymentType: req.body.paymentType || "paymentGateway",
            shippingPrice: shippingPrice,
            totalPrice: shippingPrice + cart.totalPrice,
            totalQty: cart.totalQty,
        });

        await newOrder.validate();

        // pay by wallet
        if (newOrder.paymentType === "wallet") {
            let result = await walletPayment(req.user._id, newOrder.totalPrice);

            if (result === false) throw new AppError(335);

            newOrder.result = result;

            await newOrder.save();

            for (let item of cart.products) {
                let product = await Product.findById(item._id);
                product.quantity -= item.qty;
                product.save();
            }

            cart.products = [];
            cart.save();

            return Response.normalizer(req, res, {
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
                Email: req.user.email,
                Mobile: req.user.phoneNumber,
            })
            .then(async (response) => {
                if (response.status == 100) {
                    await new Invoice({
                        user: req.user._id,
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
export const verifyOrder = async (req, res, next) => {
    try {
        let invoice = await Invoice.findOne({ authority: req.query.Authority });

        let order = await Order.findById(invoice.orderId);

        let cart = await Cart.findOne({ user: order.user });

        const zarinpal = ZarinPal.create(env.MERCHANT_ID, true);

        unreserveProducts(order.products);

        if (invoice.result !== undefined) throw new AppError(330);

        let refId = await zarinpal
            .PaymentVerification({
                Amount: invoice.amount,
                Authority: req.query.Authority,
            })
            .then(function (response) {
                if (response.status == 100) {
                    invoice.result = true;
                } else {
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
            let product = await Product.findById(item._id);
            product.quantity -= item.qty;
            product.save();
        }

        cart.products = [];
        cart.save();

        Response.normalizer(req, res, {
            result: await orderData(order._id),
            messageCode: 133,
        });
    } catch (error) {
        return next(error);
    }
};

// return all user's orders
export const readOrders = async (req, res, next) => {
    try {
        if (req.isAuthenticated === false) {
            throw new AppError(328);
        }

        Response.normalizer(req, res, {
            result: await ordersData(req.user._id),
            messageCode: 100,
            type: "multi/pagination",
        });
    } catch (error) {
        return next(error);
    }
};

// return specefic order
export const readOrderById = async (req, res, next) => {
    try {
        if (req.isAuthenticated === false) {
            throw new AppError(328);
        }

        const order = await Order.findById(req.params.Id);

        if (order.user.toString() !== req.user._id.toString())
            throw new AppError(316);

        Response.normalizer(req, res, {
            result: await orderData(req.params.Id),
            messageCode: 100,
        });
    } catch (error) {
        return next(error);
    }
};

// return all orders (admin)
export const checkOrders = async (req, res, next) => {
    try {
        Response.normalizer(req, res, {
            result: await checkOrdersData(req.body.userId),
            messageCode: 100,
            type: "multi/pagination",
        });
    } catch (error) {
        return next(error);
    }
};

// return specefic order (admin)
export const checkOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.body.Id);

        order.isChecked = true;
        await order.save();

        Response.normalizer(req, res, {
            result: await checkOrderData(req.body.Id),
            messageCode: 100,
        });
    } catch (error) {
        return next(error);
    }
};

// return orders that not checked by admin (admin)
export const notCheckedOrders = async (req, res, next) => {
    try {
        Response.normalizer(req, res, {
            result: await notCheckedOrdersData(),
            messageCode: 100,
            type: "multi/pagination",
        });
    } catch (error) {
        return next(error);
    }
};

// return pending Orders (admin)
export const pendingOrders = async (req, res, next) => {
    try {
        Response.normalizer(req, res, {
            result: await pendingOrdersData(),
            messageCode: 100,
            type: "multi/pagination",
        });
    } catch (error) {
        return next(error);
    }
};

// return delivered Orders (admin)
export const deliveredOrders = async (req, res, next) => {
    try {
        Response.normalizer(req, res, {
            result: await deliveredOrdersData(),
            messageCode: 100,
            type: "multi/pagination",
        });
    } catch (error) {
        return next(error);
    }
};

// deliver an order (admin)
export const deliver = async (req, res, next) => {
    try {
        const order = await Order.findById(req.body.Id);

        if (order.result === false) throw new AppError(334);

        order.status = "delivered";
        await order.save();

        Response.normalizer(req, res, {
            result: await checkOrderData(req.body.Id),
            messageCode: 100,
        });
    } catch (error) {
        return next(error);
    }
};
