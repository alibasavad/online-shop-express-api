import mongoose from "mongoose";

const Schema = mongoose.Schema;

const categorySchema = new Schema(
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

const Category = mongoose.model("Category", categorySchema);
export default Category;
