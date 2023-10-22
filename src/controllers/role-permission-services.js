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
      message: "fetched data successfully",
      type: "multi",
    });
  } catch (error) {
    next(error);
  }
};

export const readAllRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().select(["name", "permissions"]);

    Response.normalizer(req, res, {
      result: roles,
      message: "fetched data successfully",
      type: "multi",
    });
  } catch (error) {
    return next(error);
  }
};

export const createRole = async (req, res, next) => {
  try {
    req.body.permissions = mapperPermissions(req.body.permissions);

    validation.checkName(req.body.name);

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
      message: "Role Created successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const changeUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId);

    const role = await Role.findOne({ name: req.body.role });

    if (role === null || user === null) {
      throw new AppError(311);
    }

    user.role = [role.name];

    let updatedUser = await user.save();

    Response.normalizer(req, res, {
      result: updatedUser,
      message: "Users Role Changed successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const addUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId);

    const role = await Role.findOne({ name: req.body.role });

    if (role === null || user === null) {
      throw new AppError(311);
    }

    user.role.push(role.name);

    let updatedUser = await user.save();

    Response.normalizer(req, res, {
      result: updatedUser,
      message: "Role Added To User successfully",
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
    let name = req.body.name ? req.body.name : role.name;
    let permissions = req.body.permissions
      ? req.body.permissions
      : role.permissions;

    for (let permission of permissions) {
      let check = await Permission.findOne({ name: permission.name });
      if (check === null) throw new AppError(310);
    }

    validation.checkName(name);

    await role.updateOne(
      {
        name: name,
        permissions: permissions,
      },
      { new: true, useFindAndModify: false }
    );
    const updatedRole = await Role.findById(req.params.Id);

    Response.normalizer(req, res, {
      result: updatedRole,
      message: "Role Updated successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const readRoleById = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.Id);

    Response.normalizer(req, res, {
      result: role,
      message: "fetched data successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.Id);
    const indelibleRoles = [
      "normalUser",
      "superUser",
      "limitedUser",
      "adminUser",
    ];

    if (role === null) {
      throw new AppError(314);
    }

    if (indelibleRoles.includes(role.name)) {
      throw new AppError(313);
    }

    role.deleteOne();

    Response.normalizer(req, res, {
      result: role,
      message: "Role Deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const checkPermission = async (req, res, next) => {
  try {
    if (req.headers["authorization"] === undefined) throw new AppError(315);

    req.token = req.headers["authorization"].split(" ")[1];

    req.user = jwt.verify(req.token, env.JWT_SECRET).user;

    const permission = req.route.path.slice(1) + "." + req.method.toLowerCase();

    const userPermissions = [];

    for (let role of req.user.role) {
      const checkRole = await Role.findOne({ name: role });
      checkRole.permissions.forEach((permission) => {
        userPermissions.push(permission.name);
      });
    }

    if (!userPermissions.includes(permission)) {
      throw new AppError(316);
    }

    next();
  } catch (error) {
    return next(error);
  }
};
