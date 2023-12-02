import { AppError } from "../handlers/error-handler";
import Cart from "../models/cart";
import Order from "../models/order";
import ZarinPal from "zarinpal-checkout";
import env from "../configs/env.json";
import Payment from "../models/payment";
import { createCart, refreshCart } from "../utils/cart";
import Product from "../models/product";
import {
  checkOrderData,
  checkOrdersData,
  orderData,
  ordersData,
} from "../utils/payment";

const Response = require("../handlers/response");

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

    let shippingPrice = 25000;

    refreshCart(req.user._id);

    let products = [];

    cart.products.forEach((product) => {
      if (product.isAvailable === false)
        throw new AppError(333, `PRODUCT ID  : ${product._id}`);
      products.push({ _id: product._id, Qty: product.Qty });
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
      shippingPrice: shippingPrice,
      totalPrice: shippingPrice + cart.totalPrice,
      totalQty: cart.totalQty,
    });

    await newOrder.save();

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
          await new Payment({
            user: req.user._id,
            orderId: newOrder._id,
            authority: response.authority,
            amount: newOrder.totalPrice,
          }).save();
          return res.redirect(response.url);
        }
      });
  } catch (error) {
    return next(error);
  }
};

export const verifyOrder = async (req, res, next) => {
  try {
    let payment = await Payment.findOne({ authority: req.query.Authority });

    let order = await Order.findById(payment.orderId);

    let cart = await Cart.findOne({ user: order.user });

    const zarinpal = ZarinPal.create(env.MERCHANT_ID, true);

    if (payment.result !== undefined) throw new AppError(330);

    let refId = await zarinpal
      .PaymentVerification({
        Amount: payment.amount,
        Authority: req.query.Authority,
      })
      .then(function (response) {
        if (response.status == 100) {
          payment.result = true;
        } else {
          payment.result = false;
        }
        return response.RefID;
      });

    await payment.save();

    order.trackerId = refId;
    order.result = payment.result;

    await order.save();

    if (!payment.result) throw new AppError(332);

    for (let item of cart.products) {
      let product = await Product.findById(item._id);
      product.quantity -= item.Qty;
      product.save();
    }

    cart.products = [];
    cart.save();

    Response.normalizer(req, res, {
      result: await orderData(order._id),
      messageCode: 134,
    });
  } catch (error) {
    return next(error);
  }
};

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

export const checkOrder = async (req, res, next) => {
  try {
    Response.normalizer(req, res, {
      result: await checkOrderData(req.body.Id),
      messageCode: 100,
    });
  } catch (error) {
    return next(error);
  }
};
