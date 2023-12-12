import mongoose from "mongoose";

const Schema = mongoose.Schema;

const permissionSchema = new Schema(
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

const Permission = mongoose.model("Permission", permissionSchema);
export default Permission;
