import { AppError } from "../handlers/error-handler";
import { Token } from "../models/token";
import { TokenType } from "../interfaces/index";

/**
 * @description save given tokens to database
 * @param {String} userId
 * @param {String} accessToken
 * @param {String} refreshToken
 * @returns
 */
export const saveToken = async (
    userId: string,
    accessToken: string,
    refreshToken: string
): Promise<TokenType | void> => {
    let token: TokenType | null = await Token.findOne({ user: userId });

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

/**
 * @description remove users's token from database
 * @param {String} userId
 */
export const removeToken = async (userId: string): Promise<void> => {
    let token: TokenType | null = await Token.findOne({ user: userId });
    if (token == null) return;
    token.token = { accessToken: "", refreshToken: "" };
    token.save();
};

// check if token is exist in user's token database
export const checkToken = {
    /**
     *
     * @param {String} userId
     * @param {String} requestToken
     */
    accessToken: async (userId: string, requestToken: string) => {
        const token: TokenType | null = await Token.findOne({ user: userId });
        if (token?.token?.accessToken !== requestToken) throw new AppError(315);
    },
    /**
     *
     * @param {String} userId
     * @param {String} requestToken
     */
    refreshToken: async (userId: string, requestToken: string) => {
        const token: TokenType | null = await Token.findOne({ user: userId });
        if (token?.token?.refreshToken !== requestToken)
            throw new AppError(315);
    },
};
