import {User} from "../models/user";
import env from "../configs/env.json";
import auth from "../utils/auth";
import { sendEmailConfirmation, sendTemporaryPassword } from "../utils/smtp";
import generatePassword from "../utils/password-generator";
import validation from "../utils/data-validation";
import { AppError } from "../handlers/error-handler";
import { checkToken, removeToken, saveToken } from "../utils/token";
import { makeSixDigitRandomString } from "../utils/global";

const Response = require("../handlers/response");
const Bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new user
export const register = async (req, res, next) => {
    try {
        validation.alpha(req.body.lastName);

        validation.alpha(req.body.firstName);

        validation.phoneNumber(req.body.phoneNumber);

        validation.password(req.body.password);

        let newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
        });

        newUser.verificationCode.code = makeSixDigitRandomString();

        newUser.verificationCode.expiresAt =
            Math.floor(Date.now() / 60000) +
            env.VERIFICATION_CODE_EXPIRY_TIME_MINUTE;

        newUser.password = await Bcrypt.hash(req.body.password, 10);

        await newUser.save();

        sendEmailConfirmation(newUser.verificationCode.code, newUser.email);

        const user = await User.findById(newUser._id).select([
            "firstName",
            "lastName",
            "email",
            "phoneNumber",
            "createdAt",
        ]);

        Response.normalizer(req, res, {
            result: user,
            messageCode: 117,
        });
    } catch (error) {
        return next(error);
    }
};

// Disable a user account
export const disableAccount = async (req, res, next) => {
    try {
        const user = await auth(req.body.email, req.body.password);

        if (user === null) throw new AppError(317);

        user.isDisable = true;

        await user.save();

        Response.normalizer(req, res, {
            messageCode: 118,
        });
    } catch (error) {
        return next(error);
    }
};

// User login
export const login = async (req, res, next) => {
    try {
        const user = await auth(req.body.email, req.body.password);

        if (user === null) throw new AppError(317);

        if (user.isDisable === true) {
            throw new AppError(318, 119);
        }

        if (
            user.passExpiresAt !== null &&
            Date.now() / 60000 > user.passExpiresAt
        ) {
            throw new AppError(317, 120);
        }

        const accessToken = jwt.sign({ user }, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN,
        });

        const refreshToken = jwt.sign({ user }, env.JWT_SECRET_REFRESH_TOKEN, {
            expiresIn: env.JWT_EXPIRES_IN_REFRESH,
        });

        await saveToken(user._id, accessToken, refreshToken);

        user.save();

        res.json({
            accessToken: { token: accessToken, expiresIn: env.JWT_EXPIRES_IN },
            refreshToken: {
                token: refreshToken,
                expiresIn: env.JWT_EXPIRES_IN_REFRESH,
            },
        });
    } catch (error) {
        return next(error);
    }
};

// verify user using the verification code that send ti its email
export const verifyAccount = async (req, res, next) => {
    try {
        const user = await auth(req.body.email, req.body.password);

        if (user === null) throw new AppError(317);

        if (user.isDisable === false) throw new AppError(319);

        const check = user.verificationCode.code === req.body.verificationCode;

        if (user.verificationCode.expiresAt < Math.floor(Date.now() / 60000)) {
            throw new AppError(320);
        }

        if (check) {
            user.isDisable = false;

            const accessToken = jwt.sign({ user }, env.JWT_SECRET, {
                expiresIn: env.JWT_EXPIRES_IN,
            });

            const refreshToken = jwt.sign(
                { user },
                env.JWT_SECRET_REFRESH_TOKEN,
                {
                    expiresIn: env.JWT_EXPIRES_IN_REFRESH,
                }
            );

            await saveToken(user._id, accessToken, refreshToken);

            user.save();

            res.json({
                accessToken: {
                    token: accessToken,
                    expiresIn: env.JWT_EXPIRES_IN,
                },
                refreshToken: {
                    token: refreshToken,
                    expiresIn: env.JWT_EXPIRES_IN_REFRESH,
                },
            });
        } else {
            throw new AppError(320);
        }
    } catch (error) {
        return next(error);
    }
};

// send verification code to user
export const sendVerificationCode = async (req, res, next) => {
    try {
        const user = await auth(req.body.email, req.body.password);

        if (user === null) throw new AppError(317);

        if (user.isDisable === false) throw new AppError(319);

        const addTime =
            env.VERIFICATION_CODE_EXPIRY_TIME_MINUTE -
            env.SEND_VERIFICATION_DELAY_TIME_MINUTE;

        if (
            user.verificationCode.expiresAt >
            Math.floor(Date.now() / 60000) + addTime
        )
            throw new AppError(321);

        const verificationCode = makeSixDigitRandomString();

        sendEmailConfirmation(verificationCode, user.email);

        user.verificationCode.code = verificationCode;

        user.verificationCode.expiresAt =
            Math.floor(Date.now() / 60000) +
            env.VERIFICATION_CODE_EXPIRY_TIME_MINUTE;

        user.save();

        Response.normalizer(req, res, {
            messageCode: 121,
        });
    } catch (error) {
        return next(error);
    }
};

// Read all users
export const readAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        Response.normalizer(req, res, {
            result: users,
            messageCode: 100,
            type: "multi/pagination",
        });
    } catch (error) {
        return next(error);
    }
};

// Read user profile
export const readProfile = async (req, res, next) => {
    try {
        if (req.isAuthenticated === false) {
            throw new AppError(328);
        }
        const user = await User.findById(req.user._id).select([
            "firstName",
            "lastName",
            "email",
            "phoneNumber",
            "createdAt",
        ]);

        Response.normalizer(req, res, {
            result: user,
            messageCode: 100,
        });
    } catch (error) {
        return next(error);
    }
};

// update user profile
export const updateProfile = async (req, res, next) => {
    try {
        if (req.isAuthenticated === false) {
            throw new AppError(328);
        }

        const user = await User.findById(req.user._id);

        let firstName = req.body.firstName
            ? req.body.firstName
            : user.firstName;

        let lastName = req.body.lastName ? req.body.lastName : user.lastName;

        let phoneNumber = req.body.phoneNumber
            ? req.body.phoneNumber
            : user.phoneNumber;

        validation.alpha(lastName);

        validation.alpha(firstName);

        validation.phoneNumber(phoneNumber);

        await user.updateOne(
            {
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber,
            },
            { new: true, useFindAndModify: false }
        );

        const updatedUser = await User.findById(user._id).select([
            "firstName",
            "lastName",
            "email",
            "phoneNumber",
            "createdAt",
        ]);

        Response.normalizer(req, res, {
            result: updatedUser,
            messageCode: 122,
        });
    } catch (error) {
        return next(error);
    }
};

// Change user's password
export const changePassword = async (req, res, next) => {
    try {
        if (req.isAuthenticated === false) {
            throw new AppError(328);
        }

        const user = await auth(req.user.email, req.body.currentPass);

        if (user === null) throw new AppError(322);

        if (req.body.newPass !== req.body.newPassRepeat)
            throw new AppError(323);

        validation.password(req.body.newPass);

        user.password = await Bcrypt.hash(req.body.newPass, 10);

        user.passExpiresAt = null;

        user.save();

        Response.normalizer(req, res, {
            messageCode: 123,
        });
    } catch (error) {
        return next(error);
    }
};

// reset user password
export const resetPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        const addTiem =
            env.TEMPORARY_PASSWORD_EXPIRY_TIME_MINUTE -
            env.SEND_TEMPORARY_PASSWORD_DELAY_TIME_MINUTE;

        if (
            user.passExpiresAt !== null &&
            Math.floor(Date.now() / 60000) + addTiem < user.passExpiresAt
        ) {
            throw new AppError(321);
        }

        const temporaryPass = generatePassword();

        const expiresAt =
            Math.floor(Date.now() / 60000) +
            env.TEMPORARY_PASSWORD_EXPIRY_TIME_MINUTE;

        user.password = await Bcrypt.hash(temporaryPass, 10);

        user.passExpiresAt = expiresAt;

        await user.save();

        sendTemporaryPassword(temporaryPass, user.email);

        Response.normalizer(req, res, {
            messageCode: 124,
        });
    } catch (error) {
        return next(error);
    }
};

// generate access token from refresh token
export const generateAccessToken = async (req, res, next) => {
    try {
        if (req.headers["authorization"] === undefined) throw new AppError(315);

        req.token = req.headers["authorization"].split(" ")[1];

        let tokenId = jwt.verify(req.token, env.JWT_SECRET_REFRESH_TOKEN).user
            ._id;

        await checkToken.refreshToken(tokenId, req.token);

        const user = await User.findById(tokenId);

        const accessToken = jwt.sign({ user }, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN,
        });

        await saveToken(user._id, accessToken, req.token);

        res.json({
            accessToken: { token: accessToken, expiresIn: env.JWT_EXPIRES_IN },
        });
    } catch (error) {
        return next(error);
    }
};

// log out
export const logout = async (req, res, next) => {
    try {
        if (req.headers["authorization"] === undefined) throw new AppError(315);

        req.token = req.headers["authorization"].split(" ")[1];

        let tokenId = jwt.verify(req.token, env.JWT_SECRET).user._id;

        await checkToken.accessToken(tokenId, req.token);

        await removeToken(tokenId);

        Response.normalizer(req, res, {
            messageCode: 131,
        });
    } catch (error) {
        return next(error);
    }
};
