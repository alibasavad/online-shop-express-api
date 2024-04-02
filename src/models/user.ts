import { Schema, InferSchemaType, model, Document } from "mongoose";
import validator from "validator";

const userSchema = new Schema(
    {
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        email: {
            type: String,
            lowercase: true,
            unique: true,
            required: true,
            validate(value: string) {
                if (!validator.isEmail(value)) {
                    throw new Error("Email is invalid");
                }
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        passExpiresAt: {
            type: Number,
            default: null,
        },
        isDisable: {
            type: Boolean,
            default: true,
        },
        phoneNumber: {
            type: String,
            unique: true,
            maxLength: 11,
            minLength: 11,
        },
        verificationCode: {
            code: { type: String },
            expiresAt: { type: Number },
        },
        role: {
            type: [String],
            default: ["normalUser"],
        },
    },
    {
        timestamps: true,
    }
);

export type UserType = Document & InferSchemaType<typeof userSchema>;

export const User = model("User", userSchema);
