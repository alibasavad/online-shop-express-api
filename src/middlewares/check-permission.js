import Role from "../models/role";
import { AppError } from "../handlers/error-handler";

// Check permission for a user
export const checkPermission = async (req, res, next) => {
    try {
        if (req.isAuthenticated === false) {
            throw new AppError(315);
        }

        const permission =
            req.route.path.slice(1) + "." + req.method.toLowerCase();

        const userPermissions = [];

        for (let role of req.user.role) {
            const checkRole = await Role.findOne({ name: role });

            if (checkRole.isDisable === false) {
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
