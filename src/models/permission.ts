import { Schema, model } from "mongoose";

export const permissionSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Permission = model("Permission", permissionSchema);
