import {
    CategoryIdsType,
    PermissionListType,
    ProductImagesListType,
} from "../interfaces/index";

/**
 * @description map category ids to wanted format ( [ { id : "categoryId" } ] )
 * @param {Array} list
 * @returns Array
 */
export const mapperCategoryId = (list: string[]): CategoryIdsType => {
    let mappedList: CategoryIdsType = [];

    for (let id of list) {
        mappedList.push({ _id: id });
    }

    return mappedList;
};

/**
 * @description map permission names to wanted format ( [ { name : "permission" } ] )
 * @param {Array} list
 * @returns Array
 */
export const mapperPermissions = (list: string[]): PermissionListType => {
    let mappedList: PermissionListType = [];

    for (let permission of list) {
        mappedList.push({ name: permission });
    }

    return mappedList;
};

/**
 * @description map images to wanted format ( [ { imageURL : "Url" , isMain : Boolean } ] )
 * @param {Array} list
 * @returns Array
 */
export const mapperProductImages = (list: string[]): ProductImagesListType => {
    let mappedList: ProductImagesListType = [];
    let mainImageIsAdded: Boolean = false;

    for (let image of list) {
        let imageJson = { imageURL: image, isMain: false };

        if (!mainImageIsAdded) {
            mainImageIsAdded = true;
            imageJson.isMain = true;
        }

        mappedList.push(imageJson);
    }

    return mappedList;
};
