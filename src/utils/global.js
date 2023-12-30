import { AppError } from "../handlers/error-handler";
import Category from "../models/category";

/**
 * @description check category ids to be valid
 * @param {String} categoryIds
 */
export const checkCategoryId = async (categoryIds) => {
    for (let category of categoryIds) {
        let check = await Category.findById(category);

        if (check === null || check.isDisable === true) {
            throw new AppError(304);
        }
    }
};

/**
 * @description generate a string for user verification
 * @returns String
 */
export const makeSixDigitRandomString = () => {
    let randomString = "";
    for (let i = 0; i < 6; i++) {
        randomString += Math.floor(Math.random() * 10).toString();
    }
    return randomString;
};
