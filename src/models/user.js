import mongoose from "mongoose";
const validator = require("validator");

const Schema = mongoose.Schema;

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
      validate(value) {
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
      type: String,
    },
    role: {
      type: String,
      default: "normalUser",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
