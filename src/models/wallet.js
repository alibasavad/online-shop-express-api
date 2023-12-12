import mongoose from "mongoose";

const Schema = mongoose.Schema;

const walletSchema = new Schema(
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

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
