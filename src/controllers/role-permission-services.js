import Role from "../models/role";
import Permission from "../models/permission";
import User from "../models/user";
import env from "../configs/env.json";

const jwt = require("jsonwebtoken");

export const readAllPermissions = async (req, res, next) => {
  try {
    const permissions = await Permission.find().select(["name"]);
    res.json(permissions);
  } catch (error) {
    res.send(error);
  }
};

export const readAllRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().select(["name", "permissions"]);
    res.json(roles);
  } catch (error) {
    res.send(error);
  }
};

export const createRole = async (req, res, next) => {
  try {
    const newrole = new Role({
      name: req.body.name,
      permissions: req.body.permissions,
    });
    for (let permission of newrole.permissions) {
      let check = Permission.find({ name: permission.name });
      if (check === null) return res.send("incorrect permission list");
    }
    const role = await newrole.save();
    res.json(role);
  } catch (error) {
    res.send(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId);

    const role = await Role.findOne({ name: req.body.role });

    if (role === null || user === null) {
      return res.send("incorrect role or userId");
    }

    user.role = role.name;

    let updatedUser = await user.save();

    res.json(updatedUser);
  } catch (error) {
    res.send(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.roleId);

    const uneditableRoles = ["normalUser", "superUser", "limitedUser"];
    if (uneditableRoles.includes(role.name)) {
      return res.send("this role cant be deleted");
    }
    let name = req.body.name ? req.body.name : role.name;
    let permissions = req.body.permissions
      ? req.body.permissions
      : role.permissions;

    await role.updateOne(
      {
        name: name,
        permissions: permissions,
      },
      { new: true, useFindAndModify: false }
    );
    const updatedRole = await Role.findById(req.params.roleId);
    res.json(updatedRole);
  } catch (error) {
    res.send(error);
  }
};

export const readRoleById = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.roleId);
    res.json(role);
  } catch (error) {
    res.send(error);
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.roleId);
    const indelibleRoles = [
      "normalUser",
      "superUser",
      "limitedUser",
      "adminUser",
    ];

    if (role === null) {
      return res.send("incorrect role");
    }

    if (indelibleRoles.includes(role.name)) {
      return res.send("this role cant be deleted");
    }

    role.deleteOne();

    res.send("role deleted successfully");
  } catch (error) {
    res.send(error);
  }
};

export const checkPermission = async (req, res, next) => {
  try {
    if (req.headers["authorization"] === undefined)
      return res.send("invalid_token");

    req.token = req.headers["authorization"].split(" ")[1];

    req.user = jwt.verify(req.token, env.JWT_SECRET).user;

    const permission = req.route.path.slice(1) + "." + req.method.toLowerCase();

    const role = await Role.findOne({ name: req.user.role });

    const rolePermissions = [];
    role.permissions.forEach((permission) => {
      rolePermissions.push(permission.name);
    });

    if (!rolePermissions.includes(permission)) {
      return res.send("No Permission");
    }

    next();
  } catch (error) {
    res.json(error);
  }
};
