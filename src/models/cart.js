import mongoose from "mongoose";

const Schema = mongoose.Schema;

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "userSchema",
      unique: true,
    },
    products: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: "productSchema",
        },
        Qty: {
          type: Number,
        },
        isAvailable: {
          type: Boolean,
          default: false,
        },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
    totalQty: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
