import Role from "../models/role";
import Permission from "../models/permission";
import User from "../models/user";
import env from "../configs/env.json";
import validation from "../middlewares/data-validation";
import { mapperPermissions } from "../middlewares/mapper";
import { AppError } from "../handlers/error-handler";

const Response = require("../handlers/response");

const jwt = require("jsonwebtoken");

export const readAllPermissions = async (req, res, next) => {
  try {
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

export const readAllRoles = async (req, res, next) => {
  try {
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

export const createRole = async (req, res, next) => {
  try {
    req.body.permissions = mapperPermissions(req.body.permissions);

    validation.alphaNumeric(req.body.name);

    const newrole = new Role({
      name: req.body.name,
      permissions: req.body.permissions,
    });

    for (let permission of newrole.permissions) {
      let check = await Permission.findOne({ name: permission.name });
      if (check === null) throw new AppError(310);
    }

    const role = await newrole.save();

    Response.normalizer(req, res, {
      result: role,
      messageCode: 111,
    });
  } catch (error) {
    return next(error);
  }
};

export const changeUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId);

    const role = await Role.findOne({ name: req.body.role });

    if (role === null || user === null || role.isDisable === true) {
      throw new AppError(311);
    }

    user.role = [role.name];

    let updatedUser = await user.save();

    Response.normalizer(req, res, {
      result: updatedUser,
      messageCode: 112,
    });
  } catch (error) {
    return next(error);
  }
};

export const addUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId);

    const role = await Role.findOne({ name: req.body.role });

    if (role === null || user === null || role.isDisable === true) {
      throw new AppError(311);
    }

    user.role.push(role.name);

    let updatedUser = await user.save();

    Response.normalizer(req, res, {
      result: updatedUser,
      messageCode: 113,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    req.body.permissions = mapperPermissions(req.body.permissions);

    const role = await Role.findById(req.params.Id);

    const uneditableRoles = ["normalUser", "superUser", "limitedUser"];
    if (uneditableRoles.includes(role.name)) {
      throw new AppError(312);
    }
    let permissions = req.body.permissions
      ? req.body.permissions
      : role.permissions;

    for (let permission of permissions) {
      let check = await Permission.findOne({ name: permission.name });
      if (check === null) throw new AppError(310);
    }

    await role.updateOne(
      {
        permissions: permissions,
      },
      { new: true, useFindAndModify: false }
    );
    const updatedRole = await Role.findById(req.params.Id);

    Response.normalizer(req, res, {
      result: updatedRole,
      messageCode: 114,
    });
  } catch (error) {
    return next(error);
  }
};

export const readRoleById = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.Id);

    if (role.isDisable === true) throw new AppError(300);

    Response.normalizer(req, res, {
      result: role,
      messageCode: 100,
    });
  } catch (error) {
    return next(error);
  }
};

export const disableRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.Id);
    const indelibleRoles = [
      "normalUser",
      "superUser",
      "limitedUser",
      "adminUser",
    ];
    if (role.isDisable === true) {
      throw new AppError(325);
    }

    if (role === null) {
      throw new AppError(314);
    }

    if (indelibleRoles.includes(role.name)) {
      throw new AppError(313);
    }

    role.isDisable = true;
    await role.save();

    Response.normalizer(req, res, {
      result: role,
      messageCode: 115,
    });
  } catch (error) {
    return next(error);
  }
};

export const checkPermission = async (req, res, next) => {
  try {
    if (req.headers["authorization"] === undefined) throw new AppError(315);

    req.token = req.headers["authorization"].split(" ")[1];

    let tokenId = jwt.verify(req.token, env.JWT_SECRET).user._id;

    req.user = await User.findById(tokenId);

    if (req.user.isDisable === true) throw new AppError(327);

    const permission = req.route.path.slice(1) + "." + req.method.toLowerCase();

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

export const readDisabledRoles = async (req, res, next) => {
  try {
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

export const enableRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.Id);

    if (role.isDisable === false) {
      throw new AppError(326);
    }

    role.isDisable = false;
    await role.save();

    Response.normalizer(req, res, {
      result: role,
      messageCode: 116,
    });
  } catch (error) {
    return next(error);
  }
};
