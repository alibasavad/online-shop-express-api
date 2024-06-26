import { Schema, model } from "mongoose";

export const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        categoryId: [
            {
                _id: {
                    type: Schema.Types.ObjectId,
                    ref: "categorySchema",
                    required: true,
                },
            },
        ],
        price: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        images: [
            {
                imageURL: {
                    type: String,
                },
                isMain: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        thumbnail: {
            type: String,
        },
        description: {
            type: String,
        },
        isDisable: {
            type: Boolean,
            default: false,
        },
        reserved: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export const Product = model("Product", productSchema);
