import Bcrypt from "bcryptjs";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import env from "../configs/env.json";
import { AppError } from "../handlers/error-handler";
import { normalizer } from "../handlers/response";
import {
    JwtType,
    RequestType,
    UserResponseType,
    UserType,
} from "../interfaces/index";
import { User } from "../models/user";
import auth from "../utils/auth";
import validation from "../utils/data-validation";
import { makeSixDigitRandomString } from "../utils/global";
import generatePassword from "../utils/password-generator";
import { sendEmailConfirmation, sendTemporaryPassword } from "../utils/smtp";
import { checkToken, removeToken, saveToken } from "../utils/token";

// Register a new user
export const register = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        validation.alpha(req.body.lastName);

        validation.alpha(req.body.firstName);

        validation.phoneNumber(req.body.phoneNumber);

        validation.password(req.body.password);

        let newUser: UserType = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
        });

        newUser.verificationCode = {};

        newUser.verificationCode.code = makeSixDigitRandomString();

        newUser.verificationCode.expiresAt =
            Math.floor(Date.now() / 60000) +
            env.VERIFICATION_CODE_EXPIRY_TIME_MINUTE;

        newUser.password = await Bcrypt.hash(req.body.password, 10);

        await newUser.save();

        sendEmailConfirmation(newUser.verificationCode.code, newUser.email);

        const user: UserResponseType = await User.findById(newUser._id).select([
            "firstName",
            "lastName",
            "email",
            "phoneNumber",
            "createdAt",
        ]);

        normalizer(req, res, {
            result: user,
            messageCode: 117,
        });
    } catch (error) {
        return next(error);
    }
};

// Disable a user account
export const disableAccount = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user: UserType | null = await auth(
            req.body.email,
            req.body.password
        );

        if (user === null) throw new AppError(317);

        user.isDisable = true;

        await user.save();

        normalizer(req, res, {
            messageCode: 118,
        });
    } catch (error) {
        return next(error);
    }
};

// User login
export const login = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user: UserType | null = await auth(
            req.body.email,
            req.body.password
        );

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
export const verifyAccount = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user: UserType | null = await auth(
            req.body.email,
            req.body.password
        );

        if (user === null || user.verificationCode?.expiresAt === undefined)
            throw new AppError(317);

        if (user.isDisable === false) throw new AppError(319);

        const check: boolean =
            user.verificationCode.code === req.body.verificationCode;

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
export const sendVerificationCode = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user: UserType | null = await auth(
            req.body.email,
            req.body.password
        );

        if (user === null || user.verificationCode?.expiresAt === undefined)
            throw new AppError(317);

        if (user.isDisable === false) throw new AppError(319);

        const addTime: number =
            env.VERIFICATION_CODE_EXPIRY_TIME_MINUTE -
            env.SEND_VERIFICATION_DELAY_TIME_MINUTE;

        if (
            user.verificationCode.expiresAt >
            Math.floor(Date.now() / 60000) + addTime
        )
            throw new AppError(321);

        const verificationCode: string = makeSixDigitRandomString();

        sendEmailConfirmation(verificationCode, user.email);

        user.verificationCode.code = verificationCode;

        user.verificationCode.expiresAt =
            Math.floor(Date.now() / 60000) +
            env.VERIFICATION_CODE_EXPIRY_TIME_MINUTE;

        user.save();

        normalizer(req, res, {
            messageCode: 121,
        });
    } catch (error) {
        return next(error);
    }
};

// Read all users
export const readAllUsers = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const users: UserType[] | null = await User.find();

        normalizer(req, res, {
            result: users,
            messageCode: 100,
            type: "multi/pagination",
        });
    } catch (error) {
        return next(error);
    }
};

// Read user profile
export const readProfile = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (req.isAuthenticated === false) {
            throw new AppError(328);
        }
        const user: UserResponseType = await User.findById(
            req.user?._id
        ).select([
            "firstName",
            "lastName",
            "email",
            "phoneNumber",
            "createdAt",
        ]);

        normalizer(req, res, {
            result: user,
            messageCode: 100,
        });
    } catch (error) {
        return next(error);
    }
};

// update user profile
export const updateProfile = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (req.isAuthenticated === false) {
            throw new AppError(328);
        }

        const user: UserType | null = await User.findById(req.user?._id);

        let firstName: string = req.body.firstName
            ? req.body.firstName
            : user?.firstName;

        let lastName: string = req.body.lastName
            ? req.body.lastName
            : user?.lastName;

        let phoneNumber: string = req.body.phoneNumber
            ? req.body.phoneNumber
            : user?.phoneNumber;

        validation.alpha(lastName);

        validation.alpha(firstName);

        validation.phoneNumber(phoneNumber);

        await user?.updateOne(
            {
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber,
            },
            { new: true, useFindAndModify: false }
        );

        const updatedUser: UserResponseType = await User.findById(
            user?._id
        ).select([
            "firstName",
            "lastName",
            "email",
            "phoneNumber",
            "createdAt",
        ]);

        normalizer(req, res, {
            result: updatedUser,
            messageCode: 122,
        });
    } catch (error) {
        return next(error);
    }
};

// Change user's password
export const changePassword = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (req.isAuthenticated === false || req.user === null) {
            throw new AppError(328);
        }

        const user: UserType | null = await auth(
            req.user.email,
            req.body.currentPass
        );

        if (user === null) throw new AppError(322);

        if (req.body.newPass !== req.body.newPassRepeat)
            throw new AppError(323);

        validation.password(req.body.newPass);

        user.password = await Bcrypt.hash(req.body.newPass, 10);

        user.passExpiresAt = 0;

        user.save();

        normalizer(req, res, {
            messageCode: 123,
        });
    } catch (error) {
        return next(error);
    }
};

// reset user password
export const resetPassword = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user: UserType | null = await User.findOne({
            email: req.body.email,
        });

        if (user === null) throw new AppError(322);

        const addTiem =
            env.TEMPORARY_PASSWORD_EXPIRY_TIME_MINUTE -
            env.SEND_TEMPORARY_PASSWORD_DELAY_TIME_MINUTE;

        if (
            user.passExpiresAt !== null &&
            Math.floor(Date.now() / 60000) + addTiem < user.passExpiresAt
        ) {
            throw new AppError(321);
        }

        const temporaryPass: string = generatePassword();

        const expiresAt =
            Math.floor(Date.now() / 60000) +
            env.TEMPORARY_PASSWORD_EXPIRY_TIME_MINUTE;

        user.password = await Bcrypt.hash(temporaryPass, 10);

        user.passExpiresAt = expiresAt;

        await user.save();

        sendTemporaryPassword(temporaryPass, user.email);

        normalizer(req, res, {
            messageCode: 124,
        });
    } catch (error) {
        return next(error);
    }
};

// generate access token from refresh token
export const generateAccessToken = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (req.headers["authorization"] === undefined) throw new AppError(315);

        req.token = req.headers["authorization"].split(" ")[1];

        let tokenId: string = (
            jwt.verify(req.token, env.JWT_SECRET_REFRESH_TOKEN) as JwtType
        ).user._id;

        await checkToken.refreshToken(tokenId, req.token);

        const user: UserType | null = await User.findById(tokenId);

        const accessToken: string = jwt.sign({ user }, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN,
        });

        await saveToken(user?._id, accessToken, req.token);

        res.json({
            accessToken: { token: accessToken, expiresIn: env.JWT_EXPIRES_IN },
        });
    } catch (error) {
        return next(error);
    }
};

// log out
export const logout = async (
    req: RequestType,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (req.headers["authorization"] === undefined) throw new AppError(315);

        req.token = req.headers["authorization"].split(" ")[1];

        let tokenId = (jwt.verify(req.token, env.JWT_SECRET) as JwtType).user
            ._id;

        await checkToken.accessToken(tokenId, req.token);

        await removeToken(tokenId);

        normalizer(req, res, {
            messageCode: 131,
        });
    } catch (error) {
        return next(error);
    }
};
