import mongoose from "mongoose";

const Schema = mongoose.Schema;

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    permissions: [
      {
        name: {
          type: String,
          required: true,
        },
      },
    ],

    isDisable: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Role = mongoose.model("Role", roleSchema);
export default Role;
