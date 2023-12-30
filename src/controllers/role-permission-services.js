import Role from "../models/role";
import Permission from "../models/permission";
import User from "../models/user";
import validation from "../utils/data-validation";
import { mapperPermissions } from "../utils/mapper";
import { AppError } from "../handlers/error-handler";

const Response = require("../handlers/response");

const jwt = require("jsonwebtoken");

// Read all permissions
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

// Read all roles
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

// Create a role
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

// Change a user's role
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

// Add a role to a user
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

// Update a role
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

// Read a role by its ID
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

// Disable a role by its ID
export const disableRole = async (req, res, next) => {
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
        if (role.isDisable === true) {
            throw new AppError(325);
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

// Read disabled roles
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

// Enable a role by its ID
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
