import { Schema, model } from "mongoose";

export const invoiceSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "userSchema",
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "orderSchema",
        },

        trackerId: {
            type: String,
        },

        authority: {
            type: String,
        },
        amount: {
            type: Number,
        },
        result: {
            type: Boolean,
        },
    },
    {
        timestamps: true,
    }
);

export const Invoice = model("Invoice", invoiceSchema);
