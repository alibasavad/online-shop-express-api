import { Schema, model } from "mongoose";

export const tokenSchema = new Schema(
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

export const Token = model("Token", tokenSchema);
