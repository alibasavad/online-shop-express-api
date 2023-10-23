import User from "../models/user";
import env from "../configs/env.json";
import auth from "../middlewares/auth";
import {
  sendEmailConfirmation,
  sendTemporaryPassword,
} from "../middlewares/smtp";
import generatePassword from "../middlewares/password-generator";
import validation from "../middlewares/data-validation";
import { AppError } from "../handlers/error-handler";

const Response = require("../handlers/response");
const validator = require("validator");
const Bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

export const register = async (req, res, next) => {
  try {
    validation.checkFamilyName(req.body.lastName);

    validation.checkFamilyName(req.body.firstName);

    validation.checkPhoneNumber(req.body.phoneNumber);

    validation.checkPassword(req.body.password);

    let newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
    });

    newUser.verificationCode.code = makeSixDigitRandomString();

    newUser.verificationCode.expiresAt =
      Math.floor(Date.now() / 60000) + env.verification_code_expiry_time_MINUTE;

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
      message: "User Registerd Successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const disableAccount = async (req, res, next) => {
  try {
    const user = await auth(req.body.email, req.body.password);
    if (user === null) throw new AppError(317);
    user.isDisable = true;
    await user.save();

    Response.normalizer(req, res, {
      message:
        "Your account successfully been disabled , you can enable your account by verifing with your email",
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await auth(req.body.email, req.body.password);
    if (user === null) throw new AppError(317);

    if (user.isDisable === true) {
      throw new AppError(318, "please verify your account with your email");
    }

    if (
      user.passExpiresAt !== null &&
      Date.now() / 60000 > user.passExpiresAt
    ) {
      throw new AppError(317, "this password is expired try forget password");
    }

    const token = jwt.sign({ user }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
    res.json({ token: token, expiresIn: env.JWT_EXPIRES_IN });
  } catch (error) {
    return next(error);
  }
};

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

      user.save();

      const token = jwt.sign({ user }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
      });

      res.json({ token: token, expiresIn: env.JWT_EXPIRES_IN });
    } else {
      throw new AppError(320);
    }
  } catch (error) {
    return next(error);
  }
};

export const sendVerificationCode = async (req, res, next) => {
  try {
    const user = await auth(req.body.email, req.body.password);

    if (user === null) throw new AppError(317);
    if (user.isDisable === false) throw new AppError(319);

    const addTime =
      env.verification_code_expiry_time_MINUTE -
      env.send_verification_delay_time_MINUTE;

    if (
      user.verificationCode.expiresAt >
      Math.floor(Date.now() / 60000) + addTime
    )
      throw new AppError(321);

    const verificationCode = makeSixDigitRandomString();

    sendEmailConfirmation(verificationCode, user.email);

    user.verificationCode.code = verificationCode;

    user.verificationCode.expiresAt =
      Math.floor(Date.now() / 60000) + env.verification_code_expiry_time_MINUTE;

    user.save();

    Response.normalizer(req, res, {
      message: "Verification Code sent to your email",
    });
  } catch (error) {
    return next(error);
  }
};

const makeSixDigitRandomString = () => {
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += Math.floor(Math.random() * 10).toString();
  }
  return randomString;
};

export const readAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    Response.normalizer(req, res, {
      result: users,
      message: "fetched data successfully",
      type: "multi/pagination",
    });
  } catch (error) {
    return next(error);
  }
};

export const readProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select([
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "createdAt",
    ]);

    Response.normalizer(req, res, {
      result: user,
      message: "fetched data successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    let firstName = req.body.firstName ? req.body.firstName : user.firstName;

    let lastName = req.body.lastName ? req.body.lastName : user.lastName;

    let phoneNumber = req.body.phoneNumber
      ? req.body.phoneNumber
      : user.phoneNumber;

    validation.checkFamilyName(lastName);

    validation.checkFamilyName(firstName);

    validation.checkPhoneNumber(phoneNumber);

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
      message: "User Updated successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const user = await auth(req.user.email, req.body.currentPass);
    if (user === null) throw new AppError(322);

    if (req.body.newPass !== req.body.newPassRepeat) throw new AppError(323);

    validation.checkPassword(req.body.newPass);

    user.password = await Bcrypt.hash(req.body.newPass, 10);

    user.passExpiresAt = null;

    user.save();

    Response.normalizer(req, res, {
      message: "Password changed successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    const addTiem =
      env.temporary_password_expiry_time_MINUTE -
      env.send_temporary_password_delay_time_MINUTE;

    if (
      user.passExpiresAt !== null &&
      Math.floor(Date.now() / 60000) + addTiem < user.passExpiresAt
    ) {
      throw new AppError(321);
    }

    const temporaryPass = generatePassword();

    const expiresAt =
      Math.floor(Date.now() / 60000) +
      env.temporary_password_expiry_time_MINUTE;

    user.password = await Bcrypt.hash(temporaryPass, 10);
    user.passExpiresAt = expiresAt;

    await user.save();

    sendTemporaryPassword(temporaryPass, user.email);

    Response.normalizer(req, res, {
      message:
        "Your new password sent to your email\nthis password only works for a day\nchange your password in your profile",
    });
  } catch (error) {
    return next(error);
  }
};
