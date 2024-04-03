import { Request } from "express";
import jwt from "jsonwebtoken";
import { Document, InferSchemaType } from "mongoose";
import { cartSchema } from "../models/cart";
import { userSchema } from "../models/user";
import { categorySchema } from "../models/category";

//  Global

export type CategoryIdsType = { _id: string }[];


export type RequestType = Request & {
    isAuthenticated: boolean;
    token: string;
    user: UserType | null;
};

export type JwtType = jwt.JwtPayload & { user: UserType };

// Models

export type CartType = Document & InferSchemaType<typeof cartSchema>;

export type UserType = Document & InferSchemaType<typeof userSchema>;

export type CategoryType = Document & InferSchemaType<typeof categorySchema>;

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
    result?: string;
    messageCode: number;
    type?: "single" | "multi" | "multi/pagination";
    status?: number;
};
