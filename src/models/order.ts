import { Schema, model } from "mongoose";

export const orderSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "userSchema",
        },

        merchantId: { type: String },

        trackerId: { type: String },

        products: [
            {
                _id: {
                    type: Schema.Types.ObjectId,
                    ref: "productSchema",
                },
                qty: {
                    type: Number,
                },
            },
        ],

        transfereeInfo: {
            country: {
                type: String,
                required: true,
            },

            city: {
                type: String,
                required: true,
            },

            address: {
                type: String,
                required: true,
            },

            phone: {
                type: String,
                required: true,
            },

            postalCode: {
                type: String,
                required: true,
            },

            email: {
                type: String,
                required: true,
            },
        },

        paymentType: {
            type: String,
            enum: ["paymentGateway", "wallet"],
            default: "paymentGateway",
        },

        shippingPrice: {
            type: Number,
            default: 0,
        },

        totalPrice: {
            type: Number,
            default: 0,
        },

        totalQty: {
            type: Number,
            default: 0,
        },

        result: {
            type: Boolean,
        },
        isChecked: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ["pending", "delivered"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

export const Order = model("Order", orderSchema);
