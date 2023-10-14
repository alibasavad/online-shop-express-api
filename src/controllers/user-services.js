import User from "../models/user";
import env from "../configs/env.json";
import auth from "../middlewares/auth";
import { sendEmailConfirmation } from "../middlewares/smtp";

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

    const token = jwt.sign({ user }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
    res.json(token);
  } catch (error) {
    res.send(error);
  }
};

export const verifyAccount = async (req, res, next) => {
  try {
    const user = await auth(req.body.email, req.body.password);

    if (user === null) return res.send("email or password is wrong");

    const check = user.verificationCode === req.body.verificationCode;

    if (check) {
      user.isDisable = false;

      user.save();

      res.send("User Verificated Successfully");
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
