import { NextFunction, Response } from "express";
import { AppError } from "../handlers/error-handler";
import { RequestType } from "../interfaces/index";
import { Role } from "../models/role";

// Check permission for a user
export const checkPermission = async (
    req: RequestType,
    res: Response,
    next: NextFunction
) => {
    try {
        if (req.isAuthenticated === false || req.user === null) {
            throw new AppError(315);
        }

        const permission: string =
            req.route.path.slice(1) + "." + req.method.toLowerCase();

        const userPermissions: string[] = [];

        for (let role of req.user.role) {
            const checkRole = await Role.findOne({ name: role });

            if (checkRole?.isDisable === false) {
                checkRole.permissions.forEach((permission) => {
                    userPermissions.push(permission.name);
                });
            }
        }

        if (!userPermissions.includes(permission)) {
            throw new AppError(316);
        }

        next();
    } catch (error) {
        return next(error);
    }
};
