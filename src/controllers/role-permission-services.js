import Role from "../models/role";
import Permission from "../models/permission";
import User from "../models/user";
import env from "../configs/env.json";
import validation from "../utils/data-validation";
import { mapperPermissions } from "../utils/mapper";
import { AppError } from "../handlers/error-handler";
import { checkToken } from "../utils/token";

const Response = require("../handlers/response");

const jwt = require("jsonwebtoken");

// Read all permissions
export const readAllPermissions = async (req, res, next) => {
  try {
    // Find all permissions and select only the "name" field
    const permissions = await Permission.find().select(["name"]);

    Response.normalizer(req, res, {
      result: permissions,
      messageCode: 100,
      type: "multi/pagination",
    });
  } catch (error) {
    next(error);
  }
};

// Read all roles
export const readAllRoles = async (req, res, next) => {
  try {
    // Aggregate the roles collection to include only roles that are not disabled
    const roles = await Role.aggregate([
      {
        $match: {
          isDisable: false,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          permissions: {
            name: 1,
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    Response.normalizer(req, res, {
      result: roles,
      messageCode: 100,
      type: "multi/pagination",
    });
  } catch (error) {
    return next(error);
  }
};

// Create a role
export const createRole = async (req, res, next) => {
  try {
    // Map the permissions array to expected form
    req.body.permissions = mapperPermissions(req.body.permissions);

    // Validate the name using the alphaNumeric validation function
    validation.alphaNumeric(req.body.name);

    // Create a new role with the provided name and permissions
    const newrole = new Role({
      name: req.body.name,
      permissions: req.body.permissions,
    });

    // Check if each permission in the new role exists
    for (let permission of newrole.permissions) {
      let check = await Permission.findOne({ name: permission.name });
      if (check === null) throw new AppError(310);
    }

    // Save the new role
    const role = await newrole.save();

    Response.normalizer(req, res, {
      result: role,
      messageCode: 111,
    });
  } catch (error) {
    return next(error);
  }
};

// Change a user's role
export const changeUserRole = async (req, res, next) => {
  try {
    // Find the user by their ID
    const user = await User.findById(req.body.userId);

    // Find the role by its name
    const role = await Role.findOne({ name: req.body.role });

    // If the role or user is not found, or if the role is disabled, throw an error
    if (role === null || user === null || role.isDisable === true) {
      throw new AppError(311);
    }

    // Update the user's role with the new role name
    user.role = [role.name];

    // Save the updated user
    let updatedUser = await user.save();

    Response.normalizer(req, res, {
      result: updatedUser,
      messageCode: 112,
    });
  } catch (error) {
    return next(error);
  }
};

// Add a role to a user
export const addUserRole = async (req, res, next) => {
  try {
    // Find the user by their ID
    const user = await User.findById(req.body.userId);

    // Find the role by its name
    const role = await Role.findOne({ name: req.body.role });

    // If the role or user is not found, or if the role is disabled, throw an error
    if (role === null || user === null || role.isDisable === true) {
      throw new AppError(311);
    }

    // Add the role to the user's role array
    user.role.push(role.name);

    // Save the updated user
    let updatedUser = await user.save();

    Response.normalizer(req, res, {
      result: updatedUser,
      messageCode: 113,
    });
  } catch (error) {
    return next(error);
  }
};

// Update a role
export const updateRole = async (req, res, next) => {
  try {
    // Map the permissions array to expexted form
    req.body.permissions = mapperPermissions(req.body.permissions);

    // Find the role by its ID
    const role = await Role.findById(req.params.Id);

    // Define an array of roles that cannot be edited
    const uneditableRoles = ["normalUser", "superUser", "limitedUser"];

    // If the role is in the uneditableRoles array, throw an error
    if (uneditableRoles.includes(role.name)) {
      throw new AppError(312);
    }

    // Set the permissions to the updated permissions if provided, otherwise use the current permissions
    let permissions = req.body.permissions
      ? req.body.permissions
      : role.permissions;

    // Check if each permission in the updated role exists
    for (let permission of permissions) {
      let check = await Permission.findOne({ name: permission.name });
      if (check === null) throw new AppError(310);
    }

    // Update the role's permissions with the updated permissions
    await role.updateOne(
      {
        permissions: permissions,
      },
      { new: true, useFindAndModify: false }
    );

    // Find the updated role by its ID
    const updatedRole = await Role.findById(req.params.Id);

    Response.normalizer(req, res, {
      result: updatedRole,
      messageCode: 114,
    });
  } catch (error) {
    return next(error);
  }
};

// Read a role by its ID
export const readRoleById = async (req, res, next) => {
  try {
    // Find the role by its ID
    const role = await Role.findById(req.params.Id);

    // If the role is disabled, throw an error
    if (role.isDisable === true) throw new AppError(300);

    Response.normalizer(req, res, {
      result: role,
      messageCode: 100,
    });
  } catch (error) {
    return next(error);
  }
};

// Disable a role by its ID
export const disableRole = async (req, res, next) => {
  try {
    // Find the role by its ID
    const role = await Role.findById(req.params.Id);

    // Define a list of indelible roles that cannot be disabled
    const indelibleRoles = [
      "normalUser",
      "superUser",
      "limitedUser",
      "adminUser",
    ];
    // If the role is already disabled, throw an error
    if (role.isDisable === true) {
      throw new AppError(325);
    }

    // If the role does not exist, throw an error
    if (role === null) {
      throw new AppError(314);
    }

    // If the role is an indelible role, throw an error
    if (indelibleRoles.includes(role.name)) {
      throw new AppError(313);
    }

    // Set the isDisable property of the role to true
    role.isDisable = true;

    // Save the updated role
    await role.save();

    Response.normalizer(req, res, {
      result: role,
      messageCode: 115,
    });
  } catch (error) {
    return next(error);
  }
};

// Read disabled roles
export const readDisabledRoles = async (req, res, next) => {
  try {
    // Find all roles that are disabled using aggregation
    const roles = await Role.aggregate([
      {
        $match: {
          isDisable: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          permissions: {
            name: 1,
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    Response.normalizer(req, res, {
      result: roles,
      messageCode: 100,
      type: "multi/pagination",
    });
  } catch (error) {
    return next(error);
  }
};

// Enable a role by its ID
export const enableRole = async (req, res, next) => {
  try {
    // Find the role by its ID
    const role = await Role.findById(req.params.Id);

    // If the role is already enabled, throw an error
    if (role.isDisable === false) {
      throw new AppError(326);
    }

    // Set the isDisable property of the role to false
    role.isDisable = false;
    // Save the updated role
    await role.save();

    Response.normalizer(req, res, {
      result: role,
      messageCode: 116,
    });
  } catch (error) {
    return next(error);
  }
};

// Check permission for a user
export const checkPermission = async (req, res, next) => {
  try {
    // Check if the authorization header is present
    if (req.headers["authorization"] === undefined) throw new AppError(315);

    // Extract the token from the authorization header
    req.token = req.headers["authorization"].split(" ")[1];

    // Verify the token and get the user ID from it
    let tokenId = jwt.verify(req.token, env.JWT_SECRET).user._id;

    // Find the user by the user ID
    req.user = await User.findById(tokenId);

    // If the user is disabled, throw an error
    if (req.user.isDisable === true) throw new AppError(327);

    // Check if the access token is valid for the user
    await checkToken.accessToken(req.user._id, req.token);

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
