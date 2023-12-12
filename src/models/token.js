import mongoose from "mongoose";

const Schema = mongoose.Schema;

const tokenSchema = Schema(
    {
        token: {
            accessToken: { type: String },
            refreshToken: { type: String },
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "userSchema",
        },
    },
    {
        timestamps: true,
    }
);

const Token = mongoose.model("Token", tokenSchema);
export default Token;
