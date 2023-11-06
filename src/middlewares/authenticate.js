import User from "../models/user";
import env from "../configs/env.json";
import { AppError } from "../handlers/error-handler";
import { checkToken } from "../utils/token";

const jwt = require("jsonwebtoken");

// Check permission for a user
export const authenticate = async (req, res, next) => {
  try {
    req.isAuthenticated = false;
    // Check if the authorization header is present
    if (req.headers["authorization"] === undefined) return next();

    // Extract the token from the authorization header
    req.token = req.headers["authorization"].split(" ")[1];

    // Verify the token and get the user ID from it
    let tokenId = jwt.verify(req.token, env.JWT_SECRET).user._id;

    // Find the user by the user ID
    req.user = await User.findById(tokenId);

    // If the user is disabled, throw an error
    if (req.user.isDisable === true) throw new AppError(327);

    // Check if the access token is valid for the user
    await checkToken.accessToken(req.user._id, req.token);

    req.isAuthenticated = true;

    next();
  } catch (error) {
    return next(error);
  }
};
