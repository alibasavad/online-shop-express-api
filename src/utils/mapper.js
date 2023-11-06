// map cattegory ids to expected format
export const mapperCategoryId = (list) => {
  let mappedList = [];

  for (let id of list) {
    mappedList.push({ _id: id });
  }

  return mappedList;
};

// map permissions to expected format
export const mapperPermissions = (list) => {
  let mappedList = [];

  for (let permission of list) {
    mappedList.push({ name: permission });
  }

  return mappedList;
};

// map Product Images  to expected format
export const mapperProductImages = (list) => {
  let mappedList = [];
  let mainImageIsAdded = false;

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
