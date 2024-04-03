import { AppError } from "../handlers/error-handler";
import { Category } from "../models/category";
import { CategoryType, CategoryIdsType } from "../interfaces/index";

// removing a value from array
export function remove<T>(arr: T[], val: T) {
    return arr.filter((x) => {
        if (x !== val) return x;
    });
}

/**
 * @description check category ids to be valid
 * @param {String[]} categoryIds
 */
export const checkCategoryId = async (
    categoryIds: CategoryIdsType
): Promise<void> => {
    for (let category of categoryIds) {
        let check: CategoryType | null = await Category.findById(category);

        if (check === null || check.isDisable === true) {
            throw new AppError(304);
        }
    }
};

/**
 * @description generate a string for user verification
 * @returns String
 */
export const makeSixDigitRandomString = (): string => {
    let randomString = "";
    for (let i = 0; i < 6; i++) {
        randomString += Math.floor(Math.random() * 10).toString();
    }
    return randomString;
};
