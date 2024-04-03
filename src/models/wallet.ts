import { Schema, model } from "mongoose";

export const walletSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "userSchema",
            unique: true,
        },
        credit: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

export const Wallet = model("Wallet", walletSchema);
