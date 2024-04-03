import { Schema, model } from "mongoose";

export const cartSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "userSchema",
            unique: true,
        },
        products: [
            {
                _id: {
                    required: true,
                    type: Schema.Types.ObjectId,
                    ref: "productSchema",
                },
                qty: {
                    required: true,
                    type: Number,
                },
                isAvailable: {
                    required: true,
                    type: Boolean,
                    default: false,
                },
            },
        ],
        totalPrice: {
            type: Number,
            default: 0,
        },
        totalQty: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export const Cart = model("Cart", cartSchema);
