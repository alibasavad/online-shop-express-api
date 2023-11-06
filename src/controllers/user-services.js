import User from "../models/user";
import env from "../configs/env.json";
import auth from "../utils/auth";
import { sendEmailConfirmation, sendTemporaryPassword } from "../utils/smtp";
import generatePassword from "../utils/password-generator";
import validation from "../utils/data-validation";
import { AppError } from "../handlers/error-handler";
import { checkToken, removeToken, saveToken } from "../utils/token";
import { makeSixDigitRandomString } from "../utils/global";

const Response = require("../handlers/response");
const validator = require("validator");
const Bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new user
export const register = async (req, res, next) => {
  try {
    // Validate the last name using the alpha validation function
    validation.alpha(req.body.lastName);

    // Validate the first name using the alpha validation function
    validation.alpha(req.body.firstName);

    // Validate the phone number using the phoneNumber validation function
    validation.phoneNumber(req.body.phoneNumber);

    // Validate the password using the password validation function
    validation.password(req.body.password);

    // Create a new User object with the provided user information
    let newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
    });

    // Generate a six-digit random verification code and set it to the newUser object
    newUser.verificationCode.code = makeSixDigitRandomString();

    // Set the expiration time for the verification code
    newUser.verificationCode.expiresAt =
      Math.floor(Date.now() / 60000) + env.VERIFICATION_CODE_EXPIRY_TIME_MINUTE;

    // Hash the password using bcrypt and set it to the newUser object
    newUser.password = await Bcrypt.hash(req.body.password, 10);

    // Save the newUser object to the database
    await newUser.save();

    // Send an email confirmation with the verification code to the user's email address
    sendEmailConfirmation(newUser.verificationCode.code, newUser.email);

    // Find the newly registered user by their ID and select specific fields to return in the response
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
    // Authenticate the user with the provided email and password
    const user = await auth(req.body.email, req.body.password);

    // If the user is not found, throw an error
    if (user === null) throw new AppError(317);

    // Set the isDisable property of the user to true
    user.isDisable = true;

    // Save the updated user object to the database
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
    // Authenticate the user with the provided email and password
    const user = await auth(req.body.email, req.body.password);

    // If the user is not found, throw an error
    if (user === null) throw new AppError(317);

    // If the user account is disabled, throw an error
    if (user.isDisable === true) {
      throw new AppError(318, 119);
    }

    // If the password has expired, throw an error
    if (
      user.passExpiresAt !== null &&
      Date.now() / 60000 > user.passExpiresAt
    ) {
      throw new AppError(317, 120);
    }

    // Generate an access token using JWT and the user object, and set the expiration time
    const accessToken = jwt.sign({ user }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    // Generate a refresh token using JWT and the user object, and set the expiration time
    const refreshToken = jwt.sign({ user }, env.JWT_SECRET_REFRESH_TOKEN, {
      expiresIn: env.JWT_EXPIRES_IN_REFRESH,
    });

    // Save the access token and refresh token to the database
    await saveToken(user._id, accessToken, refreshToken);

    // Save the updated user object to the database
    user.save();

    // Return the access token and refresh token in the response
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
    // Authenticate the user with the provided email and password
    const user = await auth(req.body.email, req.body.password);

    // If the user is not found, throw an error
    if (user === null) throw new AppError(317);

    // If the user account is disabled, throw an error
    if (user.isDisable === false) throw new AppError(319);

    // check if user verification code is equal to given verification code
    const check = user.verificationCode.code === req.body.verificationCode;

    // check the expiration time for the verification code and throw error if its expired
    if (user.verificationCode.expiresAt < Math.floor(Date.now() / 60000)) {
      throw new AppError(320);
    }

    // if user verification code is equal to given verification code do below
    if (check) {
      // Set the isDisable property of the user to false
      user.isDisable = false;

      // Generate an access token using JWT and the user object, and set the expiration time
      const accessToken = jwt.sign({ user }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
      });

      // Generate a refresh token using JWT and the user object, and set the expiration time
      const refreshToken = jwt.sign({ user }, env.JWT_SECRET_REFRESH_TOKEN, {
        expiresIn: env.JWT_EXPIRES_IN_REFRESH,
      });

      // Save the access token and refresh token to the database
      await saveToken(user._id, accessToken, refreshToken);

      // Save the updated user object to the database
      user.save();

      // Return the access token and refresh token in the response
      res.json({
        accessToken: { token: accessToken, expiresIn: env.JWT_EXPIRES_IN },
        refreshToken: {
          token: refreshToken,
          expiresIn: env.JWT_EXPIRES_IN_REFRESH,
        },
      });
    } else {
      // throw error if verification code is not equal to given verification code
      throw new AppError(320);
    }
  } catch (error) {
    return next(error);
  }
};

// send verification code to user
export const sendVerificationCode = async (req, res, next) => {
  try {
    // Authenticate the user with the provided email and password
    const user = await auth(req.body.email, req.body.password);

    // If the user is not found, throw an error
    if (user === null) throw new AppError(317);

    // If the user account is disabled, throw an error
    if (user.isDisable === false) throw new AppError(319);

    // check if user can use this service and throw if user using this service Continuous
    const addTime =
      env.VERIFICATION_CODE_EXPIRY_TIME_MINUTE -
      env.SEND_VERIFICATION_DELAY_TIME_MINUTE;

    if (
      user.verificationCode.expiresAt >
      Math.floor(Date.now() / 60000) + addTime
    )
      throw new AppError(321);

    // Generate a six-digit random verification code and set it to the newUser object
    const verificationCode = makeSixDigitRandomString();

    // Send an email confirmation with the verification code to the user's email address
    sendEmailConfirmation(verificationCode, user.email);

    // Update the user's verification code with the new verification code name
    user.verificationCode.code = verificationCode;

    // Set the expiration time for the verification code
    user.verificationCode.expiresAt =
      Math.floor(Date.now() / 60000) + env.VERIFICATION_CODE_EXPIRY_TIME_MINUTE;

    // Save the newUser object to the database
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
    // Find all users
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
    // Find user by their ID and select specific fields to return in the response
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

    // Find user by their ID
    const user = await User.findById(req.user._id);

    // Set the first name to the updated first name if provided, otherwise use the current first name
    let firstName = req.body.firstName ? req.body.firstName : user.firstName;

    // Set the last name to the updated last name if provided, otherwise use the current last name
    let lastName = req.body.lastName ? req.body.lastName : user.lastName;

    // Set the phone number to the updated phone number if provided, otherwise use the current phone number
    let phoneNumber = req.body.phoneNumber
      ? req.body.phoneNumber
      : user.phoneNumber;

    // Validate the last name using the alpha validation function
    validation.alpha(lastName);

    // Validate the first name using the alpha validation function
    validation.alpha(firstName);

    // Validate the phone number using the phoneNumber validation function
    validation.phoneNumber(phoneNumber);

    // Update the user's first name , last name , phone number with the updated first name , last name , phone number
    await user.updateOne(
      {
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
      },
      { new: true, useFindAndModify: false }
    );

    // Find the newly updated user by their ID and select specific fields to return in the response
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

    // Authenticate the user with the provided email and password
    const user = await auth(req.user.email, req.body.currentPass);

    // If the user is not found, throw an error
    if (user === null) throw new AppError(322);

    // throw error if new pass is not equal to new pass repeat
    if (req.body.newPass !== req.body.newPassRepeat) throw new AppError(323);

    // Validate the password using the password validation function
    validation.password(req.body.newPass);

    // Hash the password using bcrypt and set it to the newUser object
    user.password = await Bcrypt.hash(req.body.newPass, 10);

    // set password expiration time to null
    user.passExpiresAt = null;

    // Save the user object to the database
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
    // find user by its email
    const user = await User.findOne({ email: req.body.email });

    // check if user can use this service and throw if user using this service Continuous
    const addTiem =
      env.TEMPORARY_PASSWORD_EXPIRY_TIME_MINUTE -
      env.SEND_TEMPORARY_PASSWORD_DELAY_TIME_MINUTE;

    if (
      user.passExpiresAt !== null &&
      Math.floor(Date.now() / 60000) + addTiem < user.passExpiresAt
    ) {
      throw new AppError(321);
    }

    // generate a temporary password
    const temporaryPass = generatePassword();

    // set expiration time for generated password
    const expiresAt =
      Math.floor(Date.now() / 60000) +
      env.TEMPORARY_PASSWORD_EXPIRY_TIME_MINUTE;

    // Hash the password using bcrypt and set it to the user object
    user.password = await Bcrypt.hash(temporaryPass, 10);

    // set password expiry time to user object
    user.passExpiresAt = expiresAt;

    // Save the User object to the database
    await user.save();

    // Send an email with the temporary password to the user's email address
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
    // Check if the authorization header is present
    if (req.headers["authorization"] === undefined) throw new AppError(315);

    // Extract the token from the authorization header
    req.token = req.headers["authorization"].split(" ")[1];

    // Verify the token and get the user ID from it
    let tokenId = jwt.verify(req.token, env.JWT_SECRET_REFRESH_TOKEN).user._id;

    // Check if the refresh token is valid for the user
    await checkToken.refreshToken(tokenId, req.token);

    // Find the user by the user ID
    const user = await User.findById(tokenId);

    // Generate an access token using JWT and the user object, and set the expiration time
    const accessToken = jwt.sign({ user }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    // Save the access token and refresh token to the database
    await saveToken(user._id, accessToken, req.token);

    // Return the access token in the response
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
    // Check if the authorization header is present
    if (req.headers["authorization"] === undefined) throw new AppError(315);

    // Extract the token from the authorization header
    req.token = req.headers["authorization"].split(" ")[1];

    // Verify the token and get the user ID from it
    let tokenId = jwt.verify(req.token, env.JWT_SECRET).user._id;

    // Check if the access token is valid for the user
    await checkToken.accessToken(tokenId, req.token);

    // remove user's token from database
    await removeToken(tokenId);

    Response.normalizer(req, res, {
      messageCode: 131,
    });
  } catch (error) {
    return next(error);
  }
};
