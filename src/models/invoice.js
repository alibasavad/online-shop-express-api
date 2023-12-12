import mongoose from "mongoose";

const Schema = mongoose.Schema;

const invoiceSchema = new Schema(
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

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
