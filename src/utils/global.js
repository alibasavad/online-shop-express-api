import { AppError } from "../handlers/error-handler";
import Category from "../models/category";

export const checkCategoryId = async (categoryIds) => {
    for (let category of categoryIds) {
        // Find the category by its ID
        let check = await Category.findById(category);

        // If the category is null or disabled, throw an error
        if (check === null || check.isDisable === true) {
            throw new AppError(304);
        }
    }
};

export const makeSixDigitRandomString = () => {
    let randomString = "";
    for (let i = 0; i < 6; i++) {
        randomString += Math.floor(Math.random() * 10).toString();
    }
    return randomString;
};
