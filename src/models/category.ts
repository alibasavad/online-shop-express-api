import { Schema, model } from "mongoose";

export const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },

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
    },
    {
        timestamps: true,
    }
);

export const Category = model("Category", categorySchema);
