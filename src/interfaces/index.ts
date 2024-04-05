import { Request } from "express";
import jwt from "jsonwebtoken";
import { Document, InferSchemaType, Types } from "mongoose";
import { cartSchema } from "../models/cart";
import { userSchema } from "../models/user";
import { permissionSchema } from "../models/permission";
import { categorySchema } from "../models/category";
import { roleSchema } from "../models/role";
import { productSchema } from "../models/product";
import { tokenSchema } from "../models/token";
import { invoiceSchema } from "../models/invoice";
import { orderSchema } from "../models/order";
import { walletSchema } from "../models/wallet";

//  Global

export type CategoryIdsType = { _id: string | Types.ObjectId }[];

export type PermissionListType = { name: string }[];

export type ProductImagesListType = { imageURL: string; isMain: boolean }[];

export type RequestType = Request & {
    isAuthenticated: boolean;
    token: string;
    user: UserType | null;
};

export type PermissionNamesType = {
    _id: Types.ObjectId;
    name: string;
};

export type JwtType = jwt.JwtPayload & { user: UserType };

export type OrderProductsType = {
    _id: Types.ObjectId | string;
    qty: number;
}[];

export type UserResponseType = {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    createdAt: string;
};

// Models

export type CartType = Document & InferSchemaType<typeof cartSchema>;

export type InvoiceType = Document & InferSchemaType<typeof invoiceSchema>;

export type UserType = Document & InferSchemaType<typeof userSchema>;

export type WalletType = Document & InferSchemaType<typeof walletSchema>;

export type OrderType = Document & InferSchemaType<typeof orderSchema>;

export type CategoryType = Document & InferSchemaType<typeof categorySchema>;

export type PermissionType = Document &
    InferSchemaType<typeof permissionSchema>;

export type RoleType = Document & InferSchemaType<typeof roleSchema>;

export type ProductType = Document & InferSchemaType<typeof productSchema>;

export type TokenType = Document & InferSchemaType<typeof tokenSchema>;

// Constants

export type ErrorCodeType = {
    message: string;
    code: number;
};

export class ErrorCodeClass {
    [errorID: number]: ErrorCodeType;
}

export type MessageCodeType = {
    message: string;
};

export class MessageCodeClass {
    [errorID: number]: MessageCodeType;
}

// Handlers

export type MessageType = {
    result?: any;
    messageCode: number;
    type?: "single" | "multi" | "multi/pagination";
    status?: number;
};
