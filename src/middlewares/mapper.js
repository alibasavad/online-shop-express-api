export const mapperCategoryId = (list) => {
  let mappedList = [];

  for (let id of list) {
    mappedList.push({ _id: id });
  }

  return mappedList;
};

export const mapperPermissions = (list) => {
  let mappedList = [];

  for (let permission of list) {
    mappedList.push({ name: permission });
  }

  return mappedList;
};

export const mapperProductImages = (list) => {
  let mappedList = [];
  let mainImageIsAdded = false;

  for (let image of list) {
    let imageJson = { imageURL: image.filename, isMain: false };

    if (image.fieldname === "main" && !mainImageIsAdded) {
      mainImageIsAdded = true;
      imageJson.isMain = true;
    }

    mappedList.push(imageJson);
  }

  if (!mainImageIsAdded) mappedList[0].isMain = true;

  return mappedList;
};

export const mapperCategoryImages = (list) => {
  
  return mappedList;
};
