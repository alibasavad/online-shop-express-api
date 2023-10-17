import User from "../models/user";
import env from "../configs/env.json";
import auth from "../middlewares/auth";
import {
  sendEmailConfirmation,
  sendTemporaryPassword,
} from "../middlewares/smtp";
import generatePassword from "../middlewares/password-generator";

const validator = require("validator");
const Bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

export const register = async (req, res, next) => {
  try {
    if (req.body.password.length < 8) {
      return res.send("password must contain 8 or more characters");
    }

    let newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
    });

    newUser.verificationCode = makeSixDigitRandomString();

    newUser.password = await Bcrypt.hash(req.body.password, 10);

    await newUser.save();

    sendEmailConfirmation(newUser.verificationCode, newUser.email);

    const user = await User.findById(newUser._id).select([
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "createdAt",
    ]);

    res.json(user);
  } catch (error) {
    res.send(error);
  }
};

export const disableAccount = async (req, res, next) => {
  try {
    const user = await auth(req.body.email, req.body.password);
    if (user === null) return res.send("email or password is wrong");
    user.isDisable = true;
    await user.save();
    res.send(
      "Your account successfully been disabled , you can enable your account by verifing with your email"
    );
  } catch (error) {
    res.send(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await auth(req.body.email, req.body.password);
    if (user === null) return res.send("email or password is wrong");

    if (user.isDisable === true) {
      return res.send("please verify your account with your email");
    }

    if (
      user.passExpiresAt !== null &&
      Date.now() / 60000 > user.passExpiresAt
    ) {
      return res.send("this password is expired try forget password");
    }

    const token = jwt.sign({ user }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
    res.json({ token: token, expiresIn: env.JWT_EXPIRES_IN });
  } catch (error) {
    res.send(error);
  }
};

export const verifyAccount = async (req, res, next) => {
  try {
    const user = await auth(req.body.email, req.body.password);

    if (user === null) return res.send("email or password is wrong");
    if (user.isDisable === false) return res.send("You Are Verified");

    const check = user.verificationCode === req.body.verificationCode;

    if (check) {
      user.isDisable = false;

      user.save();

      const token = jwt.sign({ user }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
      });

      res.json({ token: token, expiresIn: env.JWT_EXPIRES_IN });
    } else {
      res.send("Verification code is incorrect");
    }
  } catch (error) {
    res.send(error);
  }
};

export const sendVerificationCode = async (req, res, next) => {
  try {
    const user = await auth(req.body.email, req.body.password);

    if (user === null) return res.send("email or password is wrong");
    if (user.isDisable === false) return res.send("You Are Verified");
    const verificationCode = makeSixDigitRandomString();

    sendEmailConfirmation(verificationCode, user.email);

    user.verificationCode = verificationCode;

    user.save();

    res.send("Verification Code sent to your email");
  } catch (error) {
    res.send(error);
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
    res.json(users);
  } catch (error) {
    res.send(error);
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

    res.json(user);
  } catch (error) {
    res.send(error);
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

    res.json(updatedUser);
  } catch (error) {
    res.send(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const user = await auth(req.user.email, req.body.currentPass);
    if (user === null) return res.send("Current password is wrong");

    if (req.body.newPass !== req.body.newPassRepeat)
      return res.send("newPassRepeat is incorrect");

    if (req.body.newPass.length < 8) {
      return res.send("password must contain 8 or more characters");
    }

    user.password = await Bcrypt.hash(req.body.newPass, 10);

    user.passExpiresAt = null;

    user.save();

    res.send("Password changed successfully");
  } catch (error) {
    res.send(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (
      user.passExpiresAt !== null &&
      Date.now() / 60000 < user.passExpiresAt
    ) {
      return res.send("wait a day to use this service again");
    }

    const temporaryPass = generatePassword();

    const expiresAt = Math.floor(Date.now() / 60000) + 1440;

    user.password = await Bcrypt.hash(temporaryPass, 10);
    user.passExpiresAt = expiresAt;

    await user.save();

    sendTemporaryPassword(temporaryPass, user.email);

    res.send(
      "Your new password sent to your email\nthis password only works for a day\nchange your password in your profile"
    );
  } catch (error) {
    res.send(error);
  }
};
