import mongoose from "mongoose";
import Order from "../models/order";
import Payment from "../models/payment";

export const orderData = async (Id) => {
  const order = await Order.findById(Id);

  const result = await Order.aggregate([
    {
      $match: {
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
    product.Qty = orderProduct.Qty;
  }

  return result;
};

export const checkOrderData = async (Id) => {
  const order = await Order.findById(Id);

  const payment = await Payment.findOne({ orderId: Id });

  const result = await Order.aggregate([
    {
      $match: {
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
    product.Qty = orderProduct.Qty;
  }

  result[0].payment = payment;

  return result;
};

export const checkOrdersData = async (Id) => {
  const result = await Order.aggregate([
    {
      $match: {
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
      product.Qty = orderProduct.Qty;
    }

    const payment = await Payment.findOne({ orderId: order._id });

    item.payment = payment;
  }

  return result;
};

export const ordersData = async (Id) => {
  const result = await Order.aggregate([
    {
      $match: {
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
      product.Qty = orderProduct.Qty;
    }
  }

  return result;
};
