import Role from "../models/role";
import { AppError } from "../handlers/error-handler";


// Check permission for a user
export const checkPermission = async (req, res, next) => {
  try {
    if (req.isAuthenticated === false) {
      throw new AppError(315);
    }

    // Generate the permission string based on the route path and HTTP method
    const permission = req.route.path.slice(1) + "." + req.method.toLowerCase();

    // Create an empty array to store user permissions
    const userPermissions = [];

    // Loop through each role of the user and
    for (let role of req.user.role) {
      // Find the role by name
      const checkRole = await Role.findOne({ name: role });

      // If the role is enabled, add its permissions to the userPermissions array
      if (checkRole.isDisable === false) {
        checkRole.permissions.forEach((permission) => {
          userPermissions.push(permission.name);
        });
      }
    }

    // If the user does not have the required permission, throw an error
    if (!userPermissions.includes(permission)) {
      throw new AppError(316);
    }

    next();
  } catch (error) {
    return next(error);
  }
};
