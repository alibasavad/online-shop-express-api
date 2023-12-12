import { AppError } from "../handlers/error-handler";
import Token from "../models/token";

// save given tokens to database
export const saveToken = async (userId, accessToken, refreshToken) => {
    let token = await Token.findOne({ user: userId });

    if (token === null) {
        token = new Token({
            token: {
                accessToken: accessToken,
                refreshToken: refreshToken,
            },
            user: userId,
        });
        return token.save();
    }
    token.token = { accessToken: accessToken, refreshToken: refreshToken };
    token.save();
};

// remove users's token from database
export const removeToken = async (userId) => {
    let token = await Token.findOne({ user: userId });
    token.token = { accessToken: "", refreshToken: "" };
    token.save();
};

// check if token is exist in user's token database
export const checkToken = {
    accessToken: async (userId, requestToken) => {
        const token = await Token.findOne({ user: userId });
        if (token.token.accessToken !== requestToken) throw new AppError(315);
    },
    refreshToken: async (userId, requestToken) => {
        const token = await Token.findOne({ user: userId });
        if (token.token.refreshToken !== requestToken) throw new AppError(315);
    },
};
