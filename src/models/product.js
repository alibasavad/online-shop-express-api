import mongoose from "mongoose";

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    categoryID: [
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
          unique: true,
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
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
