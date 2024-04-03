import { Schema, model } from "mongoose";

export const roleSchema = new Schema(
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

export const Role = model("Role", roleSchema);
