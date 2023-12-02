import mongoose from "mongoose";

const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "userSchema",
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "orderSchema",
    },
    authority: {
      type: String,
    },
    amount: {
      type: Number,
    },
    result: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
